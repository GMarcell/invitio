import Image from "next/image";
import { MapPin } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { SectionHeading } from "./SectionHeading";

export function VenueSection() {
  return (
    <section id="venue" className="paper-panel bg-[#F4EFE5] px-7 py-10 text-center text-[#111111] sm:px-10">
      <SectionHeading eyebrow="Wedding Location" title="Venue" />
      <h3 className="mt-8 font-serif text-4xl font-medium uppercase leading-none tracking-[0.07em]">
        {weddingData.venue.name}
      </h3>
      <p className="mx-auto mt-4 max-w-xs text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.26em] text-[#071827]/55">
        {weddingData.venue.address}
      </p>
      <a
        href={weddingData.venue.mapUrl}
        className="mt-7 inline-flex items-center justify-center gap-2 border border-[#071827] bg-[#071827] px-6 py-3 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[#F4EFE5] transition hover:bg-[#0B1F30] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#071827]"
      >
        <MapPin className="h-4 w-4" strokeWidth={1.5} />
        How To Get There
      </a>
      <div className="relative mt-10 aspect-[4/5] overflow-hidden rounded-[16px] border border-[#071827]/15">
        <Image
          src={weddingData.images.venue}
          alt="GPIB Yudea church wedding venue in Tangerang"
          fill
          sizes="(max-width: 768px) 92vw, 42vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
