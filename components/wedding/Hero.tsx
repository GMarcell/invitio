import Image from "next/image";
import { Plane } from "lucide-react";
import { weddingData } from "@/data/wedding";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] overflow-hidden bg-[#071827]">
      <Image
        src={weddingData.images.hero}
        alt="Muted airport runway and airplane wing at dusk"
        fill
        priority
        className="hero-image object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-[#071827]/55" />
      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center justify-center px-5 pb-20 pt-24 text-center text-[#F4EFE5]">
        <p className="hero-rise font-script text-6xl leading-none sm:text-8xl">{weddingData.brand}</p>
        <h1 className="hero-rise mt-4">
          <span className="block font-script text-6xl leading-none sm:text-8xl">Wedding</span>
          <span className="mt-1 block font-serif text-6xl font-medium uppercase leading-[0.86] tracking-[0.08em] sm:text-8xl">
            Invitation
          </span>
        </h1>
        <div className="hero-rise mt-8 flex w-full max-w-md items-center justify-center gap-4">
          <span className="h-px flex-1 bg-[#E7DDCA]/45" />
          <Plane className="h-5 w-5 text-[#E7DDCA]/80" strokeWidth={1.4} />
          <span className="h-px flex-1 bg-[#E7DDCA]/45" />
        </div>
        <p className="hero-rise mt-7 text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-[#E7DDCA]/80">
          {weddingData.headline}
        </p>
      </div>
    </section>
  );
}
