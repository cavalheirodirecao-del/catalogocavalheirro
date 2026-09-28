"use client";
import { useState } from "react";
import { Minus, Plus, Keyboard } from "lucide-react";
type Size = { id:string; valor:string };
type Color = { id:string; nome:string; hexCor:string|null; imagens:{url:string}[] };
export default function QuantityMatrix({ colors, sizes, values, available, onChange, onColor }: {
  colors:Color[]; sizes:Size[]; values:Record<string,Record<string,number>>;
  available:(color:Color,sizeId:string)=>number; onChange:(colorId:string,sizeId:string,value:number)=>void; onColor:(color:Color)=>void;
}) {
  const [typing,setTyping]=useState(false);
  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="font-semibold">Monte sua grade</h2><p className="text-xs text-gray-500 mt-1">Escolha quantas peças deseja em cada cor e tamanho.</p></div>
      <button type="button" aria-pressed={typing} onClick={()=>setTyping(!typing)} className="shrink-0 border rounded-lg p-2 text-xs flex items-center gap-2"><Keyboard size={16}/>{typing?"Usar + e −":"Digitar"}</button>
    </div>
    <div className="overflow-x-auto border border-gray-200 rounded-xl">
      <table className="w-full border-collapse text-sm"><caption className="sr-only">Quantidade de peças por cor e tamanho</caption>
        <thead className="bg-gray-50"><tr><th scope="col" className="sticky left-0 z-10 bg-gray-50 text-left p-3 min-w-[116px]">Cor</th>{sizes.map(s=><th key={s.id} scope="col" className="min-w-[100px] p-3">{s.valor}</th>)}<th scope="col" className="p-3">Total</th></tr></thead>
        <tbody>{colors.map(color=><tr key={color.id} className="border-t">
          <th scope="row" className="sticky left-0 z-10 bg-white p-3 text-left font-normal">
            <button type="button" onClick={()=>onColor(color)} aria-label={"Ver fotos da cor "+color.nome} className="flex flex-col gap-2 items-start">
              {color.imagens[0]?.url?<img src={color.imagens[0].url} alt="" className="w-10 h-12 rounded object-cover"/>:<span className="w-8 h-8 rounded-full border" style={{backgroundColor:color.hexCor??"#ddd"}}/>}
              <span className="text-xs max-w-[100px] whitespace-normal">{color.nome}</span>
            </button>
          </th>
          {sizes.map(size=>{
            const stock=available(color,size.id),value=values[color.id]?.[size.id]??0,label=color.nome+", tamanho "+size.valor;
            return <td key={size.id} className={"p-2 text-center "+(stock===0?"bg-gray-100":"")}>
              {stock===0?<span className="text-gray-400 text-xs" aria-label={label+" indisponível"}>Esgotado</span>:typing?
                <input aria-label={"Quantidade "+label} type="number" inputMode="numeric" min={0} max={stock} step={1} value={value||""} placeholder="0" onChange={e=>onChange(color.id,size.id,Number(e.target.value))} className="w-16 h-11 border rounded text-center focus:ring-2 focus:ring-black outline-none"/>:
                <div className="inline-flex items-center border rounded-lg bg-white">
                  <button type="button" aria-label={"Diminuir "+label} disabled={value===0} onClick={()=>onChange(color.id,size.id,value-1)} className="w-8 h-11 flex items-center justify-center disabled:opacity-20"><Minus size={14}/></button>
                  <span className={"w-6 tabular-nums font-semibold "+(value>0?"text-black":"text-gray-400")}>{value}</span>
                  <button type="button" aria-label={"Adicionar "+label} disabled={value>=stock} onClick={()=>onChange(color.id,size.id,value+1)} className="w-8 h-11 flex items-center justify-center disabled:opacity-20"><Plus size={14}/></button>
                </div>}
            </td>;
          })}
          <td className="p-3 font-semibold text-center tabular-nums">{sizes.reduce((n,s)=>n+(values[color.id]?.[s.id]??0),0)}</td>
        </tr>)}</tbody>
      </table>
    </div><p className="text-xs text-gray-500">Células cinza estão indisponíveis. O mínimo do pedido pode combinar produtos, cores e tamanhos.</p>
  </div>;
}

