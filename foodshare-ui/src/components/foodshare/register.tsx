"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CircleCheck, Crosshair } from "lucide-react";
import { Alert, AuthHeader, CheckRow, Field, PasswordInput, Pill, SelectInput } from "@/components/foodshare/ui";
import { useFS } from "@/lib/foodshare/store";

/* ------------------------- shared left rail ------------------------- */

function RegisterRail({
  pill,
  title,
  desc,
  steps,
  currentSteps,
}: {
  pill: string;
  title: string;
  desc: string;
  steps: string[];
  currentSteps: number;
}) {
  const go = useFS((s) => s.go);
  return (
    <aside>
      <button type="button" onClick={() => go("landing")} className="fs-link inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" /> Back to account selection
      </button>
      <div className="mt-5">
        <Pill>{pill}</Pill>
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-fs-ink sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-fs-muted">{desc}</p>
      <hr className="my-6 border-fs-line" />
      <p className="text-sm font-bold text-fs-ink">Account setup</p>
      <ol className="mt-3 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s} className={`flex gap-2 text-sm ${i < currentSteps ? "font-medium text-fs-green" : "text-fs-muted"}`}>
            <span className="font-semibold">{i + 1}</span> {s}
          </li>
        ))}
      </ol>
      <Alert tone="info" title="Verification required" className="mt-6">
        An administrator reviews your details before you can post or claim food.
      </Alert>
    </aside>
  );
}

/* ------------------------- success panel ---------------------------- */

function RegSuccess({ kind }: { kind: "vendor" | "receiver" }) {
  const go = useFS((s) => s.go);
  const goLogin = useFS((s) => s.goLogin);
  const clearRegSuccess = useFS((s) => s.clearRegSuccess);
  return (
    <div className="rounded-xl border border-fs-line bg-white p-6 shadow-xs sm:p-8">
      <Alert tone="success" title="Registration submitted">
        An administrator reviews your details before you can {kind === "vendor" ? "post food" : "claim food"}. Your account is
        now pending verification.
      </Alert>
      <p className="mt-5 text-sm text-fs-muted">
        The review usually completes within a day. You can already log in and explore your workspace while verification is in
        progress.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            clearRegSuccess();
            goLogin(kind);
          }}
          className="fs-btn-primary"
        >
          Go to log in
        </button>
        <button
          type="button"
          onClick={() => {
            clearRegSuccess();
            go("landing");
          }}
          className="fs-btn-outline"
        >
          Back to FoodShare
        </button>
      </div>
    </div>
  );
}

/* --------------------------- vendor form ---------------------------- */

export function VendorRegister() {
  const submitVendorReg = useFS((s) => s.submitVendorReg);
  const goLogin = useFS((s) => s.goLogin);
  const regSuccess = useFS((s) => s.regSuccess);

  const [form, setForm] = useState({
    restaurant: "Annapurna Kitchen",
    category: "Restaurant",
    owner: "Priya Rao",
    phone: "+91 90000 12001",
    email: "annapurna.kitchen@foodshare.in",
    street: "24, 5th Cross, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    landmark: "Near Indiranagar Metro",
    lat: "12.9784",
    lng: "77.6408",
    password: "ricecurry1",
    confirm: "ricecurry1",
    agree: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const passwordOk = form.password.length >= 6;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.restaurant.trim()) errs.restaurant = "Restaurant name is required.";
    if (!form.owner.trim()) errs.owner = "Owner name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "Enter a valid email address, such as name@example.org.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    if (!form.street.trim()) errs.street = "Street address is required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode.";
    if (!form.lat.trim() || !form.lng.trim()) errs.geo = "Map pin coordinates are required.";
    if (!passwordOk) errs.password = "Password must be at least 6 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    if (!form.agree) errs.agree = "Please confirm before submitting.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    submitVendorReg(form.restaurant.trim(), form.email.trim(), form.phone.trim(), form.street.trim(), `${form.city}, ${form.state} ${form.pincode}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[290px_1fr] md:py-10">
          <RegisterRail
            pill="Vendor registration"
            title="Register your business"
            desc="Create a vendor account to list surplus food and coordinate safe pickups with verified NGOs."
            steps={["Organization & contact", "Location & account security", "Submit for verification"]}
            currentSteps={2}
          />

          {regSuccess?.kind === "vendor" ? (
            <RegSuccess kind="vendor" />
          ) : (
            <form onSubmit={submit} noValidate className="rounded-xl border border-fs-line bg-white p-5 shadow-xs sm:p-7">
              <p className="text-xs text-fs-muted">All fields marked * are required.</p>

              <h2 className="mt-4 text-lg font-bold text-fs-ink">Business details</h2>
              <div className="mt-4 space-y-5">
                <Field label="Restaurant Name" required error={errors.restaurant}>
                  <input className={`fs-input ${errors.restaurant ? "fs-input-error" : ""}`} value={form.restaurant} onChange={(e) => set("restaurant")(e.target.value)} />
                </Field>
                <Field label="Category" required hint="Choose: Restaurant, Caterer, Hotel, Supermarket.">
                  <SelectInput
                    value={form.category}
                    onChange={set("category")}
                    options={["Restaurant", "Caterer", "Hotel", "Supermarket"].map((c) => ({ value: c, label: c }))}
                    ariaLabel="Business category"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Owner Name" required error={errors.owner}>
                    <input className={`fs-input ${errors.owner ? "fs-input-error" : ""}`} value={form.owner} onChange={(e) => set("owner")(e.target.value)} />
                  </Field>
                  <Field label="Phone number" required error={errors.phone} hint="Used by the collecting NGO.">
                    <input className={`fs-input ${errors.phone ? "fs-input-error" : ""}`} value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
                  </Field>
                </div>
                <Field label="Email" required error={errors.email}>
                  <input type="email" className={`fs-input ${errors.email ? "fs-input-error" : ""}`} value={form.email} onChange={(e) => set("email")(e.target.value)} />
                </Field>
              </div>

              <hr className="my-7 border-fs-line" />

              <h2 className="text-lg font-bold text-fs-ink">Default pickup address</h2>
              <p className="mt-1.5 text-sm text-fs-muted">This location is shared with the NGO after a claim.</p>
              <div className="mt-4 space-y-5">
                <Field label="Street address" required error={errors.street}>
                  <input className={`fs-input ${errors.street ? "fs-input-error" : ""}`} value={form.street} onChange={(e) => set("street")(e.target.value)} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City" required>
                    <input className="fs-input" value={form.city} onChange={(e) => set("city")(e.target.value)} />
                  </Field>
                  <Field label="State" required>
                    <SelectInput value={form.state} onChange={set("state")} options={[{ value: "Karnataka", label: "Karnataka" }]} ariaLabel="State" />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Pincode" required error={errors.pincode} hint={errors.pincode ? undefined : "Valid 6-digit pincode."}>
                    <input
                      inputMode="numeric"
                      className={`fs-input ${errors.pincode ? "fs-input-error" : ""}`}
                      value={form.pincode}
                      onChange={(e) => set("pincode")(e.target.value)}
                    />
                  </Field>
                  <Field label="Landmark">
                    <input className="fs-input" value={form.landmark} onChange={(e) => set("landmark")(e.target.value)} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Map Pin Latitude" required error={errors.geo}>
                    <input className="fs-input" value={form.lat} onChange={(e) => set("lat")(e.target.value)} aria-label="Map pin latitude" />
                  </Field>
                  <Field label="Map Pin Longitude" required error={errors.geo}>
                    <input className="fs-input" value={form.lng} onChange={(e) => set("lng")(e.target.value)} aria-label="Map pin longitude" />
                  </Field>
                </div>
              </div>

              <hr className="my-7 border-fs-line" />

              <h2 className="text-lg font-bold text-fs-ink">Account security</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field label="Password" required error={errors.password}>
                  <PasswordInput value={form.password} onChange={set("password")} invalid={!!errors.password} ariaLabel="Password" />
                </Field>
                <Field label="Confirm password" required error={errors.confirm}>
                  <PasswordInput value={form.confirm} onChange={set("confirm")} invalid={!!errors.confirm} ariaLabel="Confirm password" />
                </Field>
              </div>
              <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${passwordOk ? "text-fs-green" : "text-fs-muted"}`}>
                <CircleCheck className="size-3.5" /> Minimum 6 characters
              </p>

              <div className="mt-5">
                <CheckRow checked={form.agree} onChange={(v) => set("agree")(v)}>
                  I confirm that these business details are accurate and agree to the food safety guidelines and terms.
                </CheckRow>
                {errors.agree ? <p className="mt-1.5 text-xs font-medium text-[#b34038]">{errors.agree}</p> : null}
              </div>

              <Alert tone="warning" title="Review before submitting" className="mt-5">
                Your business details are ready for administrator verification.
              </Alert>

              <button type="submit" className="fs-btn-primary mt-6 w-full">
                Submit for verification
              </button>
              <p className="mt-4 text-center text-sm text-fs-muted">
                Already registered?{" "}
                <button type="button" onClick={() => goLogin("vendor")} className="fs-link">
                  Log in to your vendor account.
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

/* -------------------------- receiver form --------------------------- */

export function ReceiverRegister() {
  const submitReceiverReg = useFS((s) => s.submitReceiverReg);
  const goLogin = useFS((s) => s.goLogin);
  const regSuccess = useFS((s) => s.regSuccess);

  const [form, setForm] = useState({
    org: "Asha Foundation",
    manager: "Meera Shah",
    phone: "+91 90000 22002",
    email: "asha.foundation@foodshare.in",
    category: "NGO",
    street: "18, CMH Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    radius: "5 km",
    password: "",
    confirm: "",
    agree: true,
  });
  const [located, setLocated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const rules = useMemo(
    () => [
      { id: "len", label: "At least 8 characters", met: form.password.length >= 8 },
      { id: "letter", label: "At least 1 letter", met: /[a-zA-Z]/.test(form.password) },
      { id: "num", label: "At least 1 number", met: /\d/.test(form.password) },
    ],
    [form.password]
  );
  const allMet = rules.every((r) => r.met);
  const showChecklist = form.password.length > 0 && !allMet;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.org.trim()) errs.org = "Organization name is required.";
    if (!form.manager.trim()) errs.manager = "Manager name is required.";
    if (!form.phone.trim()) errs.phone = "Contact number is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "Enter a valid email address, such as name@example.org.";
    if (!form.street.trim()) errs.street = "Street address is required.";
    if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode.";
    if (!allMet) errs.password = "Password does not meet all requirements.";
    if (form.confirm !== form.password || !form.confirm) errs.confirm = "Passwords do not match.";
    if (!form.agree) errs.agree = "Please confirm before submitting.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    submitReceiverReg(form.org.trim(), form.email.trim(), form.phone.trim(), form.street.trim(), `${form.city}, ${form.state} ${form.pincode}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[290px_1fr] md:py-10">
          <RegisterRail
            pill="Receiver registration"
            title="Register your organization"
            desc="Create an NGO account to find nearby donations and organize food collection for your community."
            steps={["Organization & contact", "Location & account security", "Submit for verification"]}
            currentSteps={2}
          />

          {regSuccess?.kind === "receiver" ? (
            <RegSuccess kind="receiver" />
          ) : (
            <form onSubmit={submit} noValidate className="rounded-xl border border-fs-line bg-white p-5 shadow-xs sm:p-7">
              <p className="text-xs text-fs-muted">All fields marked * are required.</p>

              <h2 className="mt-4 text-lg font-bold text-fs-ink">Organization &amp; contact details</h2>
              <div className="mt-4 space-y-5">
                <Field label="Organization name" required error={errors.org}>
                  <input className={`fs-input ${errors.org ? "fs-input-error" : ""}`} value={form.org} onChange={(e) => set("org")(e.target.value)} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Manager name" required error={errors.manager}>
                    <input className={`fs-input ${errors.manager ? "fs-input-error" : ""}`} value={form.manager} onChange={(e) => set("manager")(e.target.value)} />
                  </Field>
                  <Field label="Contact number" required error={errors.phone} hint="Shared with vendors for pickup coordination.">
                    <input className={`fs-input ${errors.phone ? "fs-input-error" : ""}`} value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
                  </Field>
                </div>
                <Field label="Organization email" required error={errors.email}>
                  <input type="email" className={`fs-input ${errors.email ? "fs-input-error" : ""}`} value={form.email} onChange={(e) => set("email")(e.target.value)} />
                </Field>
              </div>

              <hr className="my-7 border-fs-line" />

              <h2 className="text-lg font-bold text-fs-ink">Organization category</h2>
              <div className="mt-4">
                <Field label="Category" required hint="Choose: Orphanage, Shelter or NGO.">
                  <SelectInput
                    value={form.category}
                    onChange={set("category")}
                    options={["NGO", "Orphanage", "Shelter"].map((c) => ({ value: c, label: c }))}
                    ariaLabel="Organization category"
                  />
                </Field>
              </div>

              <hr className="my-7 border-fs-line" />

              <h2 className="text-lg font-bold text-fs-ink">Physical Facility Address</h2>
              <div className="mt-4 space-y-5">
                <Field label="Street address" required error={errors.street}>
                  <input className={`fs-input ${errors.street ? "fs-input-error" : ""}`} value={form.street} onChange={(e) => set("street")(e.target.value)} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="City" required>
                    <input className="fs-input" value={form.city} onChange={(e) => set("city")(e.target.value)} />
                  </Field>
                  <Field label="State" required>
                    <SelectInput value={form.state} onChange={set("state")} options={[{ value: "Karnataka", label: "Karnataka" }]} ariaLabel="State" />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Pincode" required error={errors.pincode}>
                    <input inputMode="numeric" className={`fs-input ${errors.pincode ? "fs-input-error" : ""}`} value={form.pincode} onChange={(e) => set("pincode")(e.target.value)} />
                  </Field>
                  <Field label="Service radius" required>
                    <SelectInput
                      value={form.radius}
                      onChange={set("radius")}
                      options={["1 km", "3 km", "5 km", "10 km"].map((r) => ({ value: r, label: r }))}
                      ariaLabel="Service radius"
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => setLocated(true)}
                  className="fs-btn-outline w-fit"
                >
                  <Crosshair className="size-4 text-fs-muted" /> {located ? "Current location captured" : "Use current location"}
                </button>
                <p className="text-xs text-fs-muted">Location is used to show nearby food. You can update it later.</p>
              </div>

              <hr className="my-7 border-fs-line" />

              <h2 className="text-lg font-bold text-fs-ink">Account security</h2>
              <div className="mt-4 space-y-5">
                <Field label="Create password" required error={errors.password}>
                  <PasswordInput value={form.password} onChange={set("password")} invalid={!!errors.password} ariaLabel="Create password" />
                </Field>
                {showChecklist ? (
                  <div className="rounded-lg bg-fs-panel p-4">
                    <p className="text-xs font-bold text-fs-red-text">Password does not meet all requirements.</p>
                    <p className="mt-2.5 text-xs font-bold text-fs-ink">Password must contain:</p>
                    <ul className="mt-2 space-y-1.5">
                      {rules.map((r) => (
                        <li key={r.id} className={`flex items-center gap-2 text-xs ${r.met ? "text-fs-green" : "text-[#b34038]"}`}>
                          {r.met ? (
                            <CircleCheck className="size-3.5" />
                          ) : (
                            <span className="inline-block size-3 rounded-full border border-[#c05048]" />
                          )}
                          {r.met ? r.label : `${r.label} — not met`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <Field label="Confirm password" required error={errors.confirm}>
                  <PasswordInput value={form.confirm} onChange={set("confirm")} placeholder="Re-enter your password" invalid={!!errors.confirm} ariaLabel="Confirm password" />
                </Field>
              </div>

              <div className="mt-5">
                <CheckRow checked={form.agree} onChange={(v) => set("agree")(v)}>
                  I am authorized to represent this organization and agree to the pickup, food safety and privacy terms.
                </CheckRow>
                {errors.agree ? <p className="mt-1.5 text-xs font-medium text-[#b34038]">{errors.agree}</p> : null}
              </div>

              <Alert tone="info" title="Verification required" className="mt-5">
                After you submit, an administrator will review your organization. Claiming is enabled once approved.
              </Alert>

              <button type="submit" className="fs-btn-primary mt-6 w-full">
                Submit for verification
              </button>
              <p className="mt-4 text-center text-sm text-fs-muted">
                Already registered?{" "}
                <button type="button" onClick={() => goLogin("receiver")} className="fs-link">
                  Log in to your receiver account.
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
