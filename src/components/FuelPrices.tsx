import { fetchFuelStations, type FuelRow, moneyFromCents } from "@/lib/data";

export default async function FuelPrices() {
  const prices: FuelRow[] = await fetchFuelStations();

  if (!prices?.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
        No fuel prices available.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Fuel Prices</h2>
      </div>
      <div className="divide-y">
        {prices.map((p: FuelRow, idx: number) => (
          <div key={`${p.station_id}-${p.fuel}-${idx}`} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name ?? "Station"}</div>
              <div className="text-xs text-gray-500">{p.fuel}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {p.price_cents != null ? `$${moneyFromCents(p.price_cents)}` : "—"}
              </div>
              {p.observed_at && (
                <div className="text-xs text-gray-400">
                  {new Date(p.observed_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
