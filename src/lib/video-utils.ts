export function videoUrls(value: string | null | undefined) { return (value ?? "").split("\n").map(v => v.trim()).filter(Boolean); }
export function youtubeId(url: string) { return url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|watch\?v=))([a-zA-Z0-9_-]{11})/)?.[1] ?? null; }
export function videoEmbedUrl(url: string) { const id = youtubeId(url); return id ? `https://www.youtube.com/embed/${id}?controls=1&playsinline=1` : url; }
