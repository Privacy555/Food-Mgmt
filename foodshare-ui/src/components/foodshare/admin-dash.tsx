"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { Alert, EmptyState, Field, Pill } from "@/components/foodshare/ui";
import { DashEyebrow, DashboardShell } from "@/components/foodshare/shell";
import { useFS, type PendingRequest } from "@/lib/foodshare/store";

/* --------------------------- approval card --------------------------- */

function ApprovalCard({ req }: { req: PendingRequest }) {
  const approve = useFS((s) => s.approve);
  const reject = useFS((s) => s.reject);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  return (
    <article className="rounded-xl border border-fs-line bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="gray">{req.kind === "vendor" ? "Vendor" : "Receiver"}</Pill>
        <Pill tone="amber">Pending</Pill>
      </div>
      <h3 className="mt-3 text-lg font-bold text-fs-ink">{req.name}</h3>
      <p className="mt-1 text-sm text-fs-muted">
        {req.category} · {req.time}
      </p>
      <p className="mt-1.5 text-sm text-fs-muted">{req.addr1}</p>
      <p className="text-sm text-fs-muted">{req.addr2}</p>

      <p className="mt-4 text-xs font-bold text-fs-ink">{req.contactLabel}</p>
      <p className="mt-1 text-sm font-semibold text-fs-body">{req.contactName}</p>
      <p className="mt-0.5 text-sm text-fs-muted">{req.phone}</p>
      <p className="text-sm text-fs-muted">{req.email}</p>

      <p className="mt-4 text-xs font-bold text-fs-ink">Review evidence</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-fs-green">
        <ExternalLink className="size-3.5" /> {req.evidence}
      </p>
      <p className="mt-2 text-xs text-fs-muted">Email verified ✓</p>
      <p className="mt-0.5 text-xs text-fs-muted">Phone verified ✓</p>

      {rejecting ? (
        <div className="mt-4 rounded-lg bg-fs-panel p-3.5">
          <label className="text-xs font-bold text-fs-ink" htmlFor={`reason-${req.id}`}>
            Reason for rejection
          </label>
          <textarea
            id={`reason-${req.id}`}
            className={`fs-input mt-2 min-h-20 ${reasonError ? "fs-input-error" : ""}`}
            placeholder="Sent to the applicant with the decision"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(false);
            }}
          />
          {reasonError ? <p className="mt-1.5 text-xs font-medium text-[#b34038]">Reason required to reject.</p> : null}
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (!reason.trim()) {
                  setReasonError(true);
                  return;
                }
                reject(req.id, reason.trim());
              }}
              className="fs-btn bg-[#b34038] px-3.5 py-2 text-xs text-white hover:bg-[#993630]"
            >
              Send rejection
            </button>
            <button type="button" onClick={() => setRejecting(false)} className="fs-btn-outline px-3.5 py-2 text-xs">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => approve(req.id)} className="fs-btn-primary px-4 py-2 text-xs">
            Approve
          </button>
          <button type="button" onClick={() => setRejecting(true)} className="fs-btn-danger px-4 py-2 text-xs">
            Reject
          </button>
          <span className="text-xs text-fs-muted">Reason required to reject.</span>
        </div>
      )}
    </article>
  );
}

/* ----------------------------- dashboard ----------------------------- */

export function AdminDashboard() {
  const adminTab = useFS((s) => s.adminTab);
  const setAdminTab = useFS((s) => s.setAdminTab);
  const claimAlert = useFS((s) => s.claimAlert);
  const dismissAlert = useFS((s) => s.dismissAlert);
  const pending = useFS((s) => s.pending);
  const audit = useFS((s) => s.audit);
  const verifiedUsers = useFS((s) => s.verifiedUsers);
  const queueTab = useFS((s) => s.queueTab);
  const setQueueTab = useFS((s) => s.setQueueTab);
  const queueSearch = useFS((s) => s.queueSearch);
  const setQueueSearch = useFS((s) => s.setQueueSearch);
  const refreshQueue = useFS((s) => s.refreshQueue);
  const queueRefreshing = useFS((s) => s.queueRefreshing);
  const newVendorRegs = useFS((s) => s.newVendorRegs);
  const newReceiverRegs = useFS((s) => s.newReceiverRegs);
  const approvedVendors = useFS((s) => s.approvedVendors);
  const approvedReceivers = useFS((s) => s.approvedReceivers);
  const rejectedVendors = useFS((s) => s.rejectedVendors);
  const rejectedReceivers = useFS((s) => s.rejectedReceivers);
  const session = useFS((s) => s.session);

  const vendors = pending.filter((p) => p.kind === "vendor");
  const receivers = pending.filter((p) => p.kind === "receiver");

  const filtered = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    return pending
      .filter((p) => (queueTab === "vendors" ? p.kind === "vendor" : queueTab === "receivers" ? p.kind === "receiver" : true))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.contactName.toLowerCase().includes(q) : true));
  }, [pending, queueTab, queueSearch]);

  const filteredVendors = filtered.filter((p) => p.kind === "vendor");
  const filteredReceivers = filtered.filter((p) => p.kind === "receiver");

  const totalVendors = 128 + newVendorRegs - rejectedVendors;
  const verifiedVendors = 126 + approvedVendors;
  const totalReceivers = 84 + newReceiverRegs - rejectedReceivers;
  const verifiedReceivers = 82 + approvedReceivers;

  return (
    <DashboardShell role="admin" activeTab={adminTab} onTab={(id) => setAdminTab(id as "dashboard" | "users")} secondaryCount={pending.length}>
      {adminTab === "dashboard" ? (
        <>
          <DashEyebrow>Bengaluru · 08 Nov 2026 · 10:30 IST</DashEyebrow>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-fs-ink sm:text-3xl">Admin verification &amp; governance</h1>
          <p className="mt-2 text-sm text-fs-muted sm:text-base">Track KPIs, review pending vendors and receivers, and verify access requests.</p>

          {claimAlert ? (
            <Alert tone="success" title="Food Claimed!" onClose={dismissAlert} className="mt-5">
              {claimAlert}
            </Alert>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Vendors", value: String(totalVendors), sub: `${verifiedVendors} verified · ${vendors.length} pending` },
              { label: "Total Receivers", value: String(totalReceivers), sub: `${verifiedReceivers} verified · ${receivers.length} pending` },
              { label: "Total Donations", value: "672", sub: "158 in progress or available" },
              { label: "Completed Pickups", value: "514", sub: "76.5% of all donations" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-fs-line bg-white p-5 shadow-xs">
                <p className="text-sm text-fs-muted">{k.label}</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-fs-ink">{k.value}</p>
                <p className="mt-2 text-xs text-fs-muted">{k.sub}</p>
              </div>
            ))}
          </div>

          <section className="mt-9" aria-label="Approval queue">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-fs-ink">Approval queue</h2>
              <Pill tone="amber">{pending.length} pending</Pill>
            </div>
            <p className="mt-1.5 text-sm text-fs-muted">Review identity, contact details and service location before granting access.</p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-fs-track p-1" role="tablist" aria-label="Queue filter">
                {(
                  [
                    { id: "all", label: `All (${pending.length})` },
                    { id: "vendors", label: `Vendors (${vendors.length})` },
                    { id: "receivers", label: `Receivers (${receivers.length})` },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={queueTab === t.id}
                    onClick={() => setQueueTab(t.id)}
                    className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                      queueTab === t.id
                        ? "border-[#d6ddd5] bg-white font-semibold text-fs-green-deep shadow-xs"
                        : "border-transparent text-fs-muted hover:text-fs-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <Field label="Search requests">
                <div className="relative">
                  <input
                    className="fs-input pr-10"
                    placeholder="Name, email or organization"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    aria-label="Search requests"
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fs-muted" />
                </div>
              </Field>
            </div>

            <Alert tone="info" title="Approval enables food posting or claiming" className="mt-5">
              Review the attached registration document. Rejections must include a clear reason sent to the applicant.
            </Alert>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-fs-ink">Pending Vendors</h3>
                  <Pill tone="amber">{filteredVendors.length} pending</Pill>
                </div>
                <div className="mt-4 space-y-4">
                  {filteredVendors.length === 0 ? <EmptyState title="No pending vendors.">New vendor requests will appear here.</EmptyState> : filteredVendors.map((r) => <ApprovalCard key={r.id} req={r} />)}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-fs-ink">Pending Receivers</h3>
                  <Pill tone="amber">{filteredReceivers.length} pending</Pill>
                </div>
                <div className="mt-4 space-y-4">
                  {filteredReceivers.length === 0 ? <EmptyState title="No pending receivers.">New NGO requests will appear here.</EmptyState> : filteredReceivers.map((r) => <ApprovalCard key={r.id} req={r} />)}
                </div>
              </div>
            </div>

            {pending.length === 0 ? (
              <div className="mt-6">
                <EmptyState title="All caught up.">There are no pending vendors or receivers to review.</EmptyState>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-fs-muted">Showing {filtered.length} of {pending.length} requests</p>
                <button type="button" onClick={refreshQueue} className="fs-btn-outline px-4 py-2 text-xs">
                  {queueRefreshing ? <Loader2 className="size-3.5 animate-spin" /> : null} Refresh queue
                </button>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-xl border border-fs-line bg-white p-5 shadow-xs sm:p-6" aria-label="Recent verification activity">
            <h3 className="text-lg font-bold text-fs-ink">Recent verification activity</h3>
            <p className="mt-1 text-xs text-fs-muted">Audit trail · 08 Nov 2026</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {audit.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <Pill tone={a.tone === "green" ? "green" : "amber"}>{a.badge}</Pill>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-fs-ink">{a.name}</p>
                    <p className="mt-0.5 text-xs text-fs-muted">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <DashEyebrow>Bengaluru · 08 Nov 2026 · 10:30 IST</DashEyebrow>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-fs-ink sm:text-3xl">All Users</h1>
          <p className="mt-2 text-sm text-fs-muted sm:text-base">Verified accounts approved by the service administrator.</p>

          <div className="mt-6 rounded-xl border border-fs-line bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-fs-line px-5 py-4">
              <h2 className="text-lg font-bold text-fs-ink">Verified accounts</h2>
              <p className="text-xs text-fs-muted">{verifiedUsers.length} accounts</p>
            </div>
            <ul className="divide-y divide-fs-line">
              {verifiedUsers.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <Pill tone="gray">{u.kind === "vendor" ? "Vendor" : "Receiver"}</Pill>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-fs-ink">{u.name}</p>
                    <p className="text-xs text-fs-muted">
                      {u.category} · {u.email} · {u.phone}
                    </p>
                  </div>
                  <span className="text-xs text-fs-muted">Approved {u.approvedAt}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
