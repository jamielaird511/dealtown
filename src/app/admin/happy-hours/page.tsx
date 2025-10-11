"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import DayPicker from "@/components/DayPicker";
import HappyHourCard from "@/components/HappyHourCard";

type Venue = { id: number; name: string };
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function AdminHappyHours() {
  const { data: list, mutate } = useSWR("/api/happy-hours?day=today", fetcher);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState<any>({
    venue_id: 0,
    title: "",
    details: "",
    price_cents: undefined,
    start_time: "16:00",
    end_time: "18:00",
    days: [1,2,3,4,5],
    active_from: "",
    active_to: "",
    is_active: true,
    website_url: ""
  });

  useEffect(() => {
    fetch("/api/venues").then(r => r.json()).then(v => setVenues(v.data || []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/happy-hours", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ ...form, venue_id: Number(form.venue_id) })
    });
    if (!res.ok) {
      console.error(await res.json());
      return;
    }
    setForm((f: any) => ({ ...f, title:"", details:"", price_cents: undefined }));
    mutate();
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <section className="rounded-2xl border p-4">
        <h2 className="text-xl font-semibold mb-4">Create Happy Hour</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm">Venue</span>
              <select
                value={form.venue_id}
                onChange={e => setForm((f:any)=>({ ...f, venue_id: Number(e.target.value) }))}
                className="border rounded px-3 py-2"
              >
                <option value={0}>Select a venue…</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col">
              <span className="text-sm">Title</span>
              <input className="border rounded px-3 py-2" value={form.title}
                     onChange={e=>setForm((f:any)=>({ ...f, title:e.target.value }))}/>
            </label>
            <label className="flex flex-col">
              <span className="text-sm">Details</span>
              <input className="border rounded px-3 py-2" value={form.details}
                     onChange={e=>setForm((f:any)=>({ ...f, details:e.target.value }))}/>
            </label>
            <label className="flex flex-col">
              <span className="text-sm">Price (cents)</span>
              <input type="number" className="border rounded px-3 py-2"
                     value={form.price_cents ?? ""} min={0}
                     onChange={e=>setForm((f:any)=>({ ...f, price_cents: e.target.value === "" ? undefined : Number(e.target.value) }))}/>
            </label>
            <label className="flex flex-col">
              <span className="text-sm">Start</span>
              <input type="time" className="border rounded px-3 py-2" value={form.start_time}
                     onChange={e=>setForm((f:any)=>({ ...f, start_time: e.target.value }))}/>
            </label>
            <label className="flex flex-col">
              <span className="text-sm">End</span>
              <input type="time" className="border rounded px-3 py-2" value={form.end_time}
                     onChange={e=>setForm((f:any)=>({ ...f, end_time: e.target.value }))}/>
            </label>
          </div>

          <div>
            <span className="text-sm block mb-1">Days</span>
            <DayPicker value={form.days} onChange={(d)=>setForm((f:any)=>({ ...f, days: d }))}/>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active}
                     onChange={e=>setForm((f:any)=>({ ...f, is_active: e.target.checked }))}/>
              <span>Active</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Active From</span>
              <input type="date" className="border rounded px-2 py-1"
                     value={form.active_from}
                     onChange={e=>setForm((f:any)=>({ ...f, active_from: e.target.value }))}/>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Active To</span>
              <input type="date" className="border rounded px-2 py-1"
                     value={form.active_to}
                     onChange={e=>setForm((f:any)=>({ ...f, active_to: e.target.value }))}/>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm">Website</span>
              <input type="url" className="border rounded px-2 py-1 w-64"
                     value={form.website_url}
                     onChange={e=>setForm((f:any)=>({ ...f, website_url: e.target.value }))}/>
            </label>
          </div>

          <button className="px-4 py-2 rounded bg-black text-white" type="submit" disabled={!form.venue_id || !form.title}>
            Save
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Today's Happy Hours</h3>
        {(list?.data ?? []).length === 0 && <div className="opacity-70 text-sm">No entries yet.</div>}
        <div className="grid gap-3">
          {(list?.data ?? []).map((hh: any) => (
            <div key={hh.id} className="flex items-start gap-3">
              <HappyHourCard hh={hh} />
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded border"
                  onClick={async () => {
                    await fetch(`/api/happy-hours/${hh.id}`, { method: "PATCH", body: JSON.stringify({ is_active: !hh.is_active }), headers: { "Content-Type": "application/json" }});
                    mutate();
                  }}
                >
                  Toggle Active
                </button>
                <button
                  className="px-3 py-2 rounded border"
                  onClick={async () => { await fetch(`/api/happy-hours/${hh.id}`, { method: "DELETE" }); mutate(); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

