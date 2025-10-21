interface SectionProps {
  title: string;
  accent?: string;
  children?: React.ReactNode;
  className?: string; // optional
}

export default function Section({ title, accent, children, className }: SectionProps) {
  return (
    <section className={["dt-section rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm mb-8", className].join(" ")}>
      {/* lock the heading tokens so all pages are identical */}
      <h1 className="font-bold text-neutral-900 mb-2 text-[1.875rem] leading-[2.25rem] tracking-[-0.01em]">
        {title} {accent ? <span className="text-orange-500">{accent}</span> : null}
      </h1>
      {children}
    </section>
  );
}

