"use client";

import { ArrowRight, Check } from "lucide-react";
import { Alert, PublicHeader } from "@/components/foodshare/ui";
import { useFS } from "@/lib/foodshare/store";

const CARDS = [
  {
    pill: "For vendors",
    title: "I have food to donate",
    desc: "Register your business and make surplus food available for local pickup.",
    points: ["Post food, quantity and expiry", "Coordinate with a verified NGO", "Track every donation to completion"],
    cta: "Register as a vendor",
    view: "vendor-register" as const,
  },
  {
    pill: "For receivers · NGOs",
    title: "I need food for my community",
    desc: "Register your organization to find and collect nearby food donations.",
    points: ["Find available food on the map", "Claim donations for your organization", "Manage pickups and confirm receipt"],
    cta: "Register as a receiver",
    view: "receiver-register" as const,
  },
];

export function Landing() {
  const go = useFS((s) => s.go);
  const goLogin = useFS((s) => s.goLogin);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-fs-green">Food management &amp; redistribution</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-fs-ink sm:text-5xl">
            Share surplus.{" "}
            <span className="block sm:inline">Coordinate pickups.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-fs-muted sm:text-lg">
            Connect food businesses with verified NGOs in Bengaluru. Choose an account to get started.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {CARDS.map((c) => (
              <section key={c.pill} className="flex flex-col rounded-xl border border-fs-line bg-white p-6 shadow-xs">
                <span className="inline-flex w-fit items-center rounded-md bg-fs-green-soft px-2.5 py-1 text-xs font-semibold text-fs-green-deep">
                  {c.pill}
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-fs-ink">{c.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-fs-muted">{c.desc}</p>
                <hr className="my-5 border-fs-line" />
                <ul className="space-y-3">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-fs-body">
                      <Check className="mt-0.5 size-4 shrink-0 text-fs-ink" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(c.view)}
                  className="fs-btn-primary mt-7 w-full"
                >
                  {c.cta} <ArrowRight className="size-4" />
                </button>
                <p className="mt-3.5 text-center text-xs text-fs-muted sm:text-left">
                  Free account · Administrator verification required
                </p>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#ecefec] p-5">
            <p className="font-semibold text-fs-ink">Already registered?</p>
            <button type="button" onClick={() => goLogin()} className="fs-btn-outline">
              Log in to your account
            </button>
          </div>

          <Alert tone="info" title="Safe redistribution starts with accurate details" className="mt-8">
            Only list food that is safe to consume. Set a future expiry and arrange pickup before that time.
          </Alert>
        </div>
      </main>
    </div>
  );
}
