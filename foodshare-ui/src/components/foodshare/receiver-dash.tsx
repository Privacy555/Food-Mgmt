"use client";

import { useMemo } from "react";
import { Check, ExternalLink, LocateFixed, Minus, Plus, Search, X } from "lucide-react";
import { Alert, EmptyState, Field, SelectInput, StatusBadge, TypeBadge } from "@/components/foodshare/ui";
import { DashEyebrow, DashboardShell } from "@/components/foodshare/shell";
import { RECEIVER_ACCOUNT, useFS, type Donation, type NearbyItem } from "@/lib/foodshare/store";

/* ------------------------------ mock map ----------------------------- */

function MockMap({
  items,
  selectedId,
  onSelect,
  onClaim,
}: {
  items: NearbyItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClaim: (id: string) => void;
}) {
  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="relative h-[340px] overflow-hidden rounded-lg border border-fs-line bg-[#e7ebe3] sm:h-[380px]">
      {/* stylized street map (matches the approved design) */}
      <svg viewBox="0 0 860 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect width="860" height="400" fill="#e7ebe3" />
        {/* city blocks */}
        <rect x="30" y="30" width="120" height="70" rx="4" fill="#dde2d8" />
        <rect x="30" y="170" width="120" height="110" rx="4" fill="#dde2d8" />
        <rect x="215" y="30" width="180" height="88" rx="4" fill="#dde2d8" />
        <rect x="215" y="150" width="180" height="130" rx="4" fill="#dde2d8" />
        <rect x="215" y="310" width="180" height="70" rx="4" fill="#dde2d8" />
        <rect x="420" y="90" width="140" height="90" rx="4" fill="#dde2d8" />
        <rect x="420" y="215" width="140" height="90" rx="4" fill="#dde2d8" />
        <rect x="590" y="30" width="240" height="60" rx="4" fill="#dde2d8" />
        <rect x="590" y="120" width="240" height="80" rx="4" fill="#dde2d8" />
        <rect x="590" y="230" width="240" height="90" rx="4" fill="#dde2d8" />
        {/* park */}
        <rect x="55" y="195" width="72" height="62" rx="8" fill="#d3e6cf" />
        <text x="66" y="232" fontSize="11" fill="#7fa07a" fontWeight="600">Park</text>
        {/* roads */}
        <rect x="0" y="128" width="860" height="14" fill="#f7f8f5" />
        <rect x="0" y="288" width="860" height="22" fill="#f7f8f5" />
        <rect x="168" y="0" width="24" height="400" fill="#f7f8f5" />
        <rect x="400" y="0" width="16" height="400" fill="#f7f8f5" />
        <rect x="572" y="0" width="14" height="400" fill="#f7f8f5" />
        {/* labels */}
        <text x="430" y="66" textAnchor="middle" fontSize="12" letterSpacing="3.5" fill="#a0a89e" fontWeight="700">INDIRANAGAR</text>
        <text x="30" y="330" fontSize="11" fill="#a8b0a6" fontWeight="600">5th Cross</text>
        <text x="146" y="330" fontSize="11" fill="#a8b0a6" fontWeight="600" transform="rotate(-90 146 330)" textAnchor="end">CMH Road</text>
        <text x="414" y="360" fontSize="11" fill="#a8b0a6" fontWeight="600" transform="rotate(-90 414 360)" textAnchor="end">80 Feet Road</text>
      </svg>

      {/* zoom controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button type="button" aria-label="Zoom in" className="flex size-9 items-center justify-center rounded-md border border-fs-line bg-white shadow-xs hover:bg-[#f3f6f2]">
          <Plus className="size-4 text-fs-ink" />
        </button>
        <button type="button" aria-label="Zoom out" className="flex size-9 items-center justify-center rounded-md border border-fs-line bg-white shadow-xs hover:bg-[#f3f6f2]">
          <Minus className="size-4 text-fs-ink" />
        </button>
        <button type="button" aria-label="Center on my location" className="flex size-9 items-center justify-center rounded-md border border-fs-line bg-white shadow-xs hover:bg-[#f3f6f2]">
          <LocateFixed className="size-4 text-fs-ink" />
        </button>
      </div>

      {/* your location */}
      <div className="absolute" style={{ left: "21%", top: "44%" }}>
        <span className="fs-ping absolute -inset-2 rounded-full bg-[#3b82f6]" />
        <span className="relative block size-4 rounded-full border-[3px] border-white bg-[#3b82f6] shadow" />
        <span className="absolute left-5 -top-1 text-[11px] font-bold text-[#2b5d8f]">You</span>
      </div>

      {/* pickup markers */}
      {items.map((item) => {
        const isSel = item.id === selectedId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-label={`Select ${item.name}`}
            className={`absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold transition-transform hover:scale-105 ${
              isSel
                ? "border-[3px] border-white bg-[#14563c] text-white shadow-md"
                : "border-2 border-[#1d6f4e] bg-white text-[#1d6f4e] shadow-xs"
            }`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.qty}
          </button>
        );
      })}

      {/* scale + attribution */}
      <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-0.5 text-[11px] text-fs-muted">200 m</span>
      <span className="absolute bottom-3 right-3 rounded bg-white/70 px-1.5 py-0.5 text-[11px] text-fs-muted">© OpenStreetMap</span>

      {/* selected popup */}
      {selected ? (
        <div
          className="absolute z-20 w-64 rounded-xl border border-fs-line bg-white p-3 shadow-lg"
          style={{
            top: `${Math.min(Math.max(selected.y, 24), 76)}%`,
            left: `${selected.x}%`,
            transform: `translate(${selected.x > 55 ? "calc(-100% - 20px)" : "20px"}, -50%)`,
          }}
        >
          <div className="flex items-center gap-2">
            <h4 className="flex-1 truncate text-sm font-bold text-fs-ink">{selected.name}</h4>
            <TypeBadge type={selected.type} />
            <button type="button" aria-label="Close popup" onClick={() => onSelect(selected.id)} className="rounded p-0.5 text-fs-muted hover:bg-black/5">
              <X className="size-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-fs-muted">
            {selected.qty} {selected.unit.charAt(0).toUpperCase() + selected.unit.slice(1)} · Until {selected.expiryTime}
          </p>
          <p className="mt-0.5 text-[11px] text-fs-muted">
            {selected.address}
            {selected.popupNote ? ` · ${selected.popupNote}` : ""}
          </p>
          <button type="button" onClick={() => onClaim(selected.id)} className="fs-btn-primary mt-2.5 w-full py-2 text-xs">
            Claim Food
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------- nearby card ---------------------------- */

function NearbyCard({
  item,
  selected,
  onSelect,
  onClaim,
}: {
  item: NearbyItem;
  selected: boolean;
  onSelect: () => void;
  onClaim: () => void;
}) {
  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-xs transition-colors sm:p-5 ${
        selected ? "border-fs-green ring-1 ring-fs-green" : "border-fs-line"
      }`}
    >
      <div className="flex items-center justify-between">
        <TypeBadge type={item.type} />
        <span className="text-xs text-fs-muted">{item.distanceKm.toFixed(1)} km</span>
      </div>
      <h3 className="mt-2 text-lg font-bold text-fs-ink">{item.name}</h3>
      <p className="mt-1 text-sm text-fs-muted">
        {item.vendor} · {item.qty} {item.unit}
      </p>
      <p className="mt-1 text-xs text-fs-muted">{item.address}</p>
      <p className={`mt-1 text-xs ${item.soon ? "font-semibold text-[#b45309]" : "text-fs-muted"}`}>
        Expires {item.expiryText}
      </p>
      <p className="mt-1 text-[11px] text-fs-muted">
        {item.code} · Available
      </p>
      <p className="mt-1 text-xs text-fs-muted">Phone: {item.phone}</p>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onClaim} className="fs-btn-primary px-3 py-2 text-xs">
          Claim Food
        </button>
        <button type="button" onClick={onSelect} className="fs-btn-outline px-3 py-2 text-xs">
          {selected ? "Selected on map" : "View on map"}
        </button>
      </div>
    </article>
  );
}

/* ----------------------------- claim card ---------------------------- */

function ClaimCard({ d }: { d: Donation }) {
  const receiverMarkPicked = useFS((s) => s.receiverMarkPicked);
  const receiverMarkCompleted = useFS((s) => s.receiverMarkCompleted);
  const cancelClaim = useFS((s) => s.cancelClaim);
  const claim = d.claim!;
  const mapsUrl = "https://www.google.com/maps?q=12.9784,77.6408";
  const phone = claim.phone.replace(/\s/g, "");
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
      <h3 className="mt-1.5 text-lg font-bold text-fs-ink">
        {d.name} · {d.qty} {d.unit}
      </h3>
      <p className="mt-1 text-sm text-fs-muted">
        {d.status === "claimed"
          ? `Claimed ${d.claimedAt} · Collect by ${d.pickupBy}`
          : d.status === "picked_up"
            ? `Picked up ${d.pickedUpAt} · Confirm after distribution`
            : `Completed ${d.completedAt} · Receipt saved`}
      </p>
      <p className="mt-0.5 text-sm text-fs-muted">
        {claim.org} · Expires today, {d.expiryTime}
      </p>

      <div className="mt-3.5 rounded-lg bg-fs-panel p-3.5">
        <p className="text-xs font-semibold text-fs-body">24, 5th Cross, Indiranagar</p>
        <p className="mt-0.5 text-xs text-fs-muted">Bengaluru, Karnataka 560038</p>
        <p className="mt-1.5 text-xs text-fs-muted">
          Priya Rao · +91 90000 12001
        </p>
        <p className="mt-0.5 text-xs text-fs-muted">annapurna.kitchen@foodshare.in</p>
        <p className="mt-1.5 text-xs text-fs-muted">Maps destination: 12.9784, 77.6408</p>
      </div>

      <a href={mapsUrl} target="_blank" rel="noreferrer" className="fs-btn-outline mt-3 w-full px-3 py-2 text-xs">
        <ExternalLink className="size-3.5" /> Open in Google Maps
      </a>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {d.status === "claimed" ? (
          <>
            <button type="button" onClick={() => receiverMarkPicked(d.id)} className="fs-btn-outline px-3.5 py-2 text-xs">
              Mark Picked Up
            </button>
            <button type="button" onClick={() => cancelClaim(d.id)} className="fs-btn-outline px-3.5 py-2 text-xs">
              Cancel Claim
            </button>
          </>
        ) : null}
        {d.status === "picked_up" ? (
          <button type="button" onClick={() => receiverMarkCompleted(d.id)} className="fs-btn-primary px-3.5 py-2 text-xs">
            Mark Completed
          </button>
        ) : null}
        {d.status === "completed" ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-fs-green">
            <Check className="size-4" strokeWidth={3} /> Receipt confirmed by {claim.contact} · View receipt →
          </p>
        ) : null}
      </div>

      {d.status === "claimed" ? (
        <p className="mt-2 text-xs text-fs-muted">Confirm only after collecting from the vendor.</p>
      ) : null}
      {d.status === "picked_up" ? (
        <p className="mt-2 text-xs text-fs-muted">Confirm only after food has reached your community.</p>
      ) : null}
    </article>
  );
}

/* ----------------------------- workspace ----------------------------- */

export function ReceiverDashboard() {
  const receiverTab = useFS((s) => s.receiverTab);
  const setReceiverTab = useFS((s) => s.setReceiverTab);
  const claimAlert = useFS((s) => s.claimAlert);
  const dismissAlert = useFS((s) => s.dismissAlert);
  const donations = useFS((s) => s.donations);
  const nearby = useFS((s) => s.nearby);
  const search = useFS((s) => s.search);
  const setSearch = useFS((s) => s.setSearch);
  const distanceKm = useFS((s) => s.distanceKm);
  const setDistance = useFS((s) => s.setDistance);
  const foodType = useFS((s) => s.foodType);
  const setFoodType = useFS((s) => s.setFoodType);
  const selectedMapId = useFS((s) => s.selectedMapId);
  const selectOnMap = useFS((s) => s.selectOnMap);
  const claimFood = useFS((s) => s.claimFood);
  const session = useFS((s) => s.session);

  const claims = useMemo(
    () =>
      donations.filter(
        (d) => d.claim && d.claim.org === RECEIVER_ACCOUNT.name && (d.status === "claimed" || d.status === "picked_up" || d.status === "completed")
      ),
    [donations]
  );

  const filteredNearby = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...nearby]
      .filter((n) => n.distanceKm <= distanceKm)
      .filter((n) => (foodType === "all" ? true : n.type === foodType))
      .filter((n) =>
        q ? n.name.toLowerCase().includes(q) || n.vendor.toLowerCase().includes(q) || n.address.toLowerCase().includes(q) : true
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nearby, search, distanceKm, foodType]);

  const showFind = receiverTab === "find";
  const showClaims = receiverTab === "claims";

  /* desktop: both columns visible (per design); nav scrolls to the section.
     mobile: tabs switch between the two sections. */
  function handleTab(id: string) {
    setReceiverTab(id as "find" | "claims");
    if (typeof window !== "undefined" && window.innerWidth >= 768 && id === "claims") {
      document.getElementById("claims-col")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <DashboardShell role="receiver" activeTab={receiverTab} onTab={handleTab} secondaryCount={claims.length}>
      <DashEyebrow>Bengaluru · 08 Nov 2026 · 10:30 IST</DashEyebrow>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-fs-ink sm:text-3xl">Find food &amp; manage pickups</h1>
      <p className="mt-2 text-sm text-fs-muted sm:text-base">{session?.name} · Discover available donations near your organization.</p>

      {claimAlert ? (
        <Alert tone="success" title="Food Claimed!" onClose={dismissAlert} className="mt-5">
          {claimAlert}
        </Alert>
      ) : null}

      <div className={showFind ? "mt-5 grid gap-4 sm:grid-cols-3" : "mt-5 hidden gap-4 sm:grid-cols-3 lg:grid"}>
        <Field label="Search area">
          <div className="relative">
            <input className="fs-input pr-10" placeholder="Indiranagar, Bengaluru" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search area" />
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fs-muted" />
          </div>
        </Field>
        <Field label="Distance">
          <SelectInput
            value={String(distanceKm)}
            onChange={(v) => setDistance(Number(v))}
            options={[1, 3, 5, 10].map((km) => ({ value: String(km), label: `Within ${km} km` }))}
            ariaLabel="Distance"
          />
        </Field>
        <Field label="Food type">
          <SelectInput
            value={foodType}
            onChange={setFoodType}
            options={[
              { value: "all", label: "All food types" },
              { value: "Veg", label: "Veg" },
              { value: "Non-Veg", label: "Non-Veg" },
            ]}
            ariaLabel="Food type"
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_370px]">
        <div className={showFind ? "min-w-0" : "hidden lg:block min-w-0"}>
          <div className="space-y-6">
            <section className="rounded-xl border border-fs-line bg-white p-4 shadow-xs sm:p-5" aria-label="Food near you">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-fs-ink">Food near you</h2>
                <p className="text-xs text-fs-muted">{filteredNearby.length} available donations · Updated just now</p>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-[#2b5d8f]">
                  <span className="size-2 rounded-full bg-[#3b82f6]" /> Live location on
                </span>
                <span className="text-fs-muted">Accurate to 20 m</span>
              </div>
              <div className="mt-3">
                <MockMap
                  items={filteredNearby}
                  selectedId={selectedMapId}
                  onSelect={(id) => selectOnMap(selectedMapId === id ? null : id)}
                  onClaim={claimFood}
                />
              </div>
              <p className="mt-2.5 text-[11px] text-fs-muted">
                <span className="mr-1 inline-block size-2 rounded-full bg-[#3b82f6] align-middle" /> Blue: your location ·{" "}
                <span className="mx-1 inline-block size-2 rounded-full bg-[#1d6f4e] align-middle" /> Green: available pickups. Select a marker to claim.
              </p>
            </section>

            <section aria-label="Nearby food">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-fs-ink">Nearby food</h2>
                <p className="text-xs text-fs-muted">Nearest first</p>
              </div>
              <div className="mt-4 space-y-4">
                {filteredNearby.length === 0 ? (
                  <EmptyState title="No food available nearby.">Try a wider radius or refresh later.</EmptyState>
                ) : (
                  filteredNearby.map((item) => (
                    <NearbyCard
                      key={item.id}
                      item={item}
                      selected={selectedMapId === item.id}
                      onSelect={() => selectOnMap(selectedMapId === item.id ? null : item.id)}
                      onClaim={() => claimFood(item.id)}
                    />
                  ))
                )}
              </div>
              <Alert tone="info" title="Before you claim" className="mt-5">
                Check quantity, food type and expiry. Claim only what your team can collect and distribute safely.
              </Alert>
            </section>
          </div>
        </div>

        <div id="claims-col" className={showClaims ? "min-w-0" : "hidden lg:block min-w-0"}>
          <section aria-label="My claims">
            <h2 className="text-xl font-bold text-fs-ink">My claims · {claims.length}</h2>
            <p className="mt-1.5 text-sm text-fs-muted">Claimed → Picked Up → Completed. Update each step after it happens.</p>
            <div className="mt-4 space-y-4">
              {claims.length === 0 ? (
                <EmptyState title="You have no active claims.">Browse nearby food to start.</EmptyState>
              ) : (
                claims.map((d) => <ClaimCard key={d.id} d={d} />)
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
