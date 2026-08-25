import { Heart, Plane } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { FlightPath } from "./FlightPath";
import { TicketEdge } from "./TicketEdge";
import { TravelStamp } from "./TravelStamp";

export function BoardingPass() {
  return (
    <section className="paper-panel relative overflow-hidden bg-[#F4EFE5] px-7 py-10 text-[#111111] sm:px-10">
      <TicketEdge position="top" />
      <TicketEdge position="bottom" />
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-dashed border-[#071827]/30 pb-5">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[#071827]/65">
            Wedding Ticket
          </p>
          <Plane className="h-5 w-5 text-[#071827]/65" strokeWidth={1.5} />
        </div>

        <div className="py-8 text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#071827]/45">
            Passenger Names
          </p>
          <h2 className="mt-5 font-serif text-6xl font-medium uppercase leading-[0.82] tracking-[0.06em] sm:text-7xl">
            {weddingData.couple.partnerOne}
            <span className="block pt-2">{weddingData.couple.partnerTwo}</span>
          </h2>
          <p className="mt-6 font-script text-4xl text-[#071827]/70">First class love</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-6 border-y border-dashed border-[#071827]/25 py-6">
          {[
            ["Flight & Date", weddingData.date.display],
            ["Class", "First Class"],
            ["Destination", weddingData.destination],
            ["Wedding Location", weddingData.venue.name],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.58rem] font-bold uppercase tracking-[0.28em] text-[#071827]/45">
                {label}
              </dt>
              <dd className="mt-2 font-serif text-lg font-semibold uppercase leading-tight tracking-[0.04em] text-[#111111]">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="relative mt-8 min-h-32">
          <FlightPath className="absolute left-0 top-4 h-24 w-full opacity-80" />
          <TravelStamp className="absolute left-1 top-3">Lake Como Italy</TravelStamp>
          <TravelStamp className="absolute right-2 top-0 rotate-[10deg]">21 Jun 2025</TravelStamp>
          <div className="mx-auto flex h-24 w-36 items-center justify-center border border-[#071827]/25 text-center">
            <div>
              <Heart className="mx-auto h-4 w-4 text-[#071827]/60" strokeWidth={1.5} />
              <p className="mt-2 text-[0.56rem] font-bold uppercase tracking-[0.3em] text-[#071827]/55">
                Boarding
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
