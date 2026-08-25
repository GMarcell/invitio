"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { SectionHeading } from "./SectionHeading";

const WEDDING = new Date(
  weddingData.date.year,
  weddingData.date.monthIndex,
  weddingData.date.day,
  10,
  0,
  0,
);

function calcDiff() {
  const now = Date.now();
  const diff = Math.max(0, WEDDING.getTime() - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function DigitBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-14 w-[4.5rem] overflow-hidden rounded-lg border border-[#E7DDCA]/20 bg-[#0B1F30] sm:h-[4.5rem] sm:w-24">
        {/* Top panel — slightly lighter bg, clipped to top half, behind text */}
        <div
          className="absolute inset-0 bg-[#0F2438]"
          style={{ clipPath: "inset(0 0 50% 0)" }}
        />
        {/* Digit — single centered text, above the overlay */}
        <span className="absolute inset-0 z-10 flex items-center justify-center font-dm-serif text-3xl tracking-[0.06em] text-[#F4EFE5] sm:text-4xl">
          {value}
        </span>
        {/* Divider line — on top of everything */}
        <div className="absolute left-0 right-0 top-1/2 z-20 h-px -translate-y-px bg-[#E7DDCA]/20">
          <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#071827]" />
          <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#071827]" />
        </div>
      </div>
      <span className="font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[#E7DDCA]/50">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [time, setTime] = useState(calcDiff);

  useEffect(() => {
    const id = setInterval(() => setTime(calcDiff()), 1000);
    return () => clearInterval(id);
  }, []);

  const arrived =
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0;

  return (
    <section className="relative overflow-hidden bg-[#071827] px-7 py-14 text-[#F4EFE5] sm:px-10">
      {/* Background decorative elements */}
      <div className="absolute left-0 top-0 h-full w-full opacity-[0.03] [background-image:repeating-linear-gradient(90deg,transparent,transparent_60px,#E7DDCA_60px,#E7DDCA_61px)]" />

      <div className="relative">
        <SectionHeading eyebrow="Counting Down To" title="The Big Day" inverted />

        {/* Flight info strip */}
        <div className="mx-auto mt-8 flex max-w-sm items-center justify-between border-y border-dashed border-[#E7DDCA]/20 py-3 text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[#E7DDCA]/50">
          <span>Departure</span>
          <Plane className="h-4 w-4 rotate-90 text-[#E7DDCA]/40" strokeWidth={1.4} />
          <span>{weddingData.date.display}</span>
        </div>

        {arrived ? (
          <div className="mt-10 text-center">
            <p className="font-script text-5xl text-[#E7DDCA]">We Do!</p>
            <p className="mt-4 text-sm text-[#E7DDCA]/60">The wait is over — celebration time!</p>
          </div>
        ) : (
          <div className="mt-10 flex items-center justify-center gap-3 sm:gap-5">
            <DigitBlock value={pad(time.days)} label="Days" />
            <span className="font-dm-serif text-2xl text-[#E7DDCA]/30 sm:text-3xl">:</span>
            <DigitBlock value={pad(time.hours)} label="Hours" />
            <span className="font-dm-serif text-2xl text-[#E7DDCA]/30 sm:text-3xl">:</span>
            <DigitBlock value={pad(time.minutes)} label="Minutes" />
            <span className="font-dm-serif text-2xl text-[#E7DDCA]/30 sm:text-3xl">:</span>
            <DigitBlock value={pad(time.seconds)} label="Seconds" />
          </div>
        )}

        {/* Boarding pass barcode decoration */}
        <div className="mx-auto mt-10 flex max-w-xs items-center justify-center gap-[2px]">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="block bg-[#E7DDCA]/10"
              style={{
                width: i % 5 === 0 ? "2px" : "1px",
                height: `${16 + (i % 3) * 4}px`,
              }}
            />
          ))}
        </div>

        <p className="mt-5 text-center text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[#E7DDCA]/40">
          {weddingData.couple.display}
        </p>
      </div>
    </section>
  );
}
