import { BoardingPass } from "./BoardingPass";
import { BackgroundMusic } from "./BackgroundMusic";
import { Calendar } from "./Calendar";
import { Countdown } from "./Countdown";
import { DressCode } from "./DressCode";
import { FadeIn } from "./FadeIn";
import { FloatingNav } from "./FloatingNav";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { RSVP } from "./RSVP";
import { Timeline } from "./Timeline";
import { VenueSection } from "./VenueSection";
import { WeddingDetails } from "./WeddingDetails";

export function WeddingInvitation() {
  return (
    <main className="wedding-site min-h-screen bg-[#071827] text-[#111111]">
      <BackgroundMusic />
      <Hero />
      <FloatingNav />
      <section className="relative -mt-24 px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-4xl items-start justify-center">
          <article className="invitation-card w-full overflow-hidden shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
            <FadeIn>
              <BoardingPass />
            </FadeIn>
            <FadeIn>
              <WeddingDetails />
            </FadeIn>
            <FadeIn>
              <Calendar />
            </FadeIn>
            <FadeIn>
              <Countdown />
            </FadeIn>
            <FadeIn>
              <VenueSection />
            </FadeIn>
            <FadeIn>
              <Timeline />
            </FadeIn>
            <FadeIn>
              <DressCode />
            </FadeIn>
            <FadeIn>
              <Gallery />
            </FadeIn>
            <FadeIn>
              <RSVP />
            </FadeIn>
            <FadeIn>
              <Footer />
            </FadeIn>
          </article>
          {/* <article className="invitation-card reveal-item overflow-hidden shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
          </article> */}
        </div>
      </section>
    </main>
  );
}
