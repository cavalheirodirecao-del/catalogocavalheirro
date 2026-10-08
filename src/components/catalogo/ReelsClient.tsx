"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { videoEmbedUrl } from "@/lib/video-utils";
type Video = { id: string; url: string; produtoId: string; nome: string; codigo: string; imagem: string | null; preco: number };
export default function ReelsClient({ videos, catalogo = "varejo" }: { videos: Video[]; catalogo?: string }) {
  const refs = useRef<Record<string, HTMLElement | null>>({}); const [ativo, setAtivo] = useState("");
  useEffect(() => { const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setAtivo((e.target as HTMLElement).dataset.id ?? ""); }), { threshold: 0.7 }); Object.values(refs.current).forEach(el => el && observer.observe(el)); return () => observer.disconnect(); }, [videos.length]);
  return <main className="h-screen overflow-y-auto snap-y snap-mandatory bg-black">{videos.map(v => <section key={v.id} data-id={v.id} ref={el => { refs.current[v.id] = el; }} className="h-screen snap-start relative flex items-center justify-center"><iframe src={ativo === v.id ? `${videoEmbedUrl(v.url)}${videoEmbedUrl(v.url).includes("?") ? "&" : "?"}autoplay=1&muted=1` : undefined} loading="lazy" title={v.nome} className="h-full w-full max-w-md" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> <Link href={`/${catalogo}/produto/${v.produtoId}`} className="absolute bottom-8 left-5 text-white drop-shadow-lg"><p className="font-semibold">{v.nome}</p><p className="text-sm opacity-80">{v.codigo} · R$ {v.preco.toFixed(2).replace(".", ",")}</p></Link></section>)}</main>;
}
