"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Equipment, Lab } from "@/lib/types";

interface Props {
  labs: Lab[];
  initialEquipment: (Equipment & { labs?: { name: string } })[];
}

export default function AdminEquipmentManager({ labs, initialEquipment }: Props) {
  const supabase = createClient();
  const [equipment, setEquipment] = useState(initialEquipment);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    lab_id: labs[0]?.id ?? "",
    min_booking_minutes: 30,
    max_booking_minutes: 240,
    notes: "",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase
      .from("equipment")
      .insert(form)
      .select("*, labs(name)")
      .single();
    setSubmitting(false);
    if (!error && data) {
      setEquipment((prev) => [...prev, data as any]);
      setForm({ ...form, name: "", category: "", location: "", notes: "" });
      setShowForm(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, status: status as any } : e)));
    await supabase.from("equipment").update({ status }).eq("id", id);
  }

  return (
    <div>
      <button
        onClick={() => setShowForm((s) => !s)}
        className="mb-6 font-mono text-sm bg-ink text-paper px-4 py-2 hover:bg-teal transition-colors focus-ring"
      >
        {showForm ? "Cancel" : "+ Add equipment"}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-line p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-ink-soft mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
              placeholder="Confocal microscope"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-ink-soft mb-1">Lab</label>
            <select
              value={form.lab_id}
              onChange={(e) => setForm({ ...form, lab_id: e.target.value })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
            >
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-ink-soft mb-1">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
              placeholder="Imaging"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-ink-soft mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
              placeholder="Room 204"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-ink-soft mb-1">Min booking (min)</label>
            <input
              type="number"
              min={5}
              value={form.min_booking_minutes}
              onChange={(e) => setForm({ ...form, min_booking_minutes: Number(e.target.value) })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-ink-soft mb-1">Max booking (min)</label>
            <input
              type="number"
              min={5}
              value={form.max_booking_minutes}
              onChange={(e) => setForm({ ...form, max_booking_minutes: Number(e.target.value) })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-ink-soft mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 bg-ink text-paper font-mono text-sm py-2.5 hover:bg-teal transition-colors disabled:opacity-50 focus-ring"
          >
            {submitting ? "Adding…" : "Add equipment"}
          </button>
        </form>
      )}

      <div className="border border-line divide-y divide-line">
        {equipment.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-display font-600 text-sm">{item.name}</p>
              <p className="font-mono text-xs text-ink-soft">
                {(item as any).labs?.name} · {item.category} · {item.location}
              </p>
            </div>
            <select
              value={item.status}
              onChange={(e) => updateStatus(item.id, e.target.value)}
              className="font-mono text-xs border border-line bg-white px-2 py-1.5 focus-ring"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
