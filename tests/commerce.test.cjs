const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");
const jwt = require("next-auth/jwt");
process.env.NEXTAUTH_SECRET = "test-only-secret-not-used-in-production";
let state;
const seller = { id: "seller-1", slug: "joao", telefone: "5581990000000", ativo: true, usuario: { nome: "João", ativo: true, perfil: "VENDEDOR" }, links: [{ id: "link-1", catalogo: "VAREJO", ativo: true }] };
const product = { ativo: true, precoVarejoVista: 100, precoVarejoPrazo: 120, precoAtacadoVista: 70, precoAtacadoPrazo: 80, precoFabricaVista: 50, precoFabricaPrazo: 60, pesoGramas: 300, alturaCm: 5, larguraCm: 20, comprimentoCm: 25 };
const prisma = {
 usuario: { findFirst: async ({where})=>state.actors[where.id]??null },
 vendedor: { findFirst: async ({where})=>{
   if (where.id && where.id!==seller.id) return null;
   if (where.slug && where.slug!==seller.slug) return null;
   if (!state.sellerActive) return null;
   if (!seller.links.some(l=>l.catalogo===where.links?.some?.catalogo)) return null;
   return seller;
 },findMany:async()=>[seller] },
 afiliado: { findFirst:async({where})=>where.slug==="ana"&&where.tipo==="VAREJO"&&state.affiliateActive?{id:"affiliate-1"}:null,findMany:async()=>[] },
 configuracaoGeral:{findFirst:async()=>({qtdMinimaAtacado:15,qtdMinimaFabrica:40,taxaExcursao:5})},
 produtoVariante:{findMany:async({where})=>where.id.in.includes("variant-1")?[{id:"variant-1",produto:product,estoque:{quantidade:state.stock,pendente:state.reserved}}]:[]},
 cupom:{findUnique:async()=>state.coupon,update:async()=>{state.coupon.usoAtual++;}},
 loja:{findFirst:async({where})=>where.id==="store-1"?{id:"store-1"}:null,findMany:async()=>[{id:"store-1",nome:"Loja"}]},
 visita:{upsert:async({where,create})=>{if(!state.visits.find(v=>v.id===where.id))state.visits.push({...create,criadoEm:new Date(),ip:null});},findMany:async()=>state.visits},
 pedido:{
  findUnique:async({where})=>state.orders.find(o=>o.chaveCheckout===where.chaveCheckout)??null,
  count:async()=>state.prior,
  create:async({data})=>{const order={...data,id:"order-"+(state.orders.length+1),numero:state.orders.length+1,criadoEm:new Date()};state.orders.push(order);return order;},
  findMany:async({where})=>{state.lastOrderWhere=where;return state.orders.filter(o=>!where.vendedorId||o.vendedorId===where.vendedorId);}
 },
 estoque:{update:async({data})=>{state.reserved+=data.pendente.increment;}},
 $transaction:async(fn,options)=>{
   assert.equal(options.isolationLevel,"Serializable");
   const snapshot=structuredClone(state);
   try{return await fn(prisma);}catch(e){state=snapshot;throw e;}
 },
};
const cache=new Map();
function load(file) {
 const filename=path.resolve(file.endsWith(".ts")?file:file+".ts");
 if(cache.has(filename))return cache.get(filename).exports;
 const module={exports:{}};cache.set(filename,module);
 const source=ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 function localRequire(id){
  if(id==="@/lib/prisma"||id==="./prisma")return{prisma};
  if(id==="@/lib/webhook")return{dispararWebhook:async()=>{state.webhooks++;}};
  if(id==="next-auth/jwt")return{...jwt,getToken:async({req})=>{const actor=req.headers.get("x-test-actor");return actor?{id:actor,perfil:state.actors[actor]?.perfil}:null;}};
  if(id.startsWith("@/"))return load(path.join("src",id.slice(2)));
  if(id.startsWith("."))return load(path.resolve(path.dirname(filename),id));
  return require(id);
 }
 vm.runInThisContext("(function(require,module,exports){"+source+"\n})",{filename})(localRequire,module,module.exports);
 return module.exports;
}
const tracking=load("src/lib/tracking.ts");
const visits=load("src/app/api/visitas/route.ts");
const orders=load("src/app/api/pedidos/route.ts");
const checkout=load("src/app/api/checkout-dados/route.ts");
const policy=load("src/lib/access-policy.ts");
const rules=load("src/lib/order-rules.ts");
const report=load("src/lib/reach-report.ts");
beforeEach(()=>{
 state={orders:[],visits:[],stock:100,reserved:0,prior:0,coupon:null,sellerActive:true,affiliateActive:true,webhooks:0,actors:{"seller-user":{id:"seller-user",perfil:"VENDEDOR",vendedor:{id:seller.id,ativo:true}},"admin":{id:"admin",perfil:"ADMIN"}},lastOrderWhere:null};
});
function request(url,method="GET",body,cookie="",actor){
 return new NextRequest("https://example.test"+url,{method,headers:{"content-type":"application/json",...(cookie?{cookie}:{}),...(actor?{"x-test-actor":actor}:{})},...(body?{body:JSON.stringify(body)}:{})});
}
function cookies(response){return response.cookies.getAll().map(c=>c.name+"="+c.value).join("; ");}
function validBody(extra={}){return{catalogo:"VAREJO",formaPagamento:"VISTA",tipoEnvio:"RETIRADA_LOJA",nomeCliente:"Cliente Teste",telefoneCliente:"81999999999",lojaRetiradaId:"store-1",chaveCheckout:crypto.randomUUID(),total:100,itens:[{varianteId:"variant-1",quantidade:1}],...extra};}
test("seller link survives product navigation and checkout; orders use server attribution",async()=>{
 const first=await visits.POST(request("/api/visitas","POST",{catalogo:"VAREJO",vendedorSlug:"joao"}));assert.equal(first.status,200);
 const jar=cookies(first);
 const second=await visits.POST(request("/api/visitas","POST",{catalogo:"VAREJO"},jar));assert.equal(second.status,200);
 assert.equal(state.visits.length,1);assert.equal(state.visits[0].vendedorId,seller.id);
 const info=await checkout.GET(request("/api/checkout-dados?catalogo=VAREJO","GET",null,jar));
 assert.equal((await info.json()).vendedorVinculado.id,seller.id);
 const body=validBody({vendedorId:"forged-other-seller",refSlug:"ana",itens:[{varianteId:"variant-1",quantidade:1,precoUnitario:1,subtotal:1}]});
 const purchase=await orders.POST(request("/api/pedidos","POST",body,jar));assert.equal(purchase.status,200);
 assert.equal(state.orders[0].vendedorId,seller.id);assert.equal(state.orders[0].origemRastreamento,"LINK_VENDEDOR");
 assert.equal(state.orders[0].itens.create[0].precoUnitario,100);
 assert.equal(state.reserved,1);
 const retry=await orders.POST(request("/api/pedidos","POST",body,jar));assert.equal(retry.status,200);
 assert.equal(state.orders.length,1);assert.equal(state.reserved,1);assert.equal(state.webhooks,1);
});
test("last valid affiliate link replaces seller; invalid link preserves referral",async()=>{
 const a=await visits.POST(request("/api/visitas","POST",{catalogo:"VAREJO",vendedorSlug:"joao"}));
 const b=await visits.POST(request("/api/visitas","POST",{catalogo:"VAREJO",afiliadoSlug:"ana"},cookies(a)));
 assert.equal(state.visits.at(-1).afiliadoId,"affiliate-1");
 const invalid=await visits.POST(request("/api/visitas","POST",{catalogo:"VAREJO",vendedorSlug:"missing"},cookies(b)));
 assert.equal(invalid.status,200);assert.equal(state.visits.length,2);
 const purchase=await orders.POST(request("/api/pedidos","POST",validBody(),cookies(b)));
 assert.equal(purchase.status,200);assert.equal(state.orders[0].afiliadoId,"affiliate-1");assert.equal(state.orders[0].vendedorId,null);
});
test("seller and affiliate slugs remain distinct; expired and forged cookies are ignored",async()=>{
 assert.equal(tracking.referralFromParams("joao","ana").tipo,"VENDEDOR");
 assert.equal(await tracking.readReferral(request("/","GET",null,"cavalheiro_ref=forged")),null);
 const expired=await jwt.encode({token:{tipo:"VENDEDOR",slug:"joao"},secret:process.env.NEXTAUTH_SECRET,maxAge:-3600});
 assert.equal(await tracking.readReferral(request("/","GET",null,"cavalheiro_ref="+expired)),null);
});
test("inactive seller cannot receive new orders through old attribution",async()=>{
 const a=await visits.POST(request("/api/visitas","POST",{catalogo:"VAREJO",vendedorSlug:"joao"}));state.sellerActive=false;
 const r=await orders.POST(request("/api/pedidos","POST",validBody({vendedorId:seller.id}),cookies(a)));
 assert.equal(r.status,400);assert.equal(state.orders.length,0);
});
test("tampered total rejected without reserving stock",async()=>{
 const r=await orders.POST(request("/api/pedidos","POST",validBody({total:1})));
 assert.equal(r.status,409);assert.equal((await r.json()).totalAtualizado,100);assert.equal(state.orders.length,0);assert.equal(state.reserved,0);
});
test("negative, fractional and zero quantities rejected",async()=>{
 for(const quantidade of [-1,0,1.5]) {
 const r=await orders.POST(request("/api/pedidos","POST",validBody({itens:[{varianteId:"variant-1",quantidade}]})));assert.equal(r.status,400);
 }
 assert.equal(state.orders.length,0);
});
test("wholesale and factory minimum enforced by API",async()=>{
 for(const catalogo of ["ATACADO","FABRICA"]) {
 const r=await orders.POST(request("/api/pedidos","POST",validBody({catalogo})));assert.equal(r.status,400);
 }
});
test("duplicate variant lines aggregated before stock validation",async()=>{
 state.stock=1;
 const r=await orders.POST(request("/api/pedidos","POST",validBody({total:200,itens:[{varianteId:"variant-1",quantidade:1},{varianteId:"variant-1",quantidade:1}]})));
 assert.equal(r.status,409);assert.equal(state.reserved,0);
});
test("coupon limits checked in transaction; client discount ignored",async()=>{
 state.coupon={id:"coupon",ativo:true,usoMaximo:1,usoAtual:1,tipo:"PERCENTUAL",valor:10,validade:null};
 const r=await orders.POST(request("/api/pedidos","POST",validBody({cupomCodigo:"TEST",total:90,desconto:10})));
 assert.equal(r.status,400);assert.equal(state.orders.length,0);
 state.coupon.usoAtual=0;
 const ok=await orders.POST(request("/api/pedidos","POST",validBody({cupomCodigo:"TEST",total:90,desconto:999})));
 assert.equal(ok.status,200);assert.equal(state.orders[0].desconto,10);assert.equal(state.coupon.usoAtual,1);
});
test("unauthenticated administrative APIs denied at handler",async()=>{
 for(const [file,method,url] of [["produtos","POST","/api/produtos"],["clientes","GET","/api/clientes"],["afiliados/pagamentos","POST","/api/afiliados/pagamentos"]]){
 const route=load("src/app/api/"+file+"/route.ts");
 const r=await route[method](request(url,method,method==="POST"?{}:null));assert.equal(r.status,401);
 }
});
test("seller cannot edit products and only lists own orders",async()=>{
 assert.equal(policy.canAccessApi("VENDEDOR","/api/produtos","POST"),false);
 const r=await orders.GET(request("/api/pedidos","GET",null,"","seller-user"));assert.equal(r.status,200);
 assert.deepEqual(state.lastOrderWhere,{vendedorId:seller.id});
});
test("empty phone cannot bypass lead list authorization",()=>{
 assert.equal(policy.isPublicApi("/api/leads","GET",new URLSearchParams()),false);
 const leadSource=fs.readFileSync("src/app/api/leads/route.ts","utf8");
 assert.ok(leadSource.includes("normalizado.length < 10"));
});
test("visits deduplicate per session and catalog; identities are not IP counts",()=>{
 assert.equal(tracking.visitId("s","VAREJO","VENDEDOR:joao"),tracking.visitId("s","VAREJO","VENDEDOR:joao"));
 assert.notEqual(tracking.visitId("s","VAREJO","VENDEDOR:joao"),tracking.visitId("s","ATACADO","VENDEDOR:joao"));
 const identity={id:seller.id,slug:"joao",nome:"João",tipo:"VENDEDOR"};
 const visit={vendedorId:seller.id,afiliadoId:null,visitanteId:"browser",ip:"shared-ip",catalogo:"VAREJO",criadoEm:new Date()};
 const order={vendedorId:seller.id,afiliadoId:null,total:100,origemRastreamento:"LINK_VENDEDOR"};
 const result=report.buildReachReport([identity],[visit,visit,{...visit,visitanteId:null}],[{...order,status:"SEPARANDO"},{...order,status:"PENDENTE"},{...order,status:"CANCELADO"}]);
 const r=result.ranking[0];assert.equal(r.visitantesUnicos,1);assert.equal(r.ipsLegados,1);assert.equal(r.compras,1);assert.equal(r.valorCompras,100);assert.equal(r.totalPedidos,3);
});
test("all six price tables and currency rounding",()=>{
 for(const c of ["VAREJO","ATACADO","FABRICA"])for(const p of ["VISTA","PRAZO"])assert.equal(typeof product[rules.priceField(c,p)],"number");
 assert.equal(rules.cents(19.9),1990);assert.equal(rules.discountCents(1000,"VALOR_FIXO",50),1000);
});
test("every non-auth API has handler-level authorization",()=>{
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
 for(const file of walk("src/app/api").filter(f=>f.endsWith("route.ts")&&!f.includes(path.sep+"auth"+path.sep))){
 const source=fs.readFileSync(file,"utf8");assert.ok(source.includes("withApiAccess("),file);assert.equal(/export async function (GET|POST|PUT|PATCH|DELETE)/.test(source),false,file);
 }
});



test("cart quantities cannot exceed available stock, including old carts and duplicate lines", () => {
 const { limitarQuantidade, ajustarCarrinho } = load("src/lib/cart-stock.ts");
 assert.equal(limitarQuantidade(205, 12), 12);
 assert.equal(limitarQuantidade(13, 12), 12);
 assert.equal(limitarQuantidade(3.8, 12), 3);
 assert.equal(limitarQuantidade(NaN, 12), 0);
 assert.equal(limitarQuantidade(-5, 12), 0);
 const items = ajustarCarrinho([{varianteId:"p",quantidade:205},{varianteId:"m",quantidade:54},{varianteId:"gone",quantidade:2},{varianteId:"p",quantidade:10}], {p:12,m:4});
 assert.equal(items.length, 2);
 assert.equal(items[0].quantidade, 12);
 assert.equal(items[1].quantidade, 4);
 assert.equal(ajustarCarrinho(items, {p:0,m:1})[0].quantidade, 1);
});
