import { Send } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const inputClass =
  "w-full border-0 border-b border-[#071827]/25 bg-transparent px-0 py-3 font-serif text-lg text-[#111111] outline-none transition placeholder:text-[#111111]/35 focus:border-[#071827]";
const labelClass = "text-[0.58rem] font-bold uppercase tracking-[0.3em] text-[#071827]/48";

export function RSVP() {
  return (
    <section id="rsvp" className="paper-panel bg-[#EDE6D8] px-7 py-12 text-[#111111] sm:px-10">
      <SectionHeading title="RSVP" />
      <p className="mx-auto mt-6 max-w-sm text-center font-serif text-2xl leading-8 text-[#111111]/70">
        Will you join us on this journey?
      </p>
      <form className="mt-9 space-y-6">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" className={inputClass} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" className={inputClass} autoComplete="email" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="guests" className={labelClass}>
              Number of guests
            </label>
            <input id="guests" name="guests" type="number" min="1" className={inputClass} />
          </div>
          <div>
            <label htmlFor="attendance" className={labelClass}>
              Attendance
            </label>
            <select id="attendance" name="attendance" className={inputClass} defaultValue="">
              <option value="" disabled>
                Choose
              </option>
              <option>Joyfully attending</option>
              <option>Regretfully declining</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="dietary" className={labelClass}>
            Dietary requirements
          </label>
          <input id="dietary" name="dietary" className={inputClass} />
        </div>
        <div>
          <label htmlFor="message" className={labelClass}>
            Message
          </label>
          <textarea id="message" name="message" rows={4} className={`${inputClass} resize-none`} />
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex w-full items-center justify-center gap-3 border border-[#071827] bg-[#071827] px-6 py-4 text-[0.64rem] font-bold uppercase tracking-[0.3em] text-[#F4EFE5] transition hover:bg-[#0B1F30] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#071827]"
        >
          Confirm Attendance
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </form>
    </section>
  );
}
