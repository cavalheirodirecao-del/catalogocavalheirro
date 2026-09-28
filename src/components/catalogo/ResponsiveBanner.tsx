import { getImageProps } from "next/image";
import { canOptimizeImage } from "@/lib/image-source";

export default function ResponsiveBanner({ mobile, tablet, desktop, alt }: { mobile: string; tablet: string; desktop: string; alt: string }) {
  const props = (src: string) => getImageProps({ src, alt, width: 1600, height: 500, sizes: "100vw", quality: 75, priority: true, unoptimized: !canOptimizeImage(src) }).props;
  const large = props(desktop), medium = props(tablet), small = props(mobile);
  return <picture>
    <source media="(min-width: 1024px)" srcSet={large.srcSet || large.src} sizes="100vw" />
    <source media="(min-width: 640px)" srcSet={medium.srcSet || medium.src} sizes="100vw" />
    <img {...small} alt={alt} fetchPriority="high" className="w-full h-[280px] sm:h-[360px] lg:h-[500px] object-cover" />
  </picture>;
}
