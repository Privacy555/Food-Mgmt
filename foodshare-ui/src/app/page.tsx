"use client";

import { useEffect } from "react";
import { Landing } from "@/components/foodshare/landing";
import { Login } from "@/components/foodshare/login";
import { ReceiverRegister, VendorRegister } from "@/components/foodshare/register";
import { VendorDashboard } from "@/components/foodshare/vendor-dash";
import { ReceiverDashboard } from "@/components/foodshare/receiver-dash";
import { AdminDashboard } from "@/components/foodshare/admin-dash";
import { SiteFooter } from "@/components/foodshare/ui";
import { useFS } from "@/lib/foodshare/store";

export default function Home() {
  const view = useFS((s) => s.view);
  const session = useFS((s) => s.session);

  /* signed-in users always land on their workspace */
  useEffect(() => {
    if (session && (view === "landing" || view === "login")) {
      useFS.getState().login(session.role, session.email);
    }
  }, [session, view]);

  return (
    <div className="flex min-h-screen flex-col bg-fs-bg text-fs-ink antialiased">
      {view === "landing" ? <Landing /> : null}
      {view === "login" ? <Login /> : null}
      {view === "vendor-register" ? <VendorRegister /> : null}
      {view === "receiver-register" ? <ReceiverRegister /> : null}
      {view === "vendor-dash" && session ? <VendorDashboard /> : null}
      {view === "receiver-dash" && session ? <ReceiverDashboard /> : null}
      {view === "admin-dash" && session ? <AdminDashboard /> : null}
      <SiteFooter />
    </div>
  );
}
