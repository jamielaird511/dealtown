export const metadata = {
  title: "Privacy Policy | DealTown Queenstown",
  description: "Privacy policy for DealTown Queenstown - how we collect and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-gray-700">
      <h1 className="text-2xl font-semibold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm md:text-base">
        At DealTown, we respect your privacy. We only collect the minimum
        amount of information necessary to make the site work — things like
        basic analytics to understand which pages are popular. We never sell or
        share your personal data.
      </p>
      <p className="mb-4 text-sm md:text-base">
        Any information you voluntarily provide (for example, contacting us at
        hello@dealtown.co.nz) is used only to respond to your inquiry. We use
        standard cookies and analytics tools to keep improving DealTown's
        performance and usability.
      </p>
      <p className="text-sm md:text-base">
        If you have questions or want your data removed, email us anytime at{" "}
        <a href="mailto:hello@dealtown.co.nz" className="text-orange-600 hover:underline">
          hello@dealtown.co.nz
        </a>.
      </p>
    </main>
  );
}
