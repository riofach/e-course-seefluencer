import { Card, CardContent } from "~/components/ui/card";

const stats = [
  { value: "500+", label: "Students Enrolled" },
  { value: "50+", label: "Courses Available" },
  { value: "10+", label: "Expert Creators" },
  { value: "4.8★", label: "Average Rating" },
] as const;

const testimonials = [
  {
    initials: "NA",
    name: "Nadia Aulia",
    quote:
      "The lessons feel like a real creator roadmap, not random tips. I always knew what to watch next and what action to take.",
  },
  {
    initials: "RF",
    name: "Rafi Firmansyah",
    quote:
      "I came for creator strategy and stayed for the structure. The mix of video, quizzes, and progress tracking kept me consistent.",
  },
  {
    initials: "SL",
    name: "Sarah Lestari",
    quote:
      "Seefluencer makes premium learning feel approachable. The teaching style is practical, modern, and genuinely motivating.",
  },
] as const;

export function LandingTrustSection() {
  return (
    <div className="mx-auto max-w-5xl" aria-label="Social proof and platform statistics">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
          Trusted by growth-focused learners
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl">
          A learning platform built to earn confidence
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          From creator-led lessons to measurable progress, every part of the experience is designed to help learners feel supported.
        </p>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[24px] border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-[#2A2A3C] dark:bg-[#1A1A24]"
          >
            <dd className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</dd>
            <dt className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.name}
            className="rounded-[24px] border border-slate-200/80 bg-white py-0 shadow-sm dark:border-[#2A2A3C] dark:bg-[#1A1A24]"
          >
            <CardContent className="flex h-full flex-col gap-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {testimonial.initials}
                </div>
                <div>
                  <cite className="not-italic text-base font-semibold text-slate-900 dark:text-white">{testimonial.name}</cite>
                  <p className="text-sm text-amber-500">★★★★★</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">“{testimonial.quote}”</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
