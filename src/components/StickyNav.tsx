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
      <div className="max-w-3xl mx-auto px-2">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2 sm:overflow-x-visible py-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border shadow-sm bg-white hover:bg-gray-50 shrink-0 text-center whitespace-normal leading-tight h-auto min-h-[44px] px-3 py-2"
          >
            🏠 Today's Deals
          </Link>
          <Link
            href="/lunch"
            className="inline-flex items-center justify-center rounded-full border shadow-sm bg-white hover:bg-gray-50 shrink-0 text-center whitespace-normal leading-tight h-auto min-h-[44px] px-3 py-2"
          >
            🍽️ Lunch Specials
          </Link>
          <Link
            href="/happy-hour"
            className="inline-flex items-center justify-center rounded-full border shadow-sm bg-white hover:bg-gray-50 shrink-0 text-center whitespace-normal leading-tight h-auto min-h-[44px] px-3 py-2"
          >
            🍺 Happy Hour
          </Link>
        </div>
      </div>
    </nav>
  );
}

