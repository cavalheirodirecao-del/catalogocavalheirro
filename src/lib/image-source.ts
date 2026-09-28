export function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && (/\.supabase\.(co|in)$/.test(url.hostname) || ["lh3.googleusercontent.com", "storage.googleapis.com"].includes(url.hostname));
  } catch { return false; }
}
