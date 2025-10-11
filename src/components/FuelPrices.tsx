import { fetchFuelPrices } from "@/lib/fetchers";
import { formatDollarsFromCents, labelProduct } from "@/lib/format";

export default async function FuelPrices() {
  const prices = await fetchFuelPrices();
  
  if (!prices?.length) return null;

  return (
    <section className="mt-4 mb-6">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-lg font-semibold mb-3">Fuel Prices</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {prices.map((p, idx) => (
            <div
              key={`${p.product}-${p.brand}-${idx}`}
              className="flex-shrink-0 whitespace-nowrap rounded-full border bg-white px-4 py-2 text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="font-bold text-primary">{labelProduct(p.product)}</span>
              <span className="mx-2 font-semibold">{formatDollarsFromCents(p.price_cents)}</span>
              <span className="text-muted-foreground">
                • {p.brand} {p.venue_suburb}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

