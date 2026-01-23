export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          DealTown is temporarily offline
        </h1>
        <p className="mt-4 text-gray-600">
          We&apos;re working on improvements. Please check back soon.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Contact:{" "}
          <a
            href="mailto:hello@dealtown.co.nz"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            hello@dealtown.co.nz
          </a>
        </p>
      </div>
    </div>
  );
}
