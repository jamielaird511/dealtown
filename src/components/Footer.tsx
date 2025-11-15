export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-600 flex items-center justify-between">
        <p>© {year} DealTown • Built in Queenstown</p>
        <a href="/submit" className="px-3 py-1.5 rounded-full text-sm bg-accent text-white">
          Submit a Deal
        </a>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 text-center text-xs text-slate-500">
        <p className="mt-1">
          <a href="mailto:hello@dealtown.co.nz" className="hover:underline">
            hello@dealtown.co.nz
          </a>
          {" • "}
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          {" • "}
          <a href="/terms" className="hover:underline">Terms</a>
          {" • "}
          <a href="/admin" className="hover:underline">Admin</a>
        </p>
      </div>
    </footer>
  );
}
