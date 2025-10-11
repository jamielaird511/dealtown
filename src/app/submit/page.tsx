"use client";

import { useState } from "react";
import { submitDeal, SubmitDealInput } from "@/lib/actions/submitDeal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function SubmitPage() {
  const [formData, setFormData] = useState<SubmitDealInput>({
    venue_name: "",
    venue_suburb: "",
    title: "",
    description: "",
    price: "",
    day_of_week: undefined,
    start_time: "",
    end_time: "",
    contact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "day_of_week" && value ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const result = await submitDeal(formData);

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message: "Thank you! Your deal has been submitted for review.",
      });
      // Reset form
      setFormData({
        venue_name: "",
        venue_suburb: "",
        title: "",
        description: "",
        price: "",
        day_of_week: undefined,
        start_time: "",
        end_time: "",
        contact: "",
      });
    } else {
      setSubmitStatus({
        type: "error",
        message: result.error || "Failed to submit deal. Please try again.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Submit a Deal</h1>
        <p className="text-muted-foreground">
          Know about a great local deal? Share it with the community!
        </p>
      </div>

      {submitStatus.type === "success" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Success!</CardTitle>
            <CardDescription>{submitStatus.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setSubmitStatus({ type: null, message: "" })}>
              Submit Another Deal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Deal Details</CardTitle>
              <CardDescription>Fill in the information about the deal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitStatus.type === "error" && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {submitStatus.message}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="venue_name" className="text-sm font-medium">
                  Venue Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="venue_name"
                  name="venue_name"
                  value={formData.venue_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., The Happy Hour Bar"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="venue_suburb" className="text-sm font-medium">
                  Suburb/City
                </label>
                <Input
                  id="venue_suburb"
                  name="venue_suburb"
                  value={formData.venue_suburb}
                  onChange={handleChange}
                  placeholder="e.g., Portland"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Deal Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Happy Hour Special"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the deal in detail..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price
                </label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 6 or 6.50"
                  type="text"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if not applicable. Enter as dollars (e.g., &quot;12&quot; or &quot;12.99&quot;)
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="day_of_week" className="text-sm font-medium">
                    Day of Week
                  </label>
                  <select
                    id="day_of_week"
                    name="day_of_week"
                    value={formData.day_of_week ?? ""}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Any day</option>
                    {WEEKDAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="start_time" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="end_time" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium">
                  Your Email (optional)
                </label>
                <Input
                  id="contact"
                  name="contact"
                  type="email"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We may contact you if we need more information about the deal
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Deal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      venue_name: "",
                      venue_suburb: "",
                      title: "",
                      description: "",
                      price: "",
                      day_of_week: undefined,
                      start_time: "",
                      end_time: "",
                      contact: "",
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}

