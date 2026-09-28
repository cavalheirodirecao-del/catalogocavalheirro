import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { aggregateItems, priceField } from "@/lib/order-rules";
import { cotarFrete } from "@/lib/frete";
const input=z.object({cepDestino:z.string().regex(/^\d{8}$/),catalogo:z.enum(["VAREJO","ATACADO","FABRICA"]),formaPagamento:z.enum(["VISTA","PRAZO"]),itens:z.array(z.object({varianteId:z.string(),quantidade:z.number().int().min(1).max(10000)})).min(1).max(200)});
async function POSTHandler(req:NextRequest){
  const parsed=input.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({erro:"Dados de frete inválidos."},{status:400});
  const b=parsed.data;const items=aggregateItems(b.itens);
  const variants=await prisma.produtoVariante.findMany({where:{id:{in:items.map(i=>i.varianteId)},ativo:true,produto:{ativo:true},cor:{ativo:true}},include:{produto:true}});
  if(variants.length!==items.length)return NextResponse.json({erro:"Produto indisponível."},{status:400});
  try{
    return NextResponse.json(await cotarFrete(b.cepDestino,items.map(i=>{const p=variants.find(v=>v.id===i.varianteId)!.produto;return{...p,quantidade:i.quantidade,precoUnitario:Number((p as any)[priceField(b.catalogo,b.formaPagamento)])};})));
  }catch(e){return NextResponse.json({erro:e instanceof Error?e.message:"Frete indisponível."},{status:503});}
}

export const POST = withApiAccess(POSTHandler);
