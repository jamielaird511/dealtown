"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, MapPin } from "lucide-react";
import {
  isBefore2PM,
  isTimeBetween,
  startsWithinMinutes,
  includesToday,
  getCurrentZeroBasedWeekday,
  timeToMinutes,
} from "@/lib/time";

const DISTANCE_OPTIONS = [
  { value: 1000, label: "1km" },
  { value: 2000, label: "2km" },
  { value: 5000, label: "5km" },
  { value: 10000, label: "10km" },
];

const MAX_REASONABLE_DISTANCE = 50000; // 50km, beyond this we assume bad IP-based location

/**
 * Calculate haversine distance between two coordinates (in meters)
 */
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3;
  const φ1 = a.lat * Math.PI / 180;
  const φ2 = b.lat * Math.PI / 180;
  const Δφ = (b.lat - a.lat) * Math.PI / 180;
  const Δλ = (b.lng - a.lng) * Math.PI / 180;

  const c = Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
}

function formatDistance(meters: number) {
  if (!Number.isFinite(meters)) return null;
  if (meters < 200) return `${Math.round(meters)} m away`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

type Venue = {
  id: number;
  name: string;
  address?: string | null;
  region?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type DealItem = {
  id: number;
  title: string;
  description?: string | null;
  price_cents?: number | null;
  venue: Venue;
  start_time?: string | null;
  end_time?: string | null;
  days?: number[] | null;
  _distance?: number | null; // Added for distance tracking
};

type LunchItem = {
  id: number;
  title?: string | null;
  details?: string | null;
  price?: number | null;
  venue: Venue;
  start_time?: string | null;
  end_time?: string | null;
  days?: number[] | null;
  _distance?: number | null; // Added for distance tracking
};

type HappyHourItem = {
  id: number;
  details?: string | null;
  price_cents?: number | null;
  venue: Venue;
  start_time?: string | null;
  end_time?: string | null;
  days?: number[] | null;
  _distance?: number | null; // Added for distance tracking
};

export default function DealMeModal({
  open,
  onClose,
  currentRegion,
}: {
  open: boolean;
  onClose: () => void;
  currentRegion: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [allDeals, setAllDeals] = useState<DealItem[]>([]);
  const [allLunch, setAllLunch] = useState<LunchItem[]>([]);
  const [allHappyHours, setAllHappyHours] = useState<HappyHourItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000); // 5km default
  const [when, setWhen] = useState<"now" | "next" | "today">("now");
  const hasLoaded = useRef(false);

  // Reset hasLoaded when modal closes so it can load again next time
  useEffect(() => {
    if (!open) {
      hasLoaded.current = false;
      setUserLocation(null); // Reset location on close
      setLocationError(null); // Reset error on close
    }
  }, [open]);

  // Get user location when modal opens
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation not available in this browser – showing all deals.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationError(null);
        console.log("GEO OK", pos.coords);
      },
      (err) => {
        console.warn("GEO ERROR", err);
        setLocationError((err && err.message) ? `${err.message} – showing all deals.` : "Could not get your location – showing all deals.");
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  }, [open]);

  // Fetch all deals when modal opens (only once per open)
  useEffect(() => {
    if (!open || hasLoaded.current) return;

    hasLoaded.current = true;

    async function load() {
      setLoading(true);

      try {
        const [dealsRes, lunchRes, hhRes] = await Promise.all([
          supabase
            .from("deals")
            .select(
              `
              id, title, description, effective_price_cents, price_cents, region,
              day_of_week, start_time, end_time,
              venue:venues!deals_venue_fk ( id, name, address, region, lat, lng )
            `
            )
            .eq("region", currentRegion)
            .eq("is_active", true),
          supabase
            .from("lunch_menus")
            .select(
              `
              id, title, details, price, days_of_week, start_time, end_time,
              venues:venues!lunch_menus_venue_id_fkey ( id, name, address, region, lat, lng )
            `
            )
            .eq("is_active", true),
          supabase
            .from("happy_hours")
            .select(
              `
              id, details, price_cents, days, start_time, end_time,
              venues:venues!happy_hours_venue_id_fkey ( id, name, address, region, lat, lng )
            `
            )
            .eq("is_active", true),
        ]);

        // Filter by region and map to consistent structure
        const deals = (dealsRes.data ?? [])
          .filter((d: any) => d.venue?.region === currentRegion || d.region === currentRegion)
          .map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            price_cents: d.effective_price_cents ?? d.price_cents ?? null,
            venue: d.venue,
            start_time: d.start_time,
            end_time: d.end_time,
            days: null, // deals.day_of_week is string or number, not array
          }));

        const lunch = (lunchRes.data ?? [])
          .filter((l: any) => l.venues?.region === currentRegion)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            details: l.details,
            price: l.price,
            venue: l.venues,
            start_time: l.start_time,
            end_time: l.end_time,
            days: l.days_of_week, // Already array
          }));

        const happyHours = (hhRes.data ?? [])
          .filter((h: any) => h.venues?.region === currentRegion)
          .map((h: any) => ({
            id: h.id,
            details: h.details,
            price_cents: h.price_cents,
            venue: h.venues,
            start_time: h.start_time,
            end_time: h.end_time,
            days: h.days, // Already array (0-based)
          }));

        setAllDeals(deals);
        setAllLunch(lunch);
        setAllHappyHours(happyHours);
      } catch (error) {
        console.error("[DealMeModal] fetch error", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, currentRegion, supabase]);

  // Filter and group deals based on time, distance, and "when" filter
  const { dailyDeals, lunchDeals, happyHours, showFallback } = useMemo(() => {
    // Calculate distances for all items if we have user location
    const withDistancesDaily = allDeals.map((deal) => {
      const v = deal.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...deal, _distance: dist };
      }
      return { ...deal, _distance: null };
    });

    const withDistancesLunch = allLunch.map((lunch) => {
      const v = lunch.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...lunch, _distance: dist };
      }
      return { ...lunch, _distance: null };
    });

    const withDistancesHappy = allHappyHours.map((hh) => {
      const v = hh.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...hh, _distance: dist };
      }
      return { ...hh, _distance: null };
    });

    // Check if location is obviously bad (>50km from all venues)
    const allWithDistances = [
      ...withDistancesDaily,
      ...withDistancesLunch,
      ...withDistancesHappy,
    ];
    const hasAnyClose = allWithDistances.some(
      (d) => typeof d._distance === "number" && d._distance < MAX_REASONABLE_DISTANCE
    );

    // Determine if we should apply distance filtering
    const shouldFilterByDistance = userLocation && hasAnyClose;

    // Daily deals: always allowed, but apply distance if we have a good location
    let filteredDaily: DealItem[] = [];
    if (shouldFilterByDistance) {
      filteredDaily = withDistancesDaily.filter(
        (d) => d._distance == null || d._distance <= radius
      );
    } else {
      filteredDaily = withDistancesDaily;
    }

    // Lunch deals: filter by time rules first, then distance
    let lunchFiltered: LunchItem[] = allLunch;
    if (when === "now") {
      lunchFiltered = allLunch.filter((l) => {
        if (!isBefore2PM()) return false;
        if (!includesToday(l.days)) return false;
        if (l.start_time && l.end_time) {
          return isTimeBetween(l.start_time, l.end_time);
        }
        return true; // No time restriction = valid
      });
    } else if (when === "next") {
      // Next hour: show if starts within 60 minutes
      lunchFiltered = allLunch.filter((l) => {
        if (!isBefore2PM()) return false;
        if (!includesToday(l.days)) return false;
        if (l.start_time) {
          return startsWithinMinutes(l.start_time, 60);
        }
        return false;
      });
    } else {
      // Today: show if includes today and before 2pm
      lunchFiltered = allLunch.filter((l) => {
        if (!isBefore2PM()) return false;
        return includesToday(l.days);
      });
    }

    // Map to include distances and apply distance filter
    let lunchWithDistances = lunchFiltered.map((lunch) => {
      const v = lunch.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...lunch, _distance: dist };
      }
      return { ...lunch, _distance: null };
    });

    let filteredLunch: LunchItem[] = [];
    if (shouldFilterByDistance) {
      filteredLunch = lunchWithDistances.filter(
        (l) => l._distance == null || l._distance <= radius
      );
    } else {
      filteredLunch = lunchWithDistances;
    }

    // Happy hours: filter by time rules first, then distance
    let hhFiltered: HappyHourItem[] = allHappyHours;
    if (when === "now") {
      hhFiltered = allHappyHours.filter((h) => {
        if (!includesToday(h.days)) return false;
        if (h.start_time && h.end_time) {
          return isTimeBetween(h.start_time, h.end_time) || startsWithinMinutes(h.start_time, 60);
        }
        return false;
      });
    } else if (when === "next") {
      // Next hour: show if starts within 60 minutes
      hhFiltered = allHappyHours.filter((h) => {
        if (!includesToday(h.days)) return false;
        if (h.start_time) {
          return startsWithinMinutes(h.start_time, 60);
        }
        return false;
      });
    } else {
      // Today: show if includes today (regardless of time)
      hhFiltered = allHappyHours.filter((h) => includesToday(h.days));
    }

    // Map to include distances and apply distance filter
    let hhWithDistances = hhFiltered.map((hh) => {
      const v = hh.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...hh, _distance: dist };
      }
      return { ...hh, _distance: null };
    });

    let filteredHappy: HappyHourItem[] = [];
    if (shouldFilterByDistance) {
      filteredHappy = hhWithDistances.filter(
        (h) => h._distance == null || h._distance <= radius
      );
    } else {
      filteredHappy = hhWithDistances;
    }

    // Check if nothing found after filtering
    const nothingFound =
      filteredDaily.length === 0 &&
      filteredLunch.length === 0 &&
      filteredHappy.length === 0;

    return {
      dailyDeals: filteredDaily,
      lunchDeals: filteredLunch,
      happyHours: filteredHappy,
      showFallback: nothingFound && allDeals.length > 0,
    };
  }, [allDeals, allLunch, allHappyHours, userLocation, radius, when]);

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "";
    const match = time.match(/^(\d{2}):(\d{2})/);
    if (!match) return time;
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "pm" : "am";
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (start: string | null | undefined, end: string | null | undefined): string => {
    const s = formatTime(start);
    const e = formatTime(end);
    if (!s && !e) return "";
    if (s && e) return `${s} - ${e}`;
    return s || e;
  };

  const regionLabel =
    currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Deals near you</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Within:</span>
            <div className="flex gap-1">
              {DISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    radius === opt.value
                      ? "bg-orange-500 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">When:</span>
            <div className="flex gap-1">
              {(["now", "next", "today"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWhen(w)}
                  className={`px-3 py-1 text-sm rounded-md transition capitalize ${
                    when === w
                      ? "bg-orange-500 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  {w === "next" ? "Next hour" : w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading deals...</div>
          ) : (
            <>
              {locationError && (
                <p className="text-xs text-red-500 mb-2">
                  {locationError}
                </p>
              )}
              {showFallback ? (
                <>
                  <div className="text-center py-4 text-gray-600">
                    No deals matched your filters (distance/time). Here are today's deals in {regionLabel}.
                  </div>
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Daily Deals</h3>
                    {allDeals.length === 0 ? (
                      <p className="text-gray-500 text-sm">No deals available.</p>
                    ) : (
                      <ul className="space-y-3">
                        {allDeals.map((deal) => {
                          // For fallback, calculate distance on the fly (venue may not have _distance yet)
                          let distText: string | null = null;
                          if (deal.venue?.lat && deal.venue?.lng && userLocation) {
                            const dist = haversineMeters(userLocation, { lat: deal.venue.lat, lng: deal.venue.lng });
                            if (dist < MAX_REASONABLE_DISTANCE) {
                              distText = formatDistance(dist);
                            }
                          }
                          return (
                            <li
                              key={deal.id}
                              className="p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{deal.venue.name}</div>
                                  <div className="text-sm text-gray-700 mt-1">
                                    {deal.title}
                                  </div>
                                  {deal.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {deal.description}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    {deal.venue.address && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {deal.venue.address}
                                      </span>
                                    )}
                                    {distText && <span>{distText}</span>}
                                  </div>
                                </div>
                                {deal.price_cents && (
                                  <div className="ml-4 text-right">
                                    <div className="font-semibold text-orange-600">
                                      ${(deal.price_cents / 100).toFixed(2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                </>
              ) : (
                <>
                  {/* Daily Deals */}
                  {dailyDeals.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3">Daily Deals</h3>
                  <ul className="space-y-3">
                    {dailyDeals.map((deal) => {
                      const distText =
                        deal._distance != null && deal._distance < MAX_REASONABLE_DISTANCE
                          ? formatDistance(deal._distance)
                          : null;
                      return (
                        <li
                          key={deal.id}
                          className="p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{deal.venue.name}</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {deal.title}
                              </div>
                              {deal.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {deal.description}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                {deal.venue.address && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {deal.venue.address}
                                  </span>
                                )}
                                {distText && <span>{distText}</span>}
                              </div>
                            </div>
                            {deal.price_cents && (
                              <div className="ml-4 text-right">
                                <div className="font-semibold text-orange-600">
                                  ${(deal.price_cents / 100).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Lunch Deals */}
              {lunchDeals.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3">Lunch Deals</h3>
                  <ul className="space-y-3">
                    {lunchDeals.map((lunch) => {
                      const distText =
                        lunch._distance != null && lunch._distance < MAX_REASONABLE_DISTANCE
                          ? formatDistance(lunch._distance)
                          : null;
                      const timeRange = formatTimeRange(
                        lunch.start_time,
                        lunch.end_time
                      );
                      return (
                        <li
                          key={lunch.id}
                          className="p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{lunch.venue.name}</div>
                              {(lunch.title || lunch.details) && (
                                <div className="text-sm text-gray-700 mt-1">
                                  {lunch.title || lunch.details}
                                </div>
                              )}
                              {timeRange && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {timeRange}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                {lunch.venue.address && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {lunch.venue.address}
                                  </span>
                                )}
                                {distText && <span>{distText}</span>}
                              </div>
                            </div>
                            {lunch.price && (
                              <div className="ml-4 text-right">
                                <div className="font-semibold text-orange-600">
                                  ${lunch.price.toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Happy Hours */}
              {happyHours.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3">Happy Hours</h3>
                  <ul className="space-y-3">
                    {happyHours.map((hh) => {
                      const distText =
                        hh._distance != null && hh._distance < MAX_REASONABLE_DISTANCE
                          ? formatDistance(hh._distance)
                          : null;
                      const timeRange = formatTimeRange(hh.start_time, hh.end_time);
                      const startingSoon = hh.start_time
                        ? startsWithinMinutes(hh.start_time, 60) &&
                          !isTimeBetween(hh.start_time, hh.end_time)
                        : false;
                      return (
                        <li
                          key={hh.id}
                          className="p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{hh.venue.name}</div>
                                {startingSoon && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    Starting soon
                                  </span>
                                )}
                              </div>
                              {hh.details && (
                                <div className="text-sm text-gray-700 mt-1">
                                  {hh.details}
                                </div>
                              )}
                              {timeRange && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {timeRange}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                {hh.venue.address && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {hh.venue.address}
                                  </span>
                                )}
                                {distText && <span>{distText}</span>}
                              </div>
                            </div>
                            {hh.price_cents && (
                              <div className="ml-4 text-right">
                                <div className="font-semibold text-orange-600">
                                  ${(hh.price_cents / 100).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

                  {!showFallback && dailyDeals.length === 0 && lunchDeals.length === 0 && happyHours.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No deals matched your criteria. Try adjusting your filters.
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
