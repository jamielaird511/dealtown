"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionSchema, SubmissionInput } from "@/lib/validators";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const DEAL_TYPES = [
  { value: "daily-deal", label: "Daily Deal" },
  { value: "lunch-special", label: "Lunch Specials" },
  { value: "happy-hour", label: "Happy Hour" },
];

type Props = {
  onSuccess?: () => void;
  showCard?: boolean;
  className?: string;
};

export default function SubmitDealForm({ onSuccess, showCard = true, className = "" }: Props) {
  const mountedAt = useRef<number>(0);
  useEffect(() => { mountedAt.current = Date.now(); }, []);

  const [formData, setFormData] = useState<Partial<SubmissionInput>>({
    type: "daily-deal",
    venue_name: "",
    venue_suburb: "",
    website_url: "",
    notes: "",
    submitter_email: "",
    days: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith("day_")) {
        const dayValue = parseInt(name.split("_")[1]);
        setFormData((prev) => {
          const currentDays = (prev.days as number[]) || [];
          if (checked) {
            return { ...prev, days: [...currentDays, dayValue] };
          } else {
            return { ...prev, days: currentDays.filter(d => d !== dayValue) };
          }
        });
      }
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "day_of_week" && value ? parseInt(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Validate form data
      const validatedData = SubmissionSchema.parse(formData);
      
      // Prepare payload for email submission
      const dealTitle = 
        validatedData.type === "daily-deal" ? validatedData.title :
        validatedData.type === "lunch-special" ? validatedData.banner_title :
        validatedData.type === "happy-hour" ? validatedData.offer_summary || "" :
        "";

      console.log("FORM TYPE:", validatedData.type);
      const payload = {
        venue_name: validatedData.venue_name,
        deal_title: dealTitle,
        description: validatedData.notes,
        days: Array.isArray(validatedData.days)
          ? validatedData.days.map((d: any) => String((Number(d) + 1) % 7))
          : validatedData.days != null
          ? [String((Number(validatedData.days) + 1) % 7)]
          : [],
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        submitter_email: validatedData.submitter_email,
        category: validatedData.type,
        company: "", // honeypot
        ttfb_ms: Date.now() - mountedAt.current, // anti-bot timing
      };

      console.info("[submit] payload", payload);
      console.log("SUBMIT PAYLOAD:", payload);

      const response = await fetch("/api/deal-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thanks! We'll review and publish soon.",
        });
        // Reset form
        setFormData({
          type: "daily-deal",
          venue_name: "",
          venue_suburb: "",
          website_url: "",
          notes: "",
          submitter_email: "",
          days: [],
        });
        
        // Note: onSuccess will be called when user clicks "Close" button
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to submit. Please try again.",
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Validation error. Please check your inputs.",
      });
    }

    setIsSubmitting(false);
  };

  const formContent = (
    <>
      {submitStatus.type === "success" ? (
        <div className="text-center py-8">
          <div className="text-green-600 text-lg font-semibold mb-2">Success!</div>
          <div className="text-gray-600 mb-4">{submitStatus.message}</div>
          <Button onClick={() => {
            setSubmitStatus({ type: null, message: "" });
            if (onSuccess) {
              onSuccess();
            }
          }}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={className}>
          {/* Honeypot */}
          <input name="company" autoComplete="off" tabIndex={-1} aria-hidden="true" className="hidden" />
          
          <div className="space-y-4">
            {submitStatus.type === "error" && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitStatus.message}
              </div>
            )}

            {/* Type Selector */}
            <div className="space-y-2">
              <label className="text-base font-semibold">Deal Type</label>
              <div className="grid grid-cols-3 gap-2 sm:inline-flex sm:gap-2">
                {DEAL_TYPES.map((type) => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <label htmlFor="venue_name" className="text-base font-semibold">
                Venue Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="venue_name"
                name="venue_name"
                value={formData.venue_name || ""}
                onChange={handleChange}
                required
                placeholder="e.g., The Happy Hour Bar"
                className="min-h-[44px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="venue_suburb" className="text-base font-semibold">
                Suburb/City
              </label>
              <Input
                id="venue_suburb"
                name="venue_suburb"
                value={formData.venue_suburb || ""}
                onChange={handleChange}
                placeholder="e.g., Portland"
                className="min-h-[44px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="website_url" className="text-base font-semibold">
                Website URL
              </label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                value={formData.website_url || ""}
                onChange={handleChange}
                placeholder="https://example.com"
                className="min-h-[44px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-base font-semibold">
                Notes/Description
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Describe the deal in detail... (140-240 characters suggested)"
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="submitter_email" className="text-base font-semibold">
                Your Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="submitter_email"
                name="submitter_email"
                type="email"
                value={formData.submitter_email || ""}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="min-h-[44px] text-sm"
              />
              <p className="text-xs text-muted-foreground">
                We may contact you if we need more information about the deal
              </p>
            </div>

            {/* Type-specific Fields */}
            {formData.type === "daily-deal" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-base font-semibold">
                    Deal Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleChange}
                    required
                    placeholder="$30 Steak + House Wine/Beer"
                    className="min-h-[44px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-base font-semibold">
                    Price (optional)
                  </label>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    placeholder="e.g., 30 or 30.50"
                    className="min-h-[44px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-semibold">
                    Available Day(s) <span className="text-gray-500 text-xs">(choose one or more)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm select-none cursor-pointer ${
                          formData.days?.includes(i)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={`day_${i}`}
                          checked={formData.days?.includes(i) || false}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pick at least one day (required)</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="start_time" className="text-base font-semibold">
                      Start Time (optional)
                    </label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time || ""}
                      onChange={handleChange}
                      className="min-h-[44px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end_time" className="text-base font-semibold">
                      End Time (optional)
                    </label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time || ""}
                      onChange={handleChange}
                      className="min-h-[44px] text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === "lunch-special" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="banner_title" className="text-base font-semibold">
                    Banner Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="banner_title"
                    name="banner_title"
                    value={formData.banner_title || ""}
                    onChange={handleChange}
                    required
                    placeholder="e.g. $15 Lunch Menu"
                    className="min-h-[44px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price_from" className="text-base font-semibold">
                    Price From (optional)
                  </label>
                  <Input
                    id="price_from"
                    name="price_from"
                    value={formData.price_from || ""}
                    onChange={handleChange}
                    placeholder="e.g., 15 or 15.50"
                    className="min-h-[44px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-semibold">
                    Available Day(s) <span className="text-gray-500 text-xs">(choose one or more)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm select-none cursor-pointer ${
                          formData.days?.includes(i)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={`day_${i}`}
                          checked={formData.days?.includes(i) || false}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pick at least one day (required)</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="start_time" className="text-base font-semibold">
                      Start Time <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time || ""}
                      onChange={handleChange}
                      className="min-h-[44px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end_time" className="text-base font-semibold">
                      End Time <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time || ""}
                      onChange={handleChange}
                      className="min-h-[44px] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="tagline" className="text-base font-semibold">
                    Tagline (optional)
                  </label>
                  <Input
                    id="tagline"
                    name="tagline"
                    value={formData.tagline || ""}
                    onChange={handleChange}
                    placeholder="e.g., Any main + drink"
                    className="min-h-[44px] text-sm"
                  />
                </div>
              </>
            )}

            {formData.type === "happy-hour" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="offer_summary" className="text-base font-semibold">
                    Offer/Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="offer_summary"
                    name="offer_summary"
                    value={formData.offer_summary || ""}
                    onChange={handleChange}
                    required
                    placeholder="e.g., $8 pints 4–6pm"
                    className="min-h-[44px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-semibold">
                    Available Day(s) <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <label
                        key={i}
                        className={`flex items-center justify-center rounded-full border px-3 py-2 text-sm select-none cursor-pointer ${
                          formData.days?.includes(i)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={`day_${i}`}
                          checked={formData.days?.includes(i) || false}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pick at least one day (required)</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="start_time" className="text-base font-semibold">
                      Start Time
                    </label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time || ""}
                      onChange={handleChange}
                      className="min-h-[44px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end_time" className="text-base font-semibold">
                      End Time
                    </label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time || ""}
                      onChange={handleChange}
                      className="min-h-[44px] text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Deal"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    type: "daily-deal",
                    venue_name: "",
                    venue_suburb: "",
                    website_url: "",
                    notes: "",
                    submitter_email: "",
                    days: [],
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
          <CardDescription>
            DealTown is for <strong>time-limited or genuine local specials</strong> — anything that offers better value than the usual menu.<br />
            ✅ <strong>Examples:</strong> $8 pints today 4–6pm, Half-price pizza Tuesdays, $15 Lunch Menu.<br />
            🔎 <strong>We review:</strong> time-limited deals, genuine discounts, or specials.<br />
            🚫 <strong>Not accepted:</strong> ongoing regular prices with no time limit.<br />
            🔍 <strong>All submissions are reviewed before publishing.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return formContent;
}
