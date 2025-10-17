import Link from "next/link";

export default function StickyNav() {
  return (
    <nav
      className="
        sticky top-0 z-40 
        bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 
        border-b
      "
      aria-label="Quick navigation"
    >
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <Link
          href="/"
          className="rounded-xl px-3 py-1.5 border shadow-sm bg-white hover:bg-gray-50 whitespace-nowrap"
        >
          🏠 Home
        </Link>
        <Link
          href="/lunch"
          className="rounded-xl px-3 py-1.5 border shadow-sm bg-white hover:bg-gray-50 whitespace-nowrap"
        >
          🍽️ Lunch Specials
        </Link>
        <Link
          href="/happy-hour"
          className="rounded-xl px-3 py-1.5 border shadow-sm bg-white hover:bg-gray-50 whitespace-nowrap"
        >
          🍺 Happy Hour
        </Link>

        {/* Optional: anchor to jump back to the deals section on home */}
        <a
          href="/#today-deals"
          className="ml-auto text-sm underline whitespace-nowrap"
        >
          Back to Today's Deals
        </a>
      </div>
    </nav>
  );
}

