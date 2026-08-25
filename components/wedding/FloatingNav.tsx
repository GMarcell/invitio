const links = [
  ["Home", "#home"],
  ["Story", "#story"],
  ["Venue", "#venue"],
  ["Timeline", "#timeline"],
  ["Dress", "#dress"],
  ["RSVP", "#rsvp"],
];

export function FloatingNav() {
  return (
    <nav
      aria-label="Invitation sections"
      className="fixed bottom-4 left-1/2 z-50 hidden -translate-x-1/2 border border-[#E7DDCA]/20 bg-[#071827]/78 px-4 py-3 text-[#F4EFE5] backdrop-blur-md sm:block"
    >
      <ul className="flex items-center gap-4">
        {links.map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              className="text-[0.56rem] font-bold uppercase tracking-[0.24em] text-[#E7DDCA]/70 transition hover:text-[#F4EFE5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E7DDCA]"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
