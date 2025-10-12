import Link from "next/link";

export default function AdminHeader({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  subtitle?: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        ) : null}
      </div>
      <Link
        href={ctaHref}
        className="rounded-xl bg-orange-500 px-4 py-2 text-white shadow-sm hover:bg-orange-600"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

