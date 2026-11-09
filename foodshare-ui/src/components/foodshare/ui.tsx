"use client";

import { useState } from "react";
import { Check, ChevronDown, CircleCheck, Clock, Eye, EyeOff, X } from "lucide-react";
import type { DonationStatus, Role } from "@/lib/foodshare/store";
import { useFS } from "@/lib/foodshare/store";

/* ------------------------------ logo ------------------------------- */

export function ForkGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 2v5a4 4 0 0 0 8 0V2" />
      <path d="M10 11v11" />
    </svg>
  );
}

export function FSLogo({ tagline, href = "landing" }: { tagline?: string; href?: "landing" | "none" }) {
  const go = useFS((s) => s.go);
  return (
    <button
      type="button"
      onClick={href === "landing" ? () => go("landing") : undefined}
      className="flex items-center gap-2.5 text-left"
      aria-label="FoodShare home"
    >
      <span className="text-fs-green">
        <ForkGlyph className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-fs-ink">FoodShare</span>
      {tagline ? <span className="hidden text-sm text-fs-muted lg:inline">{tagline}</span> : null}
    </button>
  );
}

/* ---------------------------- headers ------------------------------ */

function RolePill({ role }: { role: Role }) {
  return (
    <span className="rounded-md bg-[#e7ece7] px-2 py-1 text-xs font-semibold text-[#41544a]">{role}</span>
  );
}

function NavLinks() {
  const go = useFS((s) => s.go);
  const goLogin = useFS((s) => s.goLogin);
  const links: Array<[string, () => void]> = [
    ["Vendor", () => go("vendor-register")],
    ["Receiver", () => go("receiver-register")],
    ["Admin", () => goLogin("admin")],
  ];
  return (
    <nav className="flex items-center gap-6" aria-label="Account types">
      {links.map(([label, fn]) => (
        <button key={label} type="button" onClick={fn} className="text-sm font-semibold text-fs-green hover:text-fs-green-dark">
          {label}
        </button>
      ))}
    </nav>
  );
}

function NavPills() {
  const goLogin = useFS((s) => s.goLogin);
  const pills: Array<[string, Role]> = [
    ["Vendor", "vendor"],
    ["Receiver", "receiver"],
    ["Admin", "admin"],
  ];
  return (
    <nav className="flex items-center gap-2" aria-label="Account types">
      {pills.map(([label, role]) => (
        <button
          key={label}
          type="button"
          onClick={() => goLogin(role)}
          className="rounded-full border border-[#d6ddd5] bg-white px-3.5 py-1.5 text-sm font-medium text-fs-ink transition-colors hover:bg-fs-green-soft"
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

/** Header for the landing page (text links). */
export function PublicHeader() {
  return (
    <header className="border-b border-fs-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0">
        <FSLogo tagline="Food redistribution network" />
        <div className="hidden md:block">
          <NavLinks />
        </div>
        <div className="md:hidden">
          <NavPills />
        </div>
      </div>
    </header>
  );
}

/** Header for login / registration pages. */
export function AuthHeader({ showLoginLink = true }: { showLoginLink?: boolean }) {
  const goLogin = useFS((s) => s.goLogin);
  return (
    <header className="border-b border-fs-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:gap-3 md:py-0">
        <FSLogo tagline="Food redistribution network" />
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {showLoginLink ? (
            <button type="button" onClick={() => goLogin()} className="text-sm font-semibold text-fs-green hover:text-fs-green-dark">
              Log in →
            </button>
          ) : null}
          <NavLinks />
        </div>
      </div>
    </header>
  );
}

/** Header for signed-in dashboards. */
export function AppHeader({ tagline }: { tagline: string }) {
  const session = useFS((s) => s.session);
  const logout = useFS((s) => s.logout);
  if (!session) return null;
  return (
    <header className="border-b border-fs-line bg-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 md:h-16">
        <FSLogo tagline={tagline} href="none" />
        <div className="flex items-center gap-2 sm:gap-3">
          <RolePill role={session.role} />
          <span className="hidden text-sm text-fs-muted md:inline">{session.email}</span>
          <button type="button" onClick={logout} className="text-sm font-bold text-fs-ink hover:text-fs-green-dark">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const goLogin = useFS((s) => s.goLogin);
  return (
    <footer className="mt-auto border-t border-fs-line bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <p className="text-sm text-fs-muted">FoodShare · Bengaluru Urban</p>
        <button type="button" onClick={() => goLogin()} className="text-sm font-medium text-fs-green hover:text-fs-green-dark">
          Help &amp; privacy
        </button>
      </div>
    </footer>
  );
}

/* ---------------------------- badges ------------------------------- */

const STATUS_STYLES: Record<DonationStatus, { cls: string; label: string }> = {
  available: { cls: "bg-[#e3edf9] text-[#2b5d8f]", label: "Available" },
  claimed: { cls: "bg-[#fdeedd] text-[#b45309]", label: "Claimed" },
  picked_up: { cls: "bg-[#efeafb] text-[#6d4fa1]", label: "Picked Up" },
  completed: { cls: "bg-[#e3f0e7] text-[#1d6f4e]", label: "Completed" },
  withdrawn: { cls: "bg-[#eef1ec] text-fs-muted", label: "Withdrawn" },
};

export function StatusBadge({ status }: { status: DonationStatus }) {
  const s = STATUS_STYLES[status];
  return <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

export function TypeBadge({ type }: { type: "Veg" | "Non-Veg" }) {
  const cls = type === "Veg" ? "bg-[#e3efe6] text-[#1d6f4e]" : "bg-[#f9e3e0] text-[#b03a2e]";
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${cls}`}>{type}</span>;
}

export function Pill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "gray" }) {
  const cls =
    tone === "green"
      ? "bg-fs-green-soft text-fs-green-deep"
      : tone === "amber"
        ? "bg-[#fdeedd] text-[#b45309]"
        : "bg-[#e7ece7] text-[#41544a]";
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function CountChip({ label, tone }: { label: string; tone: "blue" | "amber" | "green" | "gray" | "purple" }) {
  const cls =
    tone === "blue"
      ? "bg-[#e3edf9] text-[#2b5d8f]"
      : tone === "amber"
        ? "bg-[#fdeedd] text-[#b45309]"
        : tone === "green"
          ? "bg-[#e3f0e7] text-[#1d6f4e]"
          : tone === "purple"
            ? "bg-[#efeafb] text-[#6d4fa1]"
            : "bg-[#e7ece7] text-[#41544a]";
  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

/* ----------------------------- alerts ------------------------------ */

type AlertTone = "info" | "warning" | "success" | "error";

export function Alert({
  tone,
  title,
  children,
  onClose,
  className = "",
}: {
  tone: AlertTone;
  title: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const cfg: Record<AlertTone, { box: string; title: string; body: string; icon: React.ReactNode }> = {
    info: {
      box: "bg-[#eef4fb] border-[#4a7fd4]",
      title: "text-[#2b5d8f]",
      body: "text-[#4a6580]",
      icon: <CircleCheck className="size-5 shrink-0 text-[#4a7fd4]" />,
    },
    warning: {
      box: "bg-fs-amber-bg border-fs-amber",
      title: "text-fs-amber-text",
      body: "text-fs-amber-body",
      icon: <Clock className="size-5 shrink-0 text-[#c98f2c]" />,
    },
    success: {
      box: "bg-[#e6f2ea] border-fs-green",
      title: "text-fs-green-deep",
      body: "text-[#3e6b52]",
      icon: <CircleCheck className="size-5 shrink-0 text-fs-green" />,
    },
    error: {
      box: "bg-fs-red-bg border-[#b34038]",
      title: "text-fs-red-text",
      body: "text-[#a3504a]",
      icon: <CircleCheck className="size-5 shrink-0 text-[#b34038]" />,
    },
  };
  const c = cfg[tone];
  return (
    <div className={`flex gap-3 rounded-lg border-l-4 p-4 ${c.box} ${className}`} role={tone === "error" ? "alert" : "status"}>
      <div className="mt-0.5">{c.icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${c.title}`}>{title}</p>
        {children ? <div className={`mt-1 text-sm ${c.body}`}>{children}</div> : null}
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="self-start rounded p-0.5 text-[#5b6b60] hover:bg-black/5">
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------------- fields ------------------------------ */

export function Field({
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-semibold text-fs-ink">
        {label} {required ? <span>*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[#b34038]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-fs-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  invalid,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const show = useShowPassword();
  return (
    <div className="relative">
      <input
        type={show.visible ? "text" : "password"}
        className={`fs-input pr-11 ${invalid ? "fs-input-error" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={show.toggle}
        aria-label={show.visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-fs-muted hover:text-fs-ink"
      >
        {show.visible ? <Eye className="size-[18px]" /> : <EyeOff className="size-[18px]" />}
      </button>
    </div>
  );
}

function useShowPassword() {
  const [visible, setVisible] = useState(false);
  return { visible, toggle: () => setVisible((v) => !v) };
}

export function SelectInput({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  ariaLabel?: string;
}) {
  return (
    <div className="relative">
      <select className="fs-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fs-muted" />
    </div>
  );
}

export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fs-body">
      <input type="checkbox" className="fs-checkbox mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="leading-snug">{children}</span>
    </label>
  );
}

/* ------------------- segmented role selector ----------------------- */

export function RoleSegmented({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const roles: Array<{ id: Role; label: string }> = [
    { id: "vendor", label: "Vendor" },
    { id: "receiver", label: "Receiver" },
    { id: "admin", label: "Admin" },
  ];
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-fs-track p-1" role="radiogroup" aria-label="Account role">
      {roles.map((r) => {
        const active = value === r.id;
        return (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(r.id)}
            className={`rounded-md border px-2 py-2 text-sm transition-colors ${
              active
                ? "border-[#d6ddd5] bg-white font-semibold text-fs-green-deep shadow-xs"
                : "border-transparent text-fs-muted hover:text-fs-ink"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- stepper ----------------------------- */

const STEP_COLORS = ["#4a7fd4", "#d97e3d", "#8b6bc7", "#1d6f4e"];
const STEP_LABELS = ["Available", "Claimed", "Picked Up", "Completed"];

export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="grid grid-cols-4" role="img" aria-label={`Donation progress: step ${current} of 4`}>
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const color = STEP_COLORS[i];
        const done = step < current;
        const isCurrent = step === current;
        return (
          <div key={label} className="relative flex flex-col items-center">
            {/* connecting bar (drawn from the center of this circle to the next) */}
            {i < 3 ? (
              <span
                className="absolute top-[13px] left-1/2 h-[3px] w-full -translate-y-1/2 rounded"
                style={{ backgroundColor: current >= step ? color : "#e0e5df" }}
              />
            ) : null}
            <span
              className="relative z-10 flex size-[26px] items-center justify-center rounded-full border-2 bg-white text-[11px] font-bold"
              style={{
                borderColor: color,
                backgroundColor: step <= current ? color : "#ffffff",
                color: step <= current ? "#ffffff" : color,
              }}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : step}
            </span>
            <span
              className={`mt-1.5 text-[11px] font-semibold ${step <= current ? "" : "text-fs-muted"}`}
              style={step <= current ? { color } : undefined}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------- empty state --------------------------- */

export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-fs-panel p-4">
      <p className="text-sm font-bold text-fs-ink">{title}</p>
      <p className="mt-1 text-sm text-fs-muted">{children}</p>
    </div>
  );
}

/* ---------------------- side content blocks ------------------------ */

export function ServiceAreaBlock() {
  return (
    <div className="mt-8">
      <p className="text-[11px] font-bold uppercase tracking-wider text-fs-muted">Service area</p>
      <p className="mt-2 text-sm font-bold text-fs-ink">Bengaluru Urban</p>
      <p className="mt-0.5 text-xs text-fs-muted">All times in IST</p>
      <div className="mt-3">
        <Pill>Verified account</Pill>
      </div>
    </div>
  );
}
