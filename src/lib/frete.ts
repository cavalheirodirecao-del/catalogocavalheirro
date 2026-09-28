export type ItemFrete = { quantidade: number; pesoGramas: number; alturaCm: number; larguraCm: number; comprimentoCm: number; precoUnitario: number };
export async function cotarFrete(cep: string, itens: ItemFrete[]) {
  const token=process.env.MELHOR_ENVIO_TOKEN;
  if(!token)throw new Error("Frete indisponível. Entre em contato com a loja.");
  const base=process.env.MELHOR_ENVIO_SANDBOX==="true"?"https://sandbox.melhorenvio.com.br/api/v2":"https://melhorenvio.com.br/api/v2";
  const response=await fetch(base+"/me/shipment/calculate",{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token,"User-Agent":"Cavalheiro/1.0 (contato@cavalheiro.com.br)"},
    body:JSON.stringify({
      from:{postal_code:(process.env.CEP_ORIGEM??"55900000").replace(/\D/g,"")},to:{postal_code:cep},
      package:{height:Math.max(2,Math.ceil(itens.reduce((n,i)=>n+i.alturaCm*i.quantidade,0))),width:Math.max(11,...itens.map(i=>i.larguraCm)),length:Math.max(16,...itens.map(i=>i.comprimentoCm)),weight:Math.max(0.3,itens.reduce((n,i)=>n+i.pesoGramas*i.quantidade,0)/1000)},
      options:{insurance_value:itens.reduce((n,i)=>n+i.precoUnitario*i.quantidade,0),receipt:false,own_hand:false},services:"1,2,3,4,17",
    }),signal:AbortSignal.timeout(8000),cache:"no-store",
  });
  if(!response.ok)throw new Error("Não foi possível confirmar o frete. Tente novamente.");
  const data=await response.json();
  return(Array.isArray(data)?data:[]).filter((s:any)=>!s.error&&Number.isFinite(Number(s.price))&&Number(s.price)>=0).map((s:any)=>({id:String(s.id),nome:s.name,empresa:s.company?.name??"",preco:Number(s.price),prazoMin:s.delivery_time,prazoMax:s.delivery_time}));
}
