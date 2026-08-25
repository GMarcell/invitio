import { weddingData } from "@/data/wedding";
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
      <div className="mt-10 rounded-[12px] border border-[#071827]/15">
        <img
          src="https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80"
          alt="Tropical Indonesian wedding destination"
          className="block w-full rounded-[11px] object-cover"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
      <TravelStamp className="absolute bottom-10 left-8">First Class Love</TravelStamp>
      <TravelStamp className="absolute bottom-8 right-8 rotate-[7deg]">Indonesia 2028</TravelStamp>
    </section>
  );
}
