import { MapPin, Plane } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { FlightPath } from "./FlightPath";
import { SectionHeading } from "./SectionHeading";
import { TicketEdge } from "./TicketEdge";
import { TravelStamp } from "./TravelStamp";

export function DestinationSection() {
  return (
    <section className="paper-panel relative overflow-hidden bg-[#F4EFE5] px-7 py-12 text-[#111111] sm:px-10">
      <TicketEdge position="top" />
      <TicketEdge position="bottom" />
      <SectionHeading eyebrow="Destination" title={weddingData.venue.name} />
      <p className="mt-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.32em] text-[#071827]/55">
        {weddingData.destination}
      </p>
      <div className="relative mt-10 h-56 overflow-hidden border border-[#071827]/15 bg-[#E7DDCA]/70">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(30deg,transparent_40%,#071827_41%,transparent_42%),linear-gradient(150deg,transparent_43%,#071827_44%,transparent_45%)] [background-size:70px_70px]" />
        <div className="absolute left-7 top-8 h-20 w-36 rounded-[50%] border border-[#071827]/25" />
        <div className="absolute bottom-7 right-7 h-24 w-44 rounded-[50%] border border-[#071827]/25" />
        <FlightPath className="absolute left-5 top-16 h-24 w-[88%]" />
        <MapPin className="absolute right-[28%] top-[42%] h-7 w-7 text-[#071827]" strokeWidth={1.5} />
        <Plane className="absolute left-10 top-10 h-5 w-5 rotate-12 text-[#071827]/60" strokeWidth={1.4} />
      </div>
      <TravelStamp className="absolute bottom-10 left-8">First Class Love</TravelStamp>
      <TravelStamp className="absolute bottom-8 right-8 rotate-[7deg]">Italy 2025</TravelStamp>
    </section>
  );
}
