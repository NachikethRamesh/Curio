import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import Footer from "@/components/Footer";

const STEPS = [
  {
    number: "01",
    title: "Claim your handle",
    desc: "Sign up with your X handle. It becomes your public Curio profile.",
  },
  {
    number: "02",
    title: "Create collections",
    desc: 'Organize your tweets into themed buckets like "Hiring Advice" or "Tech Takes".',
  },
  {
    number: "03",
    title: "Paste your tweet URLs",
    desc: "Simply drop the links. We automatically fetch, format, and display them beautifully.",
  },
  {
    number: "04",
    title: "Share your profile",
    desc: "Distribute your single link everywhere. Let your audience explore your best thoughts without the noise.",
  },
];

const FEATURES = [
  {
    title: "Simple and secure",
    desc: "Curio verifies your handle and only lets you save your own tweets. Authentic profiles, zero impersonation.",
    color: "bg-[#EFE7FD]",
  },
  {
    title: "Instant embeds",
    desc: "Tweets render as rich embeds with full styling. No screenshots, no broken links.",
    color: "bg-[#DCFBC7]",
  },
  {
    title: "Drag to reorder",
    desc: "Arrange tweets and collections in exactly the order you want. Your best work, front and center.",
    color: "bg-[#FDDADA]",
  },
  {
    title: "Cached forever",
    desc: "Tweets are fetched once and stored. Even if the original gets deleted, your Curio profile stays intact.",
    color: "bg-[#CEF3FD]",
  },
  {
    title: "Free to use",
    desc: "No paid API keys, no subscriptions. Curio runs on free infrastructure and keeps costs near zero.",
    color: "bg-[#FEF6D0]",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-[5%]">
        <header className="pt-[100px] sm:pt-[140px] lg:pt-[180px] pb-[40px] sm:pb-[80px] lg:pb-[120px] min-h-[auto] lg:min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[80px] items-center">
          <div className="relative z-[2] text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 mb-6">
              <img src="/logo-sm.png" alt="" className="w-14 h-14 object-contain" />
              <span
                className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
              >
                Curio.
              </span>
            </div>
            <h1
              className="text-[2rem] sm:text-[3rem] lg:text-[3.5rem] leading-[1.1] tracking-[-0.02em] mb-6 sm:mb-8 italic"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              <span className="bg-gradient-to-br from-[#2A2826] to-[#6b645e] bg-clip-text text-transparent">
                Turn your best X posts into a portfolio people can actually browse.
              </span>
            </h1>
            <p className="text-[1rem] sm:text-[1.2rem] text-[var(--text-muted)] mb-8 sm:mb-12 max-w-[480px] leading-[1.6] mx-auto lg:mx-0">
              Stop letting the timeline bury your best work. Let&apos;s make sure your best tweets reach your audience.
              <br /><br />
              Curio lets you curate your tweets into topic-based collections and share them with a single link.
            </p>
            <div className="flex gap-4 items-center justify-center lg:justify-start">
              <Link
                href="/try"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full text-[0.95rem] font-medium bg-[var(--text-main)] text-white shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] hover:bg-[#1a1918] transition-all"
              >
                Try it now!
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full text-[0.95rem] font-medium bg-white/80 text-[var(--text-main)] border border-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.02)] backdrop-blur-[10px] hover:bg-white hover:-translate-y-0.5 transition-all"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Hero visual - floating glass cards */}
          <div className="relative h-[600px] hidden lg:block" style={{ perspective: "1000px" }}>
            {/* Sub card 1 - top left */}
            <div
              className="absolute w-[280px] h-[200px] top-[15%] left-[5%] z-[2] opacity-90 bg-white/75 backdrop-blur-[24px] border border-white/90 rounded-[32px] p-6 shadow-[var(--shadow-soft)] flex flex-col justify-center animate-[float-slow_7s_ease-in-out_infinite_alternate-reverse]"
              style={{ transform: "rotate(-12deg)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-full bg-[#e0dcd9] bg-cover shrink-0"
                  style={{ backgroundImage: "url('https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop')" }}
                />
                <div>
                  <div className="h-2 w-20 bg-[#d4d0cd] rounded mb-1.5" />
                  <div className="h-1.5 w-[50px] bg-[#e8e5e3] rounded" />
                </div>
              </div>
              <div className="h-2 w-[85%] bg-[#d4d0cd] rounded mb-2" />
              <div className="h-2 w-full bg-[#d4d0cd] rounded mb-2" />
              <div className="h-2 w-[70%] bg-[#d4d0cd] rounded" />
            </div>

            {/* Sub card 2 - bottom right */}
            <div
              className="absolute w-[260px] h-[320px] bottom-[10%] right-[5%] z-[1] opacity-85 bg-white/75 backdrop-blur-[24px] border border-white/90 rounded-[32px] p-6 shadow-[var(--shadow-soft)] animate-[float-slow_8s_ease-in-out_infinite_alternate]"
              style={{ transform: "rotate(8deg)" }}
            >
              <div className="absolute -top-5 right-5 bg-white px-4 py-2 rounded-full text-[0.8rem] font-semibold text-[var(--text-muted)] shadow-[0_4px_12px_rgba(0,0,0,0.04)] rotate-[5deg] z-10">
                Design Notes
              </div>
              <div className="w-full h-[160px] bg-[#f0ebe6] rounded-xl my-4 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="h-2 w-[85%] bg-[#e8e5e3] rounded mb-2" />
              <div className="h-2 w-[70%] bg-[#e8e5e3] rounded" />
            </div>

            {/* Main card - center */}
            <div
              className="absolute w-[340px] h-[420px] top-1/2 left-1/2 z-[3] bg-white/75 backdrop-blur-[24px] border border-white/90 rounded-[32px] p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-float)] animate-[float-slow_6s_ease-in-out_infinite_alternate] transition-[shadow] duration-500"
              style={{ transform: "translate(-50%, -50%) rotate(-2deg)" }}
            >
              <div className="absolute bottom-10 -left-5 bg-white px-4 py-2 rounded-full text-[0.8rem] font-semibold text-[var(--text-muted)] shadow-[0_4px_12px_rgba(0,0,0,0.04)] -rotate-[8deg] z-10">
                Collection
              </div>
              <h3
                className="text-2xl mb-2"
                style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
              >
                Thoughts on Aesthetics
              </h3>
              <p className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)] mb-5">
                8 Tweets &bull; Curated Today
              </p>

              {/* Fake tweet 1 */}
              <div className="bg-white/50 rounded-2xl p-4 mb-3 border border-white/80">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full bg-[#e0dcd9] bg-cover shrink-0"
                    style={{ backgroundImage: "url('https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop')" }}
                  />
                  <div>
                    <div className="h-2 w-20 bg-[#b8b4b0] rounded mb-1.5" />
                    <div className="h-1.5 w-[50px] bg-[#e8e5e3] rounded" />
                  </div>
                </div>
                <div className="h-2 w-[85%] bg-[#d4d0cd] rounded mb-2" />
                <div className="h-2 w-full bg-[#d4d0cd] rounded" />
              </div>

              {/* Fake tweet 2 */}
              <div className="bg-white/50 rounded-2xl p-4 border border-white/80">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full bg-[#e0dcd9] bg-cover shrink-0"
                    style={{ backgroundImage: "url('https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop')" }}
                  />
                  <div>
                    <div className="h-2 w-20 bg-[#b8b4b0] rounded mb-1.5" />
                    <div className="h-1.5 w-[50px] bg-[#e8e5e3] rounded" />
                  </div>
                </div>
                <div className="h-2 w-full bg-[#d4d0cd] rounded mb-2" />
                <div className="h-2 w-[70%] bg-[#d4d0cd] rounded" />
              </div>
            </div>
          </div>
        </header>

        {/* How it works */}
        <section id="how-it-works" className="py-[60px] sm:py-[120px]">
          <div className="text-center mb-10 sm:mb-20">
            <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
              The Process
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] mt-4"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              How does it work?
            </h2>
          </div>

          <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
            {/* Dashed connector line */}
            <div className="hidden sm:block absolute top-1/2 left-[5%] right-[5%] h-[2px] z-0"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(120, 116, 112, 0.3) 50%, rgba(255,255,255,0) 0%)",
                backgroundSize: "12px 2px",
                backgroundRepeat: "repeat-x",
              }}
            />

            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`flex-1 bg-white/75 backdrop-blur-[16px] border border-white/90 rounded-[var(--radius-md)] p-5 sm:py-8 sm:px-6 shadow-[var(--shadow-soft)] relative z-[1] flex flex-col items-center text-center hover:scale-[1.02] transition-transform ${
                  i % 2 === 1 ? "sm:translate-y-10" : ""
                }`}
              >
                <span
                  className="text-5xl italic text-[#d1c9c4] leading-none mb-6"
                  style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
                >
                  {step.number}
                </span>
                <h4 className="text-[1.1rem] font-semibold mb-3 text-[var(--text-main)]">
                  {step.title}
                </h4>
                <p className="text-[0.9rem] text-[var(--text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why not just use X? */}
        <section id="why-curio" className="py-[60px] sm:py-[120px]">
          <div className="text-center mb-10 sm:mb-16">
            <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
              The Difference
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] mt-4"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              Why not just use X?
            </h2>
            <p className="text-[1rem] sm:text-[1.1rem] text-[var(--text-muted)] mt-4 sm:mt-6 max-w-[600px] mx-auto leading-[1.6]">
              Posting is not the same as showcasing. Curio helps you organize your best tweets into a public, evergreen profile people can actually browse.
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-[800px] mx-auto">
            {/* Pinned post */}
            <div className="bg-white/75 backdrop-blur-[16px] border border-white/90 rounded-[var(--radius-md)] p-5 sm:p-7 shadow-[var(--shadow-soft)] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
              <div className="sm:min-w-[160px]">
                <h3 className="text-[1.1rem] font-semibold text-[var(--text-main)]">Pinned post</h3>
              </div>
              <div className="flex-1">
                <p className="text-[0.9rem] text-[var(--text-muted)] leading-relaxed">
                  One tweet, pinned at one moment in time.
                </p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-1.5 opacity-70">
                  Best for highlighting a single announcement or update.
                </p>
              </div>
            </div>

            {/* X Pro collection */}
            <div className="bg-white/75 backdrop-blur-[16px] border border-white/90 rounded-[var(--radius-md)] p-5 sm:p-7 shadow-[var(--shadow-soft)] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
              <div className="sm:min-w-[160px]">
                <h3 className="text-[1.1rem] font-semibold text-[var(--text-main)]">X Pro collection</h3>
              </div>
              <div className="flex-1">
                <p className="text-[0.9rem] text-[var(--text-muted)] leading-relaxed">
                  A way to group posts inside X for monitoring or internal curation. Requires a subscription to X Pro.
                </p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-1.5 opacity-70">
                  Best for organizing posts operationally within the X ecosystem.
                </p>
              </div>
            </div>

            {/* Curio */}
            <div className="bg-[var(--text-main)] rounded-[var(--radius-md)] p-5 sm:p-7 shadow-[0_8px_24px_rgba(42,40,38,0.15)] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
              <div className="sm:min-w-[160px]">
                <h3
                  className="text-[1.2rem] font-medium italic text-white"
                  style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
                >
                  Curio
                </h3>
              </div>
              <div className="flex-1">
                <p className="text-[0.9rem] text-white/85 leading-relaxed">
                  A public, evergreen, profile-style showcase for your best tweets across themes.
                </p>
                <p className="text-[0.8rem] text-white/55 mt-1.5">
                  Best for turning your best ideas into a browsable portfolio you can share anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built for creators on X */}
        <section id="features" className="py-[60px] sm:py-[120px]">
          <div className="text-center mb-10 sm:mb-20">
            <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
              Features
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] mt-4"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              Built for creators on X
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.slice(0, 3).map((f) => (
              <div
                key={f.title}
                className="bg-white/75 backdrop-blur-[16px] border border-white/90 rounded-[var(--radius-md)] p-5 sm:p-8 shadow-[var(--shadow-soft)] flex flex-col gap-3 hover:-translate-y-1 transition-transform"
              >
                <h3
                  className="text-[1.3rem] italic font-normal text-[var(--text-main)]"
                  style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-[0.9rem] text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 sm:max-w-[66%] sm:mx-auto">
            {FEATURES.slice(3).map((f) => (
              <div
                key={f.title}
                className="bg-white/75 backdrop-blur-[16px] border border-white/90 rounded-[var(--radius-md)] p-5 sm:p-8 shadow-[var(--shadow-soft)] flex flex-col gap-3 hover:-translate-y-1 transition-transform"
              >
                <h3
                  className="text-[1.3rem] italic font-normal text-[var(--text-main)]"
                  style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-[0.9rem] text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature showcase */}
        <section className="py-[60px] sm:py-[120px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">
          <div className="bg-white/50 border border-white/90 rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 shadow-[inset_0_0_40px_rgba(255,255,255,0.8),var(--shadow-soft)] overflow-hidden">
            <div className="bg-white rounded-full px-5 py-3 inline-flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-[0.9rem] font-medium mb-4">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
              curio-brown.vercel.app/designthoughts
            </div>
            <div className="bg-white/60 rounded-full px-5 py-3 inline-flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-[0.9rem] font-medium text-[var(--text-muted)] backdrop-blur-sm ml-5 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              Share Collection
            </div>
            <div className="mt-10 p-6 bg-white/70 rounded-3xl backdrop-blur-[10px]">
              <div className="h-2 w-full bg-[#d4d0cd] rounded mb-2" />
              <div className="h-2 w-[85%] bg-[#d4d0cd] rounded mb-2" />
              <div className="h-2 w-[70%] bg-[#d4d0cd] rounded" />
            </div>
          </div>

          <div className="lg:pr-10 text-center lg:text-left">
            <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
              Your Archive
            </span>
            <h3
              className="text-[1.8rem] sm:text-[2.5rem] tracking-[-0.02em] mb-4 sm:mb-6 mt-4"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              A quiet space for your loud thoughts.
            </h3>
            <p className="text-[1.1rem] text-[var(--text-muted)] mb-8 leading-[1.6]">
              The timeline is ephemeral, designed to wash away yesterday&apos;s genius.
              Curio acts as a serene, beautifully lit gallery for the ideas you want to stick around.
            </p>

          </div>
        </section>

        {/* Final CTA */}
        <section className="py-[80px] sm:py-[160px] text-center">
          <div className="bg-white/75 backdrop-blur-[24px] border border-white/90 rounded-[24px] sm:rounded-[48px] py-12 sm:py-20 px-6 sm:px-10 max-w-[800px] mx-auto shadow-[var(--shadow-float)]">
            <h2
              className="text-[2rem] sm:text-[3rem] lg:text-[3.5rem] tracking-[-0.02em] mb-4 sm:mb-6"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              Start curating today.
            </h2>
            <p className="text-[1rem] sm:text-[1.2rem] text-[var(--text-muted)] mb-8 sm:mb-10">
              Join thousands of writers, designers, and thinkers preserving their best work.
            </p>
            <Link
              href="/try"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full text-[1.1rem] font-medium bg-[var(--text-main)] text-white shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] hover:bg-[#1a1918] transition-all"
            >
              Try it now!
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
