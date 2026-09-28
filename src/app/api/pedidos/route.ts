import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dispararWebhook } from "@/lib/webhook";
import { currentActor } from "@/lib/api-access";
import { readReferral, resolveReferral, validTrackingId, VISITOR_COOKIE } from "@/lib/tracking";
import { aggregateItems, cents, discountCents, pedidoInput, priceField } from "@/lib/order-rules";
import { cotarFrete } from "@/lib/frete";

async function GETHandler(req: NextRequest) {
  const actor=await currentActor(req);
  if(!actor)return NextResponse.json({erro:"Não autenticado."},{status:401});
  const status=req.nextUrl.searchParams.get("status"),catalogo=req.nextUrl.searchParams.get("catalogo");
  if((status&&!["PENDENTE","CONFIRMADO","SEPARANDO","ENVIADO","CONCLUIDO","CANCELADO"].includes(status))||(catalogo&&!["VAREJO","ATACADO","FABRICA"].includes(catalogo)))return NextResponse.json({erro:"Filtro inválido."},{status:400});
  if(actor.perfil==="VENDEDOR"&&!actor.vendedor?.id)return NextResponse.json({erro:"Sem permissão."},{status:403});
  return NextResponse.json(await prisma.pedido.findMany({
    where:{...(actor.perfil==="VENDEDOR"?{vendedorId:actor.vendedor!.id}:{}),...(status?{status:status as any}:{}),...(catalogo?{catalogo:catalogo as any}:{})},
    include:{cliente:true,vendedor:{select:{id:true,slug:true,telefone:true,usuario:{select:{nome:true}}}},itens:{include:{variante:{include:{produto:true,cor:true,gradeItem:true}}}},lojaRetirada:true,excursao:{select:{id:true,nome:true}}},
    orderBy:{criadoEm:"desc"},
  }));
}
class CheckoutError extends Error { constructor(message:string,public status=400,public extra:object={}){super(message);} }
async function POSTHandler(req:NextRequest){
  const parsed=pedidoInput.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({erro:"Confira os dados do pedido e as quantidades."},{status:400});
  const b=parsed.data;
  const visitanteId=validTrackingId(req.cookies.get(VISITOR_COOKIE)?.value);
  const existing=await prisma.pedido.findUnique({where:{chaveCheckout:b.chaveCheckout}});
  if(existing){
    if(existing.visitanteId!==visitanteId)return NextResponse.json({erro:"Identificador de pedido já utilizado."},{status:409});
    return NextResponse.json({id:existing.id,numero:existing.numero,total:Number(existing.total)});
  }
  const items=aggregateItems(b.itens);
  const referral=await resolveReferral(await readReferral(req),b.catalogo);
  const seller=referral?.vendedor??(b.vendedorId?await prisma.vendedor.findFirst({
    where:{id:b.vendedorId,ativo:true,usuario:{ativo:true,perfil:{not:"AFILIADO"}},links:{some:{catalogo:b.catalogo,ativo:true}}},
    select:{id:true,telefone:true,links:{where:{catalogo:b.catalogo,ativo:true},select:{id:true}}},
  }):null);
  if(!seller&&b.vendedorId)return NextResponse.json({erro:"Vendedor indisponível para este catálogo."},{status:400});
  let freightQuote:number|null=null;
  try{
    if(b.tipoEnvio==="CORREIOS"){
      let address:any;
      try{address=JSON.parse(b.enderecoEntrega??"");}catch{throw new CheckoutError("Endereço inválido.");}
      if(typeof address?.cep!=="string"||!/^\d{8}$/.test(address.cep.replace(/\D/g,""))||!address.rua||!address.numero||!address.cidade)throw new CheckoutError("Preencha o endereço de entrega.");
      const [prior,coupon]=await Promise.all([prisma.pedido.count({where:{telefoneClienteAvulso:b.telefoneCliente,status:{not:"CANCELADO"}}}),b.cupomCodigo?prisma.cupom.findUnique({where:{codigo:b.cupomCodigo}}):null]);
      if(prior>0&&coupon?.tipo!=="FRETE_GRATIS"){
        const variants=await prisma.produtoVariante.findMany({where:{id:{in:items.map(i=>i.varianteId)}},include:{produto:true}});
        if(variants.length!==items.length)throw new CheckoutError("Produto indisponível.");
        const quotes=await cotarFrete(address.cep.replace(/\D/g,""),items.map(i=>{const p=variants.find(v=>v.id===i.varianteId)!.produto;return{...p,quantidade:i.quantidade,precoUnitario:Number((p as any)[priceField(b.catalogo,b.formaPagamento)])};}));
        const quote=quotes.find(q=>q.id===b.servicoFreteId);
        if(!quote)throw new CheckoutError("Selecione uma opção válida de frete.");
        freightQuote=quote.preco;
      }
    }
    let result:{pedido:any;created:boolean}|undefined;
    for(let attempt=0;attempt<3;attempt++){
      try{
        result=await prisma.$transaction(async tx=>{
          const duplicate=await tx.pedido.findUnique({where:{chaveCheckout:b.chaveCheckout}});
          if(duplicate){if(duplicate.visitanteId!==visitanteId)throw new CheckoutError("Identificador já utilizado.",409);return{pedido:duplicate,created:false};}
          const config=await tx.configuracaoGeral.findFirst();
          const minimum=b.catalogo==="ATACADO"?(config?.qtdMinimaAtacado??15):b.catalogo==="FABRICA"?(config?.qtdMinimaFabrica??40):1;
          if(items.reduce((n,i)=>n+i.quantidade,0)<minimum)throw new CheckoutError("Pedido mínimo de "+minimum+" peças.");
          const variants=await tx.produtoVariante.findMany({where:{id:{in:items.map(i=>i.varianteId)},ativo:true,produto:{ativo:true},cor:{ativo:true}},include:{produto:true,estoque:true}});
          if(variants.length!==items.length)throw new CheckoutError("Há produtos indisponíveis no carrinho.");
          const unavailable=items.flatMap(i=>{const e=variants.find(v=>v.id===i.varianteId)!.estoque;const available=Math.max(0,(e?.quantidade??0)-(e?.pendente??0));return available<i.quantidade?[{varianteId:i.varianteId,disponivel:available,solicitado:i.quantidade}]:[];});
          if(unavailable.length)throw new CheckoutError("Estoque insuficiente.",409,{itensInsuficientes:unavailable});
          const priced=items.map(i=>{
            const value=cents((variants.find(v=>v.id===i.varianteId)!.produto as any)[priceField(b.catalogo,b.formaPagamento)]);
            if(!Number.isSafeInteger(value)||value<=0)throw new CheckoutError("Produto sem preço válido.");
            return{...i,precoUnitario:value/100,subtotal:value*i.quantidade/100};
          });
          const subtotal=priced.reduce((n,i)=>n+cents(i.subtotal),0);
          const coupon=b.cupomCodigo?await tx.cupom.findUnique({where:{codigo:b.cupomCodigo}}):null;
          if(b.cupomCodigo&&(!coupon||!coupon.ativo||(coupon.validade&&coupon.validade<new Date())||(coupon.usoMaximo!==null&&coupon.usoAtual>=coupon.usoMaximo)))throw new CheckoutError("Cupom inválido, expirado ou esgotado.");
          let freight=0;
          if(b.tipoEnvio==="RETIRADA_LOJA"){
            if(!b.lojaRetiradaId||!await tx.loja.findFirst({where:{id:b.lojaRetiradaId,ativo:true}}))throw new CheckoutError("Selecione uma loja válida.");
          }else if(b.tipoEnvio==="EXCURSAO"){
            if(!b.excursaoTexto)throw new CheckoutError("Informe os dados da excursão.");
            freight=cents(config?.taxaExcursao??5);
          }else if(coupon?.tipo!=="FRETE_GRATIS"){
            const prior=await tx.pedido.count({where:{telefoneClienteAvulso:b.telefoneCliente,status:{not:"CANCELADO"}}});
            if(prior>0){if(freightQuote===null)throw new CheckoutError("Atualize a cotação de frete.",409);freight=cents(freightQuote);}
          }
          if(coupon?.tipo==="FRETE_GRATIS")freight=0;
          const discount=discountCents(subtotal,coupon?.tipo,coupon?.valor);
          const total=subtotal+freight-discount;
          if(cents(b.total)!==total)throw new CheckoutError("Os valores foram atualizados. Recarregue o carrinho e confira o total antes de confirmar.",409,{totalAtualizado:total/100, itensAtualizados: variants.map(v=>({varianteId:v.id,precoVista:Number((v.produto as any)[priceField(b.catalogo,"VISTA")]),precoPrazo:Number((v.produto as any)[priceField(b.catalogo,"PRAZO")])}))});
          if(coupon)await tx.cupom.update({where:{id:coupon.id},data:{usoAtual:{increment:1}}});
          const pedido=await tx.pedido.create({data:{
            catalogo:b.catalogo,vendedorId:seller?.id??null,linkVendedorId:seller?.links[0]?.id??null,afiliadoId:referral?.afiliadoId??null,
            visitanteId,chaveCheckout:b.chaveCheckout,origemRastreamento:referral?.ref.tipo==="VENDEDOR"?"LINK_VENDEDOR":referral?.ref.tipo==="AFILIADO"?"LINK_AFILIADO":seller?"SELECAO_CHECKOUT":"DIRETO",
            nomeClienteAvulso:b.nomeCliente,telefoneClienteAvulso:b.telefoneCliente,tipoEnvio:b.tipoEnvio,lojaRetiradaId:b.tipoEnvio==="RETIRADA_LOJA"?b.lojaRetiradaId:null,
            excursaoTexto:b.tipoEnvio==="EXCURSAO"?b.excursaoTexto:null,enderecoEntrega:b.tipoEnvio==="CORREIOS"?b.enderecoEntrega:null,
            valorFrete:freight/100,cupomId:coupon?.id??null,desconto:discount/100,formaPagamento:b.formaPagamento,total:total/100,obs:b.obs??null,status:"PENDENTE",itens:{create:priced},
          }});
          for(const item of items)await tx.estoque.update({where:{varianteId:item.varianteId},data:{pendente:{increment:item.quantidade}}});
          return{pedido,created:true};
        },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,maxWait:5000,timeout:15000});
        break;
      }catch(e:any){if(["P2034","P2002"].includes(e?.code)&&attempt<2)continue;throw e;}
    }
    if(!result)throw new Error("Falha ao finalizar pedido");
    if(result.created)await dispararWebhook("pedido.criado",{numero:result.pedido.numero,status:result.pedido.status,catalogo:b.catalogo,cliente:b.nomeCliente,telefone:b.telefoneCliente,total:Number(result.pedido.total),frete:Number(result.pedido.valorFrete),formaPagamento:b.formaPagamento,tipoEnvio:b.tipoEnvio,criadoEm:result.pedido.criadoEm.toISOString()}).catch(()=>{});
    return NextResponse.json({id:result.pedido.id,numero:result.pedido.numero,total:Number(result.pedido.total),vendedorTelefone:seller?.telefone??null});
  }catch(e){
    if(e instanceof CheckoutError)return NextResponse.json({erro:e.message,...e.extra},{status:e.status});
    console.error("[checkout]",e instanceof Error?e.message:"Falha");
    return NextResponse.json({erro:"Não foi possível concluir o pedido. Tente novamente."},{status:503});
  }
}

export const GET = withApiAccess(GETHandler);
export const POST = withApiAccess(POSTHandler);
