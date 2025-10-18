export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t mt-12 py-6 text-center text-sm text-gray-500">
      <p>© {year} DealTown. All rights reserved.</p>
      <p className="mt-1">
        <a href="mailto:hello@dealtown.co.nz" className="hover:underline">
          hello@dealtown.co.nz
        </a>
        {" • "}
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        {" • "}
        <a href="/terms" className="hover:underline">Terms</a>
      </p>
      <p className="text-xs text-muted-foreground">
        Local deals, updated daily.
      </p>
    </footer>
  );
}
