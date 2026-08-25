import { Car, Hotel, Luggage, Plane } from "lucide-react";
import { weddingData } from "@/data/wedding";
import { FlightPath } from "./FlightPath";
import { SectionHeading } from "./SectionHeading";
import { TravelStamp } from "./TravelStamp";

export function TravelSection() {
  const items = [
    { icon: Plane, title: "Travel", body: weddingData.travel.arrival },
    { icon: Car, title: "Transfer", body: weddingData.travel.transfer },
    { icon: Hotel, title: "Accommodation", body: weddingData.travel.accommodation },
  ];

  return (
    <section id="travel" className="relative overflow-hidden bg-[#071827] px-7 py-14 text-[#F4EFE5] sm:px-10">
      <SectionHeading title="Travel" inverted />
      <p className="mx-auto mt-6 max-w-sm text-center text-sm leading-7 text-[#E7DDCA]/72">
        Arrive slowly, travel light, and leave room for a joyful day of celebration.
      </p>
      <div className="mt-10 space-y-5">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="border-y border-[#E7DDCA]/18 py-5">
            <div className="flex items-start gap-4">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-[#E7DDCA]/70" strokeWidth={1.5} />
              <div>
                <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.32em] text-[#E7DDCA]/55">
                  {title}
                </h3>
                <p className="mt-2 font-serif text-2xl leading-7 text-[#F4EFE5]">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <FlightPath className="mt-10 h-24 w-full" inverted />
      <TravelStamp className="absolute bottom-5 right-8 rotate-[9deg]" tone="paper">
        Tangerang
      </TravelStamp>
      <Luggage className="absolute left-8 top-10 h-5 w-5 text-[#E7DDCA]/35" strokeWidth={1.4} />
    </section>
  );
}
