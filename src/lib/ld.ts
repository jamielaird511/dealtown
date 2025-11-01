// Task: JSON-LD helpers
export function collectionJsonLd(opts: {
  name: string;
  url: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    url: opts.url,
    description: opts.description ?? opts.name,
    isPartOf: {
      "@type": "WebSite",
      name: "DealTown",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealtown.nz",
    },
  };
}


