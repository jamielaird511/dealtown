import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex justify-end">
          <Link
            href="/admin"
            className="inline-flex items-center rounded-lg bg-orange-500 text-white px-3 py-1.5 hover:bg-orange-600"
          >
            Admin Home
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}
