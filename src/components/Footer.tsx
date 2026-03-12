import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-10 sm:py-14 flex flex-col items-center gap-3">
      <Link href="/" className="flex items-center gap-1.5">
        <img src="/logo-sm.png" alt="" className="w-14 h-14 object-contain" />
        <span
          className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
        >
          Curio.
        </span>
      </Link>
      <p className="text-xs text-[var(--text-muted)]">
        Your best tweets, organized by topic.
      </p>
    </footer>
  );
}
