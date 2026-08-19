"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  notes: string;
  lab_id: string;
  labs?: { name: string } | null;
}

interface Props {
  equipment: EquipmentItem[];
  inUseIds: string[];
}

export default function EquipmentBrowser({ equipment, inUseIds }: Props) {
  const [search, setSearch] = useState("");
  const [labFilter, setLabFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const inUse = useMemo(() => new Set(inUseIds), [inUseIds]);

  function statusFor(item: EquipmentItem): "available" | "booked" | "maintenance" {
    if (item.status === "maintenance") return "maintenance";
    if (inUse.has(item.id)) return "booked";
    return "available";
  }

  const labs = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.labs?.name).filter(Boolean))) as string[],
    [equipment]
  );
  const categories = useMemo(
    () => Array.from(new Set(equipment.map((e) => e.category).filter(Boolean))),
    [equipment]
  );

  const filtered = equipment.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesLab = labFilter === "all" || item.labs?.name === labFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesAvailability = availabilityFilter === "all" || statusFor(item) === availabilityFilter;
    return matchesSearch && matchesLab && matchesCategory && matchesAvailability;
  });

  if (equipment.length === 0) {
    return (
      <div className="border border-border rounded-card bg-surface py-16 px-6 text-center">
        <p className="font-medium text-ink mb-1">No equipment available</p>
        <p className="text-sm text-ink-soft">
          Equipment added by your lab administrator will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment..."
            aria-label="Search equipment"
            className="w-full border border-border rounded-control pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-soft bg-surface focus-ring focus:border-teal"
          />
        </div>

        <select
          value={labFilter}
          onChange={(e) => setLabFilter(e.target.value)}
          aria-label="Filter by lab"
          className="border border-border rounded-control px-3 py-2 text-sm text-ink bg-surface focus-ring focus:border-teal"
        >
          <option value="all">All labs</option>
          {labs.map((lab) => (
            <option key={lab} value={lab}>
              {lab}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="border border-border rounded-control px-3 py-2 text-sm text-ink bg-surface focus-ring focus:border-teal"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          aria-label="Filter by availability"
          className="border border-border rounded-control px-3 py-2 text-sm text-ink bg-surface focus-ring focus:border-teal"
        >
          <option value="all">Any availability</option>
          <option value="available">Available now</option>
          <option value="booked">In use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border rounded-card bg-surface py-16 px-6 text-center">
          <p className="font-medium text-ink mb-1">No matching equipment</p>
          <p className="text-sm text-ink-soft">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const status = statusFor(item);
            const statusLabel = {
              available: "Available now",
              booked: "In use",
              maintenance: "Maintenance",
            }[status];

            return (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="group flex flex-col border border-border rounded-card bg-surface shadow-card hover:border-teal transition-colors p-5 focus-ring"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-ink leading-snug">{item.name}</h3>
                </div>
                <p className="text-xs text-ink-soft mb-3">
                  {item.labs?.name} · {item.category}
                </p>
                {item.notes && (
                  <p className="text-sm text-ink-soft mb-3 line-clamp-2 flex-1">{item.notes}</p>
                )}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`status-dot status-dot--${status}`} aria-hidden />
                  <span className="text-xs text-ink-soft">{statusLabel}</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-xs text-ink-soft">{item.location}</span>
                  <span className="text-xs font-medium text-teal group-hover:underline">
                    {status === "available" ? "Book" : "View availability"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
