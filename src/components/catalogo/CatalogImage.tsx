import Image from "next/image";
import { canOptimizeImage } from "@/lib/image-source";

// Optimize approved storage hosts; retain support for existing external/demo images.
export default function CatalogImage({ src, alt, className, priority = false, sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" }: {
  src: string; alt: string; className?: string; priority?: boolean; sizes?: string;
}) {
  return canOptimizeImage(src)
    ? <Image src={src} alt={alt} width={900} height={1200} sizes={sizes} quality={75} priority={priority} className={className} />
    : <img src={src} alt={alt} width={900} height={1200} loading={priority ? "eager" : "lazy"} decoding="async" className={className} />;
}
