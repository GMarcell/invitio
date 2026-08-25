type TravelStampProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "navy" | "paper";
};

export function TravelStamp({ children, className = "", tone = "navy" }: TravelStampProps) {
  return (
    <span
      className={`travel-stamp inline-flex h-24 w-24 rotate-[-9deg] items-center justify-center rounded-full border text-center text-[0.62rem] font-bold uppercase leading-4 tracking-[0.22em] ${
        tone === "navy"
          ? "border-[#071827]/45 text-[#071827]/65"
          : "border-[#E7DDCA]/50 text-[#E7DDCA]/70"
      } ${className}`}
    >
      {children}
    </span>
  );
}
