"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Phone, RefreshCw, X } from "lucide-react";
import { Alert, CountChip, EmptyState, Field, SelectInput, Stepper, StatusBadge, TypeBadge, CheckRow } from "@/components/foodshare/ui";
import { DashEyebrow, DashboardShell } from "@/components/foodshare/shell";
import { APP_NOW, parseIST, VENDOR_ACCOUNT, useFS, type Donation, type FoodType } from "@/lib/foodshare/store";

/* --------------------------- NGO info panel -------------------------- */

function NgoPanel({ d }: { d: Donation }) {
  if (!d.claim) return null;
  return (
    <div className="rounded-lg bg-fs-panel p-3.5">
      <p className="text-xs font-bold text-fs-ink">
        NGO Claimed · {d.claim.org}
      </p>
      <p className="mt-1 text-xs text-fs-muted">
        {d.claim.contact} · {d.claim.phone}
      </p>
      <p className="mt-0.5 text-xs text-fs-muted">Facility: {d.claim.facility}</p>
      <p className="mt-0.5 text-xs text-fs-muted">{d.claim.email}</p>
      <p className="mt-1.5 text-xs font-medium text-fs-body">Claimed {d.claim.claimedAtText}</p>
    </div>
  );
}

/* ---------------------------- donation card -------------------------- */

function DonationCard({ d }: { d: Donation }) {
  const startEdit = useFS((s) => s.startEdit);
  const withdraw = useFS((s) => s.withdraw);
  const vendorMarkPicked = useFS((s) => s.vendorMarkPicked);
  const vendorMarkCompleted = useFS((s) => s.vendorMarkCompleted);

  const step = d.status === "available" ? 1 : d.status === "claimed" ? 2 : d.status === "picked_up" ? 3 : 4;
  const phone = d.claim?.phone.replace(/\s/g, "");

  return (
    <article className="rounded-xl border border-fs-line bg-white p-4 shadow-xs sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-fs-muted">
          {d.id} · {d.date}
        </p>
        <StatusBadge status={d.status} />
      </div>
      <div className="mt-2.5">
        <TypeBadge type={d.type} />
      </div>
      <h3 className="mt-1.5 text-lg font-bold text-fs-ink">{d.name}</h3>
      <p className="mt-1 text-sm text-fs-muted">
        {d.qty} {d.unit} · {d.type} · Expires {d.expiryText}
      </p>
      <p className="mt-0.5 text-xs text-fs-muted">
        {d.status === "available" && d.listedAt
          ? `Listed at ${d.listedAt}`
          : d.status === "claimed"
            ? `Claimed at ${d.claimedAt} IST · Pickup by ${d.pickupBy} IST`
            : d.status === "picked_up"
              ? `Picked up at ${d.pickedUpAt} IST`
              : `Completed at ${d.completedAt} IST`}
      </p>

      <div className="mt-4">
        <Stepper current={step as 1 | 2 | 3 | 4} />
      </div>

      {d.status === "available" ? (
        <>
          <p className="mt-4 text-sm text-fs-muted">Waiting for an NGO claim.</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button type="button" onClick={() => startEdit(d.id)} className="fs-btn-outline px-3.5 py-2 text-xs">
              <Pencil className="size-3.5" /> Edit listing
            </button>
            <button type="button" onClick={() => withdraw(d.id)} className="fs-btn-outline px-3.5 py-2 text-xs">
              <X className="size-3.5" /> Withdraw
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-4">
            <NgoPanel d={d} />
          </div>
          {d.status === "claimed" ? (
            <div className="mt-3.5 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => vendorMarkPicked(d.id)} className="fs-btn-primary px-3.5 py-2 text-xs">
                Confirm Handover / Mark Picked Up
              </button>
              <a href={`tel:${phone}`} className="fs-btn-outline px-3.5 py-2 text-xs">
                <Phone className="size-3.5" /> Call NGO
              </a>
            </div>
          ) : null}
          {d.status === "picked_up" ? (
            <>
              <p className="mt-3.5 text-sm text-fs-muted">Pickup confirmed. Vendor can now mark this completed.</p>
              <div className="mt-3">
                <button type="button" onClick={() => vendorMarkCompleted(d.id)} className="fs-btn-primary px-3.5 py-2 text-xs">
                  Mark Completed
                </button>
              </div>
            </>
          ) : null}
          {d.status === "completed" ? (
            <p className="mt-3.5 flex items-center gap-1.5 text-sm font-semibold text-fs-green">
              <Check className="size-4" strokeWidth={3} /> Donation complete
            </p>
          ) : null}
        </>
      )}
    </article>
  );
}

/* --------------------------- post food form -------------------------- */

const UNITS = ["meals", "kg", "litres", "packets"];

function PostForm() {
  const editingId = useFS((s) => s.editingId);
  const cancelEdit = useFS((s) => s.cancelEdit);
  const postFood = useFS((s) => s.postFood);
  const updateListing = useFS((s) => s.updateListing);
  const editing = useFS((s) => (s.editingId ? s.donations.find((d) => d.id === s.editingId && d.status === "available") : undefined));

  const [name, setName] = useState(editing?.name ?? "Vegetable rice");
  const [type, setType] = useState<FoodType>(editing?.type ?? "Veg");
  const [qty, setQty] = useState(editing ? String(editing.qty) : "40");
  const [unit, setUnit] = useState(editing?.unit ?? "meals");
  const [expiry, setExpiry] = useState(editing ? `2026-11-08T${editing.expiryTime}:00` : "2026-11-09T18:00");
  const [override, setOverride] = useState(editing ? !!editing.pickupAddress : true);
  const [street, setStreet] = useState(editing?.pickupAddress?.split(",")[0] ?? "24, 5th Cross, rear service entrance");
  const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState("560038");
  const [state, setState] = useState("Karnataka");
  const [confirm, setConfirm] = useState(true);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expiryDate = expiry ? parseIST(expiry) : null;
  const pastExpiry = expiryDate ? expiryDate.getTime() <= APP_NOW.getTime() : false;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Food item name is required.";
    const q = Number(qty);
    if (!qty || Number.isNaN(q) || q < 1) errs.qty = "Quantity must be at least 1.";
    if (!expiry) errs.expiry = "Select an expiry date and time.";
    else if (pastExpiry) errs.expiry = "Past dates are not accepted.";
    if (!confirm) errs.confirm = "Please confirm the food safety declaration.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const input = {
      name: name.trim(),
      type,
      qty: q,
      unit,
      expiry,
      override,
      street,
      city,
      pincode,
      state,
      notes,
      confirm,
    };
    if (editing) updateListing(input);
    else postFood(input);
    setName("");
    setQty("");
    setExpiry("");
    setNotes("");
    setConfirm(true);
    setErrors({});
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-xl border border-fs-line bg-white p-5 shadow-xs">
      <h2 className="text-lg font-bold text-fs-ink">{editing ? "Edit listing" : "Post surplus food"}</h2>
      <p className="mt-1 text-xs text-fs-muted">All fields marked * are required.</p>

      <div className="mt-4 space-y-5">
        <Field label="Food item name" required error={errors.name}>
          <input className={`fs-input ${errors.name ? "fs-input-error" : ""}`} placeholder="Food item name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Food Type" required hint="Options: Veg / Non-Veg">
          <SelectInput
            value={type}
            onChange={(v) => setType(v as FoodType)}
            options={[
              { value: "Veg", label: "Veg" },
              { value: "Non-Veg", label: "Non-Veg" },
            ]}
            ariaLabel="Food type"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity (min 1)" required error={errors.qty}>
            <input inputMode="numeric" className={`fs-input ${errors.qty ? "fs-input-error" : ""}`} value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
          <Field label="Quantity unit" required hint="Units: Meals, Kg, Litres, Packets">
            <SelectInput value={unit} onChange={setUnit} options={UNITS.map((u) => ({ value: u, label: u }))} ariaLabel="Quantity unit" />
          </Field>
        </div>

        <Field label="Expiry datetime" required error={errors.expiry} hint={errors.expiry ? undefined : "Select a future date and time."}>
          <input
            type="datetime-local"
            className={`fs-input ${errors.expiry ? "fs-input-error" : ""}`}
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </Field>
        {pastExpiry ? (
          <Alert tone="warning" title="Past expiry rejected">
            Past dates are not accepted. Select a future date and time.
          </Alert>
        ) : null}

        <div>
          <h3 className="text-sm font-bold text-fs-ink">Specific pickup address</h3>
          <p className="mt-1 text-xs text-fs-muted">
            Default: {VENDOR_ACCOUNT.fullAddress}. Override below if needed.
          </p>
          <div className="mt-3">
            <CheckRow checked={override} onChange={setOverride}>
              Override registered business address for this donation
            </CheckRow>
          </div>
          {override ? (
            <div className="mt-4 space-y-4">
              <Field label="Pickup street address" required>
                <input className="fs-input" value={street} onChange={(e) => setStreet(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <input className="fs-input" value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
                <Field label="Pincode" required>
                  <input inputMode="numeric" className="fs-input" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </Field>
              </div>
              <Field label="State" required>
                <SelectInput value={state} onChange={setState} options={[{ value: "Karnataka", label: "Karnataka" }]} ariaLabel="State" />
              </Field>
            </div>
          ) : null}
        </div>

        <div>
          <CheckRow checked={confirm} onChange={setConfirm}>
            I confirm this food is safe, correctly described and available until the expiry time.
          </CheckRow>
          {errors.confirm ? <p className="mt-1.5 text-xs font-medium text-[#b34038]">{errors.confirm}</p> : null}
        </div>

        <Field label="Notes (optional)">
          <input className="fs-input" placeholder="Optional instructions for pickup team" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <button type="submit" className="fs-btn-primary w-full">
          {editing ? "Update listing" : "Post food donation"}
        </button>
        {editing ? (
          <button type="button" onClick={cancelEdit} className="fs-btn-outline w-full">
            Cancel edit
          </button>
        ) : null}
        <p className="text-xs text-fs-muted">Your phone, pickup address and notes are shared with the claiming NGO.</p>
      </div>
    </form>
  );
}

/* --------------------------- donations column ------------------------ */

function DonationsColumn() {
  const donations = useFS((s) => s.donations);
  const vendorFilter = useFS((s) => s.vendorFilter);
  const setVendorFilter = useFS((s) => s.setVendorFilter);
  const vendorDate = useFS((s) => s.vendorDate);
  const setVendorDate = useFS((s) => s.setVendorDate);
  const sync = useFS((s) => s.sync);
  const lastUpdated = useFS((s) => s.lastUpdated);

  const live = useMemo(() => donations.filter((d) => d.status !== "withdrawn"), [donations]);
  const counts = useMemo(
    () => ({
      all: live.length,
      available: live.filter((d) => d.status === "available").length,
      inprogress: live.filter((d) => d.status === "claimed" || d.status === "picked_up").length,
      completed: live.filter((d) => d.status === "completed").length,
    }),
    [live]
  );

  const filtered = live.filter((d) => {
    if (vendorFilter === "available" && d.status !== "available") return false;
    if (vendorFilter === "inprogress" && !(d.status === "claimed" || d.status === "picked_up")) return false;
    if (vendorFilter === "completed" && d.status !== "completed") return false;
    return true;
  });

  const chips: Array<{ id: typeof vendorFilter; label: string }> = [
    { id: "all", label: `All (${counts.all})` },
    { id: "available", label: `Available (${counts.available})` },
    { id: "inprogress", label: `Claimed / In-Progress (${counts.inprogress})` },
    { id: "completed", label: `Completed (${counts.completed})` },
  ];

  return (
    <section aria-label="My donations">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-fs-ink">My Donations</h2>
        <p className="text-xs text-fs-muted">{counts.all} records</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Filter">
          <SelectInput
            value={vendorFilter}
            onChange={(v) => setVendorFilter(v as typeof vendorFilter)}
            options={[
              { value: "all", label: `All (${counts.all})` },
              { value: "available", label: `Available (${counts.available})` },
              { value: "inprogress", label: `Claimed / In-Progress (${counts.inprogress})` },
              { value: "completed", label: `Completed (${counts.completed})` },
            ]}
            ariaLabel="Filter donations"
          />
        </Field>
        <Field label="Date">
          <SelectInput
            value={vendorDate}
            onChange={setVendorDate}
            options={[
              { value: "08 Nov 2026", label: "08 Nov 2026" },
              { value: "all", label: "All dates" },
            ]}
            ariaLabel="Date filter"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setVendorFilter(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              vendorFilter === c.id ? "bg-fs-green-soft text-fs-green-deep" : "bg-[#e7ece7] text-[#41544a] hover:bg-[#dde4dd]"
            }`}
          >
            {c.label}
          </button>
        ))}
        <button type="button" onClick={sync} className="fs-btn-outline ml-auto px-3 py-1.5 text-xs">
          <RefreshCw className="size-3.5 text-fs-green" /> Sync
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="No donations match these filters.">Try All or post a food donation.</EmptyState>
        ) : (
          filtered.map((d) => <DonationCard key={d.id} d={d} />)
        )}
      </div>

      <p className="mt-4 text-xs text-fs-muted">
        Showing {filtered.length === 0 ? "0" : `all ${filtered.length}`} donations · Updated {lastUpdated}
      </p>
    </section>
  );
}

/* ------------------------------ dashboard ---------------------------- */

export function VendorDashboard() {
  const vendorTab = useFS((s) => s.vendorTab);
  const setVendorTab = useFS((s) => s.setVendorTab);
  const editingId = useFS((s) => s.editingId);
  const claimAlert = useFS((s) => s.claimAlert);
  const dismissAlert = useFS((s) => s.dismissAlert);
  const donations = useFS((s) => s.donations);
  const session = useFS((s) => s.session);

  const live = donations.filter((d) => d.status !== "withdrawn");
  const nAvail = live.filter((d) => d.status === "available").length;
  const nProg = live.filter((d) => d.status === "claimed" || d.status === "picked_up").length;
  const nDone = live.filter((d) => d.status === "completed").length;
  const total = live.length;

  const showForm = vendorTab === "post";
  const showList = vendorTab === "inventory";

  /* desktop: both columns visible (per design); nav scrolls to the section.
     mobile: tabs switch between the two sections. */
  function handleTab(id: string) {
    setVendorTab(id as "post" | "inventory");
    if (typeof window !== "undefined" && window.innerWidth >= 768 && id === "inventory") {
      document.getElementById("donations-col")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <DashboardShell role="vendor" activeTab={vendorTab} onTab={handleTab} secondaryCount={total}>
      <DashEyebrow>
        Bengaluru · 08 Nov 2026 · 10:30 IST · <span className="normal-case">{session?.email}</span>
      </DashEyebrow>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-fs-ink sm:text-3xl">Vendor Operations Dashboard</h1>
      <p className="mt-2 text-sm text-fs-muted sm:text-base">Post surplus food, manage pickup handovers, and track donation lifecycle.</p>

      {claimAlert ? (
        <Alert tone="success" title="Food Claimed!" onClose={dismissAlert} className="mt-5">
          {claimAlert}
        </Alert>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <CountChip label={`${nAvail} available`} tone="blue" />
        <CountChip label={`${nProg} claimed / in-progress`} tone="amber" />
        <CountChip label={`${nDone} completed`} tone="green" />
        <CountChip label={`${total} total`} tone="gray" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className={showForm ? "min-w-0" : "hidden lg:block min-w-0"}>
          <PostForm key={editingId ?? "new"} />
        </div>
        <div id="donations-col" className={showList ? "min-w-0" : "hidden lg:block min-w-0"}>
          <DonationsColumn />
        </div>
      </div>
    </DashboardShell>
  );
}
