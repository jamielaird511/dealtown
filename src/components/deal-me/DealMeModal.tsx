"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isBefore2PM,
  isTimeBetween,
  startsWithinMinutes,
  includesToday,
  getCurrentZeroBasedWeekday,
  timeToMinutes,
} from "@/lib/time";
import { LocationInput } from "./LocationInput";

const DISTANCE_OPTIONS = [
  { value: 500, label: "500 m" },
  { value: 1000, label: "1 km" },
  { value: 2000, label: "2 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: null, label: "Whole region" },
];

const MAX_REASONABLE_DISTANCE = 50000; // 50km, beyond this we assume bad IP-based location

// Map UI labels to internal deal type slugs
const DEAL_TYPE_MAP: Record<string, "all" | "daily" | "lunch" | "happy-hour"> = {
  "All deals": "all",
  "Daily deals": "daily",
  "Lunch specials": "lunch",
  "Happy hour": "happy-hour",
};

/**
 * Check if current time is before 3pm (15:00)
 */
function isBefore3pm(date = new Date()) {
  const hour = date.getHours();
  return hour < 15; // 0–14 = before 3pm
}

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
  if (meters < 250) return "<250 m away";
  if (meters < 500) return "<500 m away";
  if (meters < 1000) return "<1 km away";
  if (meters < 2000) return "<2 km away";
  
  const km = meters / 1000;
  if (km < 5) return "<5 km away";
  if (km < 10) return "<10 km away";
  return "10+ km away";
}

function buildMapsLink(venue: { address?: string | null; lat?: number | null; lng?: number | null }) {
  if (venue?.lat && venue?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;
  }
  if (venue?.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`;
  }
  return null;
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [allDeals, setAllDeals] = useState<DealItem[]>([]);
  const [allLunch, setAllLunch] = useState<LunchItem[]>([]);
  const [allHappyHours, setAllHappyHours] = useState<HappyHourItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [dealTypeLabel, setDealTypeLabel] = useState<string>("All deals");
  
  // Get internal deal type from label
  const dealType = DEAL_TYPE_MAP[dealTypeLabel] ?? "all";
  const [radius, setRadius] = useState<number | null>(2000); // 2km default
  const [locationSource, setLocationSource] = useState<"auto" | "manual">("auto");
  const [manualAddress, setManualAddress] = useState<string>("");
  const [when, setWhen] = useState<"now" | "1hour" | "2hours" | "today">("today");
  const [isFallback, setIsFallback] = useState(false);
  const hasLoaded = useRef(false);

  // lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    console.log("[deal-me] region:", currentRegion);
  }, [open, currentRegion]);

  // Handler for "Use my location" button
  const handleUseMyLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationError("Geolocation not available – try typing a location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationError(null);
        setLocationSource("auto");
      },
      (err) => {
        setLocationError(err?.message || "Could not get your location – try typing a location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  // Handler for location selected from Google Places
  const handleLocationFromSearch = (loc: { lat: number; lng: number; description?: string | null }) => {
    setUserLocation({ lat: loc.lat, lng: loc.lng });
    if (typeof loc.description === "string") {
      setManualAddress(loc.description);
    }
    setLocationError(null);
    setLocationSource("manual");
  };

  // Reset hasLoaded when modal closes so it can load again next time
  useEffect(() => {
    if (!open) {
      hasLoaded.current = false;
      setUserLocation(null); // Reset location on close
      setLocationError(null); // Reset error on close
      setLocationSource("auto"); // Reset to auto location
      setManualAddress("");
          setDealTypeLabel("All deals"); // Reset to all deals
      setRadius(2000); // Reset to 2km
      setWhen("today"); // Reset to "Today"
      setIsInitialLoad(true); // Reset initial load state
      setIsFallback(false); // Reset fallback state
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
        setLocationSource("auto");
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
      setIsInitialLoad(true);
      const startTime = Date.now();

      try {
        // 1) daily deals for this region
        const dealsPromise = supabase
          .from("deals")
          .select(
            `
            id, title, description, effective_price_cents, price_cents, region,
            day_of_week, start_time, end_time,
            venue:venues!deals_venue_fk ( id, name, address, region, lat, lng )
          `
          )
          .eq("region", currentRegion)
          .eq("is_active", true);

        // 2) lunch specials – from the *view*
        const lunchPromise = supabase
          .from("lunch_specials")
          .select("*")
          .eq("is_active", true);

        // 3) happy hours
        const hhPromise = supabase
          .from("happy_hours")
          .select(
            `
            id,
            details,
            price_cents,
            start_time,
            end_time,
            days,
            venue:venues!happy_hours_venue_id_fkey ( id, name, address, suburb, region, website_url, lat, lng )
          `
          )
          .eq("is_active", true);

        const [dealsRes, lunchViewRes, hhRes] = await Promise.all([
          dealsPromise,
          lunchPromise,
          hhPromise,
        ]);

        // ----- DAILY DEALS -----
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
            day_of_week: d.day_of_week,
            days: null,
          }));

        // ----- LUNCH SPECIALS -----
        const lunchRows = lunchViewRes.data ?? [];

        const venueIds = Array.from(
          new Set(lunchRows.map((r: any) => r.venue_id).filter(Boolean))
        );

        let venueMap: Record<
          number,
          { id: number; name?: string | null; address?: string | null; region?: string | null; lat?: number | null; lng?: number | null }
        > = {};

        if (venueIds.length > 0) {
          const { data: lunchVenues } = await supabase
            .from("venues")
            .select("id, name, address, region, lat, lng")
            .in("id", venueIds);

          venueMap = Object.fromEntries(
            (lunchVenues ?? []).map((v) => [v.id, v])
          );
        }

        const lunch = lunchRows
          .map((row: any) => {
            const v = venueMap[row.venue_id] || {};
            const venue = {
              id: v.id ?? row.venue_id ?? 0,
              name: (v.name ?? "") as string,
              address: v.address ?? null,
              region: v.region ?? currentRegion,
              lat: v.lat ?? null,
              lng: v.lng ?? null,
            };
            return {
              id: row.id,
              title: row.title,
              details: row.description,
              price: row.price ?? null,
              venue,
              start_time: row.start_time,
              end_time: row.end_time,
              days: null, // view doesn't give us array-of-days, we treat as "today"
            };
          })
          .filter((l: any) => (l.venue?.region ?? currentRegion) === currentRegion);

        // ----- HAPPY HOURS -----
        const happyHours = (hhRes.data ?? [])
          .filter((h: any) => h.venue?.region === currentRegion)
          .map((h: any) => ({
            id: h.id,
            details: h.details,
            price_cents: h.price_cents,
            venue: h.venue,
            start_time: h.start_time,
            end_time: h.end_time,
            days: h.days,
          }));

        console.log("[deal-me] fetched base rows:", {
          deals: deals.length,
          lunch: lunch.length,
          happyHours: happyHours.length,
          region: currentRegion,
        });

        setAllDeals(deals);
        setAllLunch(lunch);
        setAllHappyHours(happyHours);
      } catch (error) {
        console.error("[DealMeModal] fetch error", error);
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 300 - elapsed);
        setTimeout(() => {
          setLoading(false);
          setIsInitialLoad(false);
        }, remaining);
      }
    }

    load();
  }, [open, currentRegion, supabase]);

  // Helper functions for day/time filtering
  const DAY_MAP: Record<string, number> = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };

  function dealMatchesToday(deal: any, todayDow: number) {
    // support string day_of_week: "friday"
    if (typeof deal?.day_of_week === "string") {
      const d = deal.day_of_week.toLowerCase().trim();
      const mapped = DAY_MAP[d];
      if (typeof mapped === "number") {
        return mapped === todayDow;
      }
    }

    // support number day_of_week: 5
    if (typeof deal?.day_of_week === "number") {
      return deal.day_of_week === todayDow;
    }

    // support array of days: [1,2,3]
    if (Array.isArray(deal?.days)) {
      return deal.days.includes(todayDow);
    }

    // if no day info, keep it
    return true;
  }

  function timeToMinutes(str: string): number | null {
    if (!str) return null;
    const parts = str.split(":");
    if (parts.length < 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  function dealMatchesWhen(deal: any, when: "now" | "1hour" | "2hours" | "today", now: Date) {
    const startM = timeToMinutes(deal?.start_time);
    const endM = timeToMinutes(deal?.end_time);
    if (startM === null || endM === null) return true;

    const currentM = now.getHours() * 60 + now.getMinutes();

    if (when === "now") {
      return currentM >= startM && currentM <= endM;
    }

    if (when === "1hour") {
      const target = currentM + 60;
      return target >= startM && target <= endM;
    }

    if (when === "2hours") {
      const target = currentM + 120;
      return target >= startM && target <= endM;
    }

    // "today"
    return true;
  }

  // Filter and group deals based on time, distance, and "when" filter
  const { dailyDeals, lunchDeals, happyHours, showFallback, typeFallback } = useMemo(() => {
    const now = new Date();
    const todayDow = now.getDay();

    // 1) Daily deals – normal day + time filtering
    const dayTimeFilteredDaily = (allDeals ?? []).filter((deal) => {
      return dealMatchesToday(deal, todayDow) && dealMatchesWhen(deal, when, now);
    });

    // 2) Lunch deals – show today's lunches, ignore "when" time windows
    let dayTimeFilteredLunch: LunchItem[] = (allLunch ?? []).filter((lunch) =>
      dealMatchesToday(lunch, todayDow)
    );

    // 3) Happy hours – normal day + time filtering
    const dayTimeFilteredHappy = (allHappyHours ?? []).filter((hh) => {
      return dealMatchesToday(hh, todayDow) && dealMatchesWhen(hh, when, now);
    });

    // Calculate distances for day/time filtered items if we have user location
    const withDistancesDaily = dayTimeFilteredDaily.map((deal) => {
      const v = deal.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...deal, _distance: dist };
      }
      return { ...deal, _distance: null };
    });

    const withDistancesLunch = dayTimeFilteredLunch.map((lunch) => {
      const v = lunch.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...lunch, _distance: dist };
      }
      return { ...lunch, _distance: null };
    });

    const withDistancesHappy = dayTimeFilteredHappy.map((hh) => {
      const v = hh.venue;
      if (userLocation && v?.lat && v?.lng) {
        const dist = haversineMeters(userLocation, { lat: v.lat, lng: v.lng });
        return { ...hh, _distance: dist };
      }
      return { ...hh, _distance: null };
    });

    const radiusLimit = radius ?? Infinity;
    const radiusActive = Boolean(userLocation && radius != null);
    const noLocation =
      !userLocation ||
      typeof userLocation.lat !== "number" ||
      typeof userLocation.lng !== "number" ||
      Number.isNaN(userLocation.lat) ||
      Number.isNaN(userLocation.lng);
    const wholeRegionSelected = radius == null;

    const filteredDaily = radiusActive && !noLocation
      ? withDistancesDaily.filter((d) => d._distance == null || d._distance <= radiusLimit)
      : withDistancesDaily;

    const filteredLunch = radiusActive && !noLocation
      ? withDistancesLunch.filter((l) => l._distance == null || l._distance <= radiusLimit)
      : withDistancesLunch;

    const filteredHappy = radiusActive && !noLocation
      ? withDistancesHappy.filter((h) => h._distance == null || h._distance <= radiusLimit)
      : withDistancesHappy;

    // Apply deal type filter
    let finalDaily = dealType === "all" || dealType === "daily" ? filteredDaily : [];
    let finalLunch = dealType === "all" || dealType === "lunch" ? filteredLunch : [];
    let finalHappy = dealType === "all" || dealType === "happy-hour" ? filteredHappy : [];

    const noResultsAfterType =
      finalDaily.length === 0 && finalLunch.length === 0 && finalHappy.length === 0 &&
      dealType !== "all";

    if (noResultsAfterType) {
      finalDaily = filteredDaily;
      finalLunch = filteredLunch;
      finalHappy = filteredHappy;
    }

    const primaryResultsEmpty =
      finalDaily.length === 0 && finalLunch.length === 0 && finalHappy.length === 0;

    const userAskedForStrictFilters = radiusActive || when !== "today";

    const shouldShowFallback =
      (primaryResultsEmpty || noResultsAfterType) &&
      (allDeals.length > 0 || allLunch.length > 0 || allHappyHours.length > 0) &&
      (!userAskedForStrictFilters || noResultsAfterType);

    console.log("[deal-me] after filters:", {
      daily: finalDaily.length,
      lunch: finalLunch.length,
      happy: finalHappy.length,
      fallback: shouldShowFallback,
      typeFallback: noResultsAfterType,
    });

    if (shouldShowFallback) {
      if (noResultsAfterType) {
        return {
          dailyDeals: allDeals,
          lunchDeals: allLunch,
          happyHours: allHappyHours,
          showFallback: true,
          typeFallback: true,
        };
      }
      return {
        dailyDeals: filteredDaily,
        lunchDeals: filteredLunch,
        happyHours: filteredHappy,
        showFallback: true,
        typeFallback: false,
      };
    }

    return {
      dailyDeals: finalDaily,
      lunchDeals: finalLunch,
      happyHours: finalHappy,
      showFallback: shouldShowFallback,
      typeFallback: false,
    };
  }, [allDeals, allLunch, allHappyHours, userLocation, radius, when, dealType]);

  // Update isFallback state based on showFallback
  useEffect(() => {
    setIsFallback(showFallback);
  }, [showFallback]);

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-3 sm:px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="deal-me-modal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="
              w-full max-w-lg bg-white rounded-3xl shadow-2xl
              max-h-full overflow-y-auto
              flex flex-col pb-[env(safe-area-inset-bottom)] relative
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b">
            <h2 className="text-xl md:text-2xl font-semibold">Deals near you</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50 space-y-3">
            {/* First row: Distance + Location controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Distance */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Within</label>
                <select
                  value={radius ?? ""}
                  onChange={(e) => setRadius(e.target.value === "" ? null : Number(e.target.value))}
                  className="w-full md:w-auto px-3 py-1 text-sm rounded-md border bg-white"
                >
                  {DISTANCE_OPTIONS.map((opt) => (
                    <option key={opt.value ?? "whole-region"} value={opt.value ?? ""}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Source */}
              <div className="flex flex-wrap items-center gap-2 w-full">
                <label className="text-sm text-gray-600 whitespace-nowrap md:hidden">Location</label>
                <button
                  type="button"
                  onClick={() => {
                    setLocationSource("auto");
                    handleUseMyLocation();
                    setManualAddress("");
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    locationSource === "auto"
                      ? "bg-orange-500 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  Use my location
                </button>
                <button
                  type="button"
                  onClick={() => setLocationSource("manual")}
                  className={`px-3 py-1 text-sm rounded-md transition ${
                    locationSource === "manual"
                      ? "bg-orange-500 text-white"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                >
                  Enter location
                </button>
                {locationSource === "manual" && (
                  <LocationInput
                    value={manualAddress}
                    onSelectLocation={handleLocationFromSearch}
                  />
                )}
              </div>
            </div>

            {/* Second row: When */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                When
              </label>
              <select
                value={when}
                onChange={(e) => setWhen(e.target.value as "now" | "1hour" | "2hours" | "today")}
                className="w-full md:w-auto rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="now">Now</option>
                <option value="today">Today</option>
                <option value="1hour">On in 1 hour</option>
                <option value="2hours">On in 2 hours</option>
              </select>
            </div>

            {/* Deal type */}
            <div>
              <span className="block text-xs font-medium text-slate-500 mb-2">
                Deal type
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(DEAL_TYPE_MAP).map((label) => {
                  const isActive = dealTypeLabel === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDealTypeLabel(label)}
                      className={`rounded-full px-3 py-1 text-sm border transition ${
                        isActive
                          ? "bg-orange-100 border-orange-400 text-orange-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading || isInitialLoad ? (
            <div className="space-y-6">
              {/* Skeleton Loader */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                  <ul className="space-y-3">
                    {[1, 2].map((j) => (
                      <li key={j} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
              {locationError && (
                <p className="text-xs text-red-500 mb-2">
                  {locationError}
                </p>
              )}
              {showFallback && isFallback && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 mb-4">
                  <p className="text-sm text-orange-800">
                    No deals matched your filters. Showing{" "}
                    {typeFallback ? "all available deals" : `${dealTypeLabel.toLowerCase()} in ${regionLabel}`}{" "}
                    instead.
                  </p>
                </div>
              )}
              <>
                {/* Daily Deals */}
                {dailyDeals.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3">Daily Deals</h3>
                  <ul className="space-y-3">
                    {dailyDeals.map((deal) => {
                      const distText =
                        typeof deal._distance === "number"
                          ? formatDistance(deal._distance)
                          : null;
                      return (
                        <li
                          key={deal.id}
                          className="p-3 border-[1.5px] border-orange-200/80 rounded-xl bg-white/80 hover:bg-orange-50 transition-colors duration-200"
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
                                  (() => {
                                    const link = buildMapsLink(deal.venue);
                                    return link ? (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 underline-offset-2 hover:underline"
                                      >
                                        <MapPin className="w-3 h-3" />
                                        {deal.venue.address}
                                      </a>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {deal.venue.address}
                                      </span>
                                    );
                                  })()
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
                        typeof lunch._distance === "number"
                          ? formatDistance(lunch._distance)
                          : null;
                      const timeRange = formatTimeRange(
                        lunch.start_time,
                        lunch.end_time
                      );
                      return (
                        <li
                          key={lunch.id}
                          className="p-3 border-[1.5px] border-orange-200/80 rounded-xl bg-white/80 hover:bg-orange-50 transition-colors duration-200"
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
                                  (() => {
                                    const link = buildMapsLink(lunch.venue);
                                    return link ? (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 underline-offset-2 hover:underline"
                                      >
                                        <MapPin className="w-3 h-3" />
                                        {lunch.venue.address}
                                      </a>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {lunch.venue.address}
                                      </span>
                                    );
                                  })()
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
                        typeof hh._distance === "number"
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
                          className="p-3 border-[1.5px] border-orange-200/80 rounded-xl bg-white/80 hover:bg-orange-50 transition-colors duration-200"
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
                                  (() => {
                                    const link = buildMapsLink(hh.venue);
                                    return link ? (
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 underline-offset-2 hover:underline"
                                      >
                                        <MapPin className="w-3 h-3" />
                                        {hh.venue.address}
                                      </a>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {hh.venue.address}
                                      </span>
                                    );
                                  })()
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

                  {!showFallback && !loading && !isInitialLoad && dailyDeals.length === 0 && lunchDeals.length === 0 && happyHours.length === 0 && (
                    <>
                      {!userLocation && (
                        <div className="mb-3 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2">
                          <p className="text-xs text-orange-700">
                            No nearby deals found. Your browser may have blocked location. Please allow location services and try again.
                          </p>
                        </div>
                      )}
                      <div className="text-center py-12 text-gray-500">
                        No deals matched your criteria. Try adjusting your filters.
                      </div>
                    </>
                  )}
              </>
            </>
          )}
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
