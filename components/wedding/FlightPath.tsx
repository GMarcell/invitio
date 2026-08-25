import { Plane } from "lucide-react";

type FlightPathProps = {
  className?: string;
  inverted?: boolean;
  orientation?: "wide" | "compact";
};

export function FlightPath({ className = "", inverted, orientation = "wide" }: FlightPathProps) {
  const stroke = inverted ? "#E7DDCA" : "#071827";

  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden="true">
      <svg
        viewBox={orientation === "wide" ? "0 0 520 120" : "0 0 260 90"}
        className="flight-path h-full w-full overflow-visible"
        fill="none"
      >
        <path
          d={
            orientation === "wide"
              ? "M8 90 C130 10 255 12 330 68 C390 112 450 100 512 34"
              : "M6 70 C64 16 142 14 178 50 C206 78 232 64 254 24"
          }
          stroke={stroke}
          strokeDasharray="2 12"
          strokeLinecap="round"
          strokeWidth="2"
          opacity="0.48"
        />
      </svg>
      <Plane
        className={`absolute h-5 w-5 ${inverted ? "text-[#E7DDCA]/70" : "text-[#071827]/60"} ${
          orientation === "wide" ? "right-0 top-3" : "right-0 top-1"
        }`}
        strokeWidth={1.4}
      />
    </div>
  );
}
