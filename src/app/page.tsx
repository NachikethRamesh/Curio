import Link from "next/link";
import LandingNav from "@/components/LandingNav";

const PASTEL_COLORS = [
  "bg-[#DCFBC7]", // lime
  "bg-[#CEF3FD]", // cyan
  "bg-[#DFEDFD]", // peri
  "bg-[#FEF6D0]", // lemon
  "bg-[#EFE7FD]", // lavender
  "bg-[#FDDADA]", // blush
];

const STEPS = [
  {
    number: "01",
    title: "Claim your handle",
    desc: "Sign up with your X handle. It becomes your Curio username and profile URL.",
    color: PASTEL_COLORS[0],
  },
  {
    number: "02",
    title: "Create collections",
    desc: "Organize your tweets into themed buckets like \"Hiring Advice\" or \"Tech Takes\".",
    color: PASTEL_COLORS[1],
  },
  {
    number: "03",
    title: "Paste your tweet URLs",
    desc: "Add tweets to collections by pasting the URL. Curio fetches and caches the embed instantly.",
    color: PASTEL_COLORS[2],
  },
  {
    number: "04",
    title: "Share your profile",
    desc: "One link in your bio. All your best content, organized by topic, always accessible.",
    color: PASTEL_COLORS[3],
  },
];

const FEATURES = [
  {
    title: "Own tweets only",
    desc: "Curio verifies your handle and only lets you save your own tweets. Authentic profiles, zero impersonation.",
    color: PASTEL_COLORS[4],
  },
  {
    title: "Instant embeds",
    desc: "Tweets render as rich embeds with full styling. No screenshots, no broken links.",
    color: PASTEL_COLORS[0],
  },
  {
    title: "Drag to reorder",
    desc: "Arrange tweets and collections in exactly the order you want. Your best work, front and center.",
    color: PASTEL_COLORS[5],
  },
  {
    title: "Cached forever",
    desc: "Tweets are fetched once and stored. Even if the original gets deleted, your Curio profile stays intact.",
    color: PASTEL_COLORS[1],
  },
  {
    title: "SEO-ready profiles",
    desc: "Public profiles are server-rendered with full metadata. Google indexes your curated content.",
    color: PASTEL_COLORS[2],
  },
  {
    title: "Free to use",
    desc: "No paid API keys, no subscriptions. Curio runs on free infrastructure and keeps costs near zero.",
    color: PASTEL_COLORS[3],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <LandingNav />

      {/* Hero */}
      <section className="px-6 sm:px-10 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl">
          <h1 className="text-5xl sm:text-7xl font-normal tracking-tight leading-[1.1] uppercase mb-8">
            Your best tweets,
            <br />
            <span className="inline-flex items-center gap-4">
              organized
              <span className="inline-block px-5 py-1.5 bg-[#DCFBC7] rounded-full text-3xl sm:text-5xl lowercase font-medium not-italic">
                by topic
              </span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mb-10 leading-relaxed">
            Stop letting the timeline bury your best work. Reach the right audience.
            <br />
            Curio lets you curate your tweets into topic-based collections and share them with a single link.
          </p>
          <div className="flex gap-4 items-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 text-base font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Get started &mdash; it&apos;s free
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 text-base font-medium text-[var(--text-muted)] hover:text-black transition-colors"
            >
              How it works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* How does it work */}
      <section id="how-it-works" className="px-6 sm:px-10 py-20 sm:py-28">
        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight uppercase mb-16">
          How does it work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`${step.color} rounded-[var(--radius-card)] p-8 flex flex-col gap-4`}
            >
              <span className="text-sm font-semibold text-black/40 uppercase tracking-widest">
                Step {step.number}
              </span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-[15px] text-black/60 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 sm:px-10 py-20 sm:py-28">
        <h2 className="text-4xl sm:text-5xl font-normal tracking-tight uppercase mb-16">
          Built for creators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`${f.color} rounded-[var(--radius-card)] p-8 flex flex-col gap-3`}
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-[15px] text-black/60 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 sm:px-10 py-20 sm:py-28 text-center">
        <div className="bg-[#DCFBC7] rounded-[var(--radius-card)] py-16 px-8 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Ready to curate your best work?
          </h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-lg mx-auto">
            Join creators who use Curio to organize their tweets and share a
            permanent, themed showcase of their expertise.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3.5 text-base font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Create your Curio &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-[var(--text-light)] font-medium uppercase tracking-wider">
        Powered by Curio
      </footer>
    </div>
  );
}
