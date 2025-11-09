"use client";

import React from "react";

declare global {
  interface Window {
    google?: any;
  }
}

type LocationInputProps = {
  onSelectLocation: (loc: { lat: number; lng: number; description?: string | null }) => void;
  value?: string;
  placeholder?: string;
  className?: string;
};

export function LocationInput({
  onSelectLocation,
  value,
  placeholder = "Enter location",
  className = "flex-1 min-w-[260px] sm:min-w-[320px] md:min-w-[400px] rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500",
}: LocationInputProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    if (!inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "nz" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onSelectLocation({
        lat,
        lng,
        description:
          place.formatted_address ??
          place.name ??
          (typeof place.description === "string" ? place.description : null),
      });
    });
  }, [onSelectLocation]);

  React.useEffect(() => {
    if (!inputRef.current || typeof value === "undefined") return;
    inputRef.current.value = value;
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className={className}
    />
  );
}
