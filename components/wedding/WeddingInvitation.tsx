import { BoardingPass } from "./BoardingPass";
import { BackgroundMusic } from "./BackgroundMusic";
import { Calendar } from "./Calendar";
import { DestinationSection } from "./DestinationSection";
import { DressCode } from "./DressCode";
import { FloatingNav } from "./FloatingNav";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { RSVP } from "./RSVP";
import { Timeline } from "./Timeline";
import { TravelSection } from "./TravelSection";
import { VenueSection } from "./VenueSection";
import { WeddingDetails } from "./WeddingDetails";

export function WeddingInvitation() {
  return (
    <main className="wedding-site min-h-screen bg-[#071827] text-[#111111]">
      <BackgroundMusic />
      <Hero />
      <FloatingNav />
      <section className="relative -mt-24 px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <article className="invitation-card reveal-item overflow-hidden shadow-[0_28px_90px_rgba(0,0,0,0.32)] lg:translate-y-8">
            <BoardingPass />
            <WeddingDetails />
            <Calendar />
            <DestinationSection />
            <VenueSection />
            <Timeline />
            <DressCode />
            <TravelSection />
            <Gallery />
            <RSVP />
            <Footer />
          </article>
          {/* <article className="invitation-card reveal-item overflow-hidden shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
          </article> */}
        </div>
      </section>
    </main>
  );
}
