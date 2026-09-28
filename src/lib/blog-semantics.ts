// Keep the page title as the only H1 and repair skipped levels in editor content.
// This formats trusted editor HTML; it is not an HTML sanitizer.
export function blogSemantics(html: string, title: string): string {
  let level = 1;
  let image = 0;
  const escapedTitle = title.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return html.replace(/<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag: string, attrs: string, content: string) => {
    level = Math.max(2, Math.min(Number(tag[1]), level + 1));
    return `<h${level}${attrs}>${content}</h${level}>`;
  }).replace(/<img\b[^>]*>/gi, tag => {
    image++;
    const attributes = [
      /\salt\s*=/i.test(tag) ? "" : `alt="Imagem ${image} do artigo: ${escapedTitle}"`,
      /\sloading\s*=/i.test(tag) ? "" : 'loading="lazy"',
      /\sdecoding\s*=/i.test(tag) ? "" : 'decoding="async"',
    ].filter(Boolean).join(" ");
    return tag.replace(/\s*\/?\s*>$/, ` ${attributes}>`);
  });
}
