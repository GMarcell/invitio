import { Heart, Mail, Phone } from "lucide-react";
import { weddingData } from "@/data/wedding";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#071827] px-7 py-16 text-center text-[#F4EFE5] sm:px-10">
      <p className="break-words px-4 font-script text-4xl sm:text-5xl">{weddingData.couple.display}</p>
      <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[#E7DDCA]/72">
        Thank you for being part of our story. We cannot wait to meet you by the lake.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#E7DDCA]/58">
        <a
          href={`mailto:${weddingData.contact.email}`}
          className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E7DDCA]"
        >
          <Mail className="h-4 w-4" strokeWidth={1.5} />
          {weddingData.contact.email}
        </a>
        <a
          href={`tel:${weddingData.contact.phone.replaceAll(" ", "")}`}
          className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E7DDCA]"
        >
          <Phone className="h-4 w-4" strokeWidth={1.5} />
          {weddingData.contact.phone}
        </a>
      </div>
      <Heart className="mx-auto mt-10 h-4 w-4 text-[#E7DDCA]/60" strokeWidth={1.5} />
    </footer>
  );
}
