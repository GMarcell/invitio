import Image from "next/image";
import { weddingData } from "@/data/wedding";
import { FlightPath } from "./FlightPath";
import { SectionHeading } from "./SectionHeading";

export function WeddingDetails() {
  return (
    <>
      <section id="story" className="bg-[#071827] px-7 py-12 text-center text-[#F4EFE5] sm:px-10">
        <SectionHeading title="Dear Friends And Family" inverted />
        <p className="mx-auto mt-7 max-w-md text-sm leading-7 text-[#E7DDCA]/75">{weddingData.message}</p>
      </section>

      <section className="paper-panel bg-[#071827] px-7 pb-12 text-[#F4EFE5] sm:px-10">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-[#E7DDCA]/25">
            <Image
              src={weddingData.images.couple}
              alt="Editorial destination wedding couple in muted travel light"
              fill
              sizes="(max-width: 768px) 92vw, 42vw"
              className="object-cover"
            />
          </div>
          <FlightPath className="absolute -bottom-10 -left-4 h-28 w-[112%]" inverted />
        </div>
      </section>

      <section className="bg-[#071827] px-7 py-14 text-center text-[#F4EFE5] sm:px-10">
        <h2 className="font-serif text-5xl font-medium uppercase leading-[0.9] tracking-[0.08em]">
          We Are Waiting
          <span className="block">For You</span>
        </h2>
        <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-[#E7DDCA]/72">{weddingData.waiting}</p>
      </section>
    </>
  );
}
