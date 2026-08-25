import { Heart } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { SectionHeading } from "./SectionHeading";

const blanks = Array.from({ length: 6 });
const days = Array.from({ length: 30 }, (_, index) => index + 1);

export function Calendar() {
  return (
    <section className="paper-panel bg-[#EDE6D8] px-7 py-10 sm:px-10">
      <SectionHeading eyebrow="Save The Date" title={weddingData.date.month} />
      <div className="mx-auto mt-8 max-w-sm">
        <div className="grid grid-cols-7 gap-1 border-b border-[#071827]/15 pb-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#071827]/50">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-7 gap-y-3 text-center font-serif text-lg text-[#111111]/75">
          {blanks.map((_, index) => (
            <span key={`blank-${index}`} />
          ))}
          {days.map((day) => (
            <span
              key={day}
              className={
                day === weddingData.date.day
                  ? "relative mx-auto grid h-9 w-9 place-items-center rounded-full border border-[#071827] bg-[#071827] text-[#F4EFE5]"
                  : ""
              }
            >
              {day}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-9 text-center">
        <Heart className="mx-auto h-4 w-4 text-[#071827]/60" strokeWidth={1.5} />
        <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.36em] text-[#071827]/50">
          Save The Date
        </p>
        <p className="mt-2 font-serif text-2xl tracking-[0.08em]">{weddingData.date.display}</p>
      </div>
    </section>
  );
}
