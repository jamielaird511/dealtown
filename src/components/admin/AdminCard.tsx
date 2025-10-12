import Link from "next/link";

export function AdminCard({
  title,
  description,
  href,
}: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition"
    >
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </Link>
  );
}

