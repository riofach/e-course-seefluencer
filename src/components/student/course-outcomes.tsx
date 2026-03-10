import { CheckCheck, Sparkles, Target } from "lucide-react";

type CourseOutcomesProps = {
  title: string;
  outcomes: string[];
  audience?: string[];
};

export function CourseOutcomes({
  title,
  outcomes,
  audience = [
    "Learners who want structured chapter-by-chapter progress.",
    "Visitors comparing free preview value vs premium depth.",
    "Students who prefer practical lessons over abstract theory.",
  ],
}: CourseOutcomesProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="rounded-[28px] border border-[#2A2A3C] bg-[#1A1A24] p-6 text-white sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
          <Sparkles className="size-4 text-[#1ABC9C]" aria-hidden="true" />
          What you&apos;ll learn
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Build confidence before you commit to the next lesson.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 tracking-[-0.02em] text-slate-300 sm:text-base">
          {title} is presented as a conversion-friendly landing page so visitors can understand the value, structure,
          and learning payoff before they decide to start or subscribe.
        </p>

        <ul className="mt-6 space-y-4" aria-label="What you'll learn outcomes">
          {outcomes.map((outcome) => (
            <li
              key={outcome}
              className="flex items-start gap-3 rounded-[20px] border border-[#2A2A3C] bg-[#14141C] p-4"
            >
              <CheckCheck className="mt-0.5 size-5 shrink-0 text-[#1ABC9C]" aria-hidden="true" />
              <span className="text-sm leading-7 tracking-[-0.02em] text-slate-200">{outcome}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[28px] border border-[#2A2A3C] bg-[#1A1A24] p-6 text-white sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
          <Target className="size-4 text-[#6366F1]" aria-hidden="true" />
          Who this course is for
        </div>

        <ul className="mt-5 space-y-4" aria-label="Who this course is for">
          {audience.map((item) => (
            <li key={item} className="rounded-[20px] border border-[#2A2A3C] bg-[#14141C] p-4 text-sm leading-7 tracking-[-0.02em] text-slate-300">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
