import { Fuel as FuelIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function dollars(cents?: number | null) {
  if (cents == null) return "";
  return `$${(cents / 100).toFixed(2)}`;
}
function label(p: string) {
  return p.toLowerCase() === "diesel" ? "Diesel" : p.toUpperCase();
}
function relative(ts?: string | null) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function FuelStrip() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fuel_best_by_product")
    .select("product, price_cents, observed_at, brand, venue_suburb")
    .order("product", { ascending: true });

  if (error || !data?.length) return null;

  const latest = data.reduce(
    (acc, r) => (r.observed_at > acc ? r.observed_at : acc),
    data[0].observed_at
  );

  return (
    <section className="sticky top-[72px] z-20">
      <div className="container-page">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <FuelIcon className="w-5 h-5 text-neutral-500" />
            <span className="font-medium">Fuel Prices</span>
            <span className="ml-auto text-xs text-neutral-400">Updated {relative(latest)}</span>
          </div>

          <div className="chips mt-2">
            {data.map((p) => (
              <span key={`${p.product}-${p.brand}-${p.venue_suburb}`} className="chip">
                <span className="font-semibold">{label(p.product)}</span>
                <span className="mx-1">{dollars(p.price_cents)}</span>
                <span className="muted">• {p.brand} {p.venue_suburb ?? ""}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
