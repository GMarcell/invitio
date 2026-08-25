import Image from "next/image";
import { weddingData } from "@/data/wedding";
import { SectionHeading } from "./SectionHeading";

export function Gallery() {
  const images = [
    { src: weddingData.images.venue, alt: "Lakeside Italian villa architecture" },
    { src: weddingData.images.couple, alt: "Romantic destination wedding portrait" },
    { src: weddingData.images.hero, alt: "Soft airport travel scene" },
  ];

  return (
    <section className="paper-panel bg-[#F4EFE5] px-7 py-12 text-[#111111] sm:px-10">
      <SectionHeading eyebrow="Editorial Notes" title="Gallery" />
      <div className="mt-10 grid gap-4">
        {images.map((image, index) => (
          <div
            key={image.alt}
            className={`relative overflow-hidden border border-[#071827]/15 ${
              index === 0 ? "aspect-[5/4] rounded-[16px]" : "aspect-[16/10] rounded-[12px]"
            }`}
          >
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 92vw, 42vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
