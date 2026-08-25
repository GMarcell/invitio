type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  inverted?: boolean;
};

export function SectionHeading({ eyebrow, title, align = "center", inverted }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow ? (
        <p
          className={`mb-3 text-[0.66rem] font-semibold uppercase tracking-[0.36em] ${
            inverted ? "text-[#E7DDCA]/70" : "text-[#071827]/55"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-serif text-4xl font-medium uppercase leading-[0.92] tracking-[0.05em] sm:text-5xl ${
          inverted ? "text-[#F4EFE5]" : "text-[#111111]"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
