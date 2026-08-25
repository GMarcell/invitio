import Image from "next/image";
import { weddingData } from "@/data/wedding";
import { SectionHeading } from "./SectionHeading";

export function DressCode() {
  return (
    <section id="dress" className="paper-panel bg-[#EDE6D8] px-7 py-12 text-[#111111] sm:px-10">
      <SectionHeading title="Dress Code" />
      <p className="mx-auto mt-7 max-w-sm text-center text-sm leading-7 text-[#111111]/65">
        We would love to see our family and friends in elegant and timeless attire.
      </p>
      <p className="mt-8 text-center text-[0.62rem] font-bold uppercase tracking-[0.32em] text-[#071827]/50">
        Our color palette for the day:
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-4">
        {weddingData.palette.map((color) => (
          <div key={color.name} className="text-center">
            <span
              className="mx-auto block h-11 w-11 rounded-full border border-[#071827]/20"
              style={{ backgroundColor: color.value }}
            />
            <span className="mt-2 block text-[0.54rem] font-bold uppercase tracking-[0.18em] text-[#071827]/48">
              {color.name}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-7 sm:grid-cols-2">
        {[
          ["Women", weddingData.images.women, "Elegant women's wedding guest fashion editorial"],
          ["Men", weddingData.images.men, "Elegant men's wedding guest fashion editorial"],
        ].map(([label, src, alt]) => (
          <figure key={label}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[14px] border border-[#071827]/15">
              <Image src={src} alt={alt} fill sizes="(max-width: 768px) 42vw, 20vw" className="object-cover" />
            </div>
            <figcaption className="mt-4 text-center font-serif text-3xl uppercase tracking-[0.12em]">
              {label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
