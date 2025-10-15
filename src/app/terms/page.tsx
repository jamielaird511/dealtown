export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-700">
      <h1 className="text-2xl font-semibold mb-6">Terms of Service</h1>
      <p className="mb-4 text-sm md:text-base">
        DealTown is a community site that lists local deals and fuel prices for
        informational purposes only. While we do our best to keep everything
        accurate and up-to-date, prices and offers can change without notice.
      </p>
      <p className="mb-4 text-sm md:text-base">
        By using DealTown, you agree to use the site responsibly and understand
        that we don't guarantee the accuracy of third-party information or
        promotions. Always check directly with the venue before purchasing.
      </p>
      <p className="text-sm md:text-base">
        Contact us at{" "}
        <a href="mailto:hello@dealtown.co.nz" className="text-orange-600 hover:underline">
          hello@dealtown.co.nz
        </a>{" "}
        with any questions or feedback.
      </p>
    </main>
  );
}
