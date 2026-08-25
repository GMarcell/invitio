import { Plane } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { FlightPath } from "./FlightPath";
import { SectionHeading } from "./SectionHeading";

export function Timeline() {
  return (
    <section id="timeline" className="relative overflow-hidden bg-[#071827] px-7 py-14 text-[#F4EFE5] sm:px-10">
      <SectionHeading title="Timeline" inverted />
      <FlightPath className="absolute right-4 top-20 h-24 w-52 opacity-45" inverted orientation="compact" />
      <div className="relative mx-auto mt-12 max-w-sm">
        <div className="absolute left-[4.45rem] top-2 h-[calc(100%-1rem)] border-l border-dashed border-[#E7DDCA]/35" />
        {weddingData.timeline.map((item, index) => (
          <div key={item.time} className="reveal-item relative grid grid-cols-[4.5rem_1fr] gap-8 pb-10 last:pb-0">
            <p className="font-serif text-2xl tracking-[0.08em] text-[#F4EFE5]">{item.time}</p>
            <div className="relative">
              <span className="absolute -left-[2.34rem] top-2 h-3 w-3 rounded-full border border-[#E7DDCA] bg-[#071827]" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-[#E7DDCA]/70">
                {item.label}
              </p>
              {index === 1 ? (
                <Plane className="mt-5 h-5 w-5 rotate-45 text-[#E7DDCA]/65" strokeWidth={1.4} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
