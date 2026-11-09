"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AuthHeader, Field, PasswordInput, RoleSegmented } from "@/components/foodshare/ui";
import { useFS, type Role } from "@/lib/foodshare/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Login() {
  const go = useFS((s) => s.go);
  const goLogin = useFS((s) => s.goLogin);
  const login = useFS((s) => s.login);
  const loginRole = useFS((s) => s.loginRole);

  const [role, setRole] = useState<Role>(loginRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setBanner(false);
    let bad = false;

    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Enter a valid email address, such as name@example.org.");
      bad = true;
    } else {
      setEmailError(null);
    }

    if (password.length < 6) {
      setPasswordError("Email or password is incorrect. Please try again.");
      setBanner(true);
      bad = true;
    } else {
      setPasswordError(null);
    }

    if (bad) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      login(role, email.trim());
    }, 900);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 md:py-10">
          <button type="button" onClick={() => go("landing")} className="fs-link inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="size-4" /> Back to FoodShare
          </button>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-fs-ink sm:text-4xl">Log in to FoodShare</h1>
          <p className="mt-2 text-sm text-fs-muted sm:text-base">Select the role linked to your account.</p>

          <form onSubmit={submit} noValidate className="mt-7 rounded-xl border border-fs-line bg-white p-5 shadow-xs sm:p-6">
            <Field label="Account role" required>
              <RoleSegmented value={role} onChange={setRole} />
            </Field>

            {banner ? (
              <Alert tone="error" title="We couldn’t sign you in" className="mt-4">
                Check your email and password, and make sure the selected role matches your account.
              </Alert>
            ) : null}

            <Field label="Email address" required error={emailError ?? undefined} className="mt-5">
              <input
                type="email"
                className={`fs-input ${emailError ? "fs-input-error" : ""}`}
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" required error={passwordError ?? undefined} className="mt-5">
              <PasswordInput value={password} onChange={setPassword} placeholder="Enter password" invalid={!!passwordError} ariaLabel="Password" />
            </Field>

            <div className="mt-5 flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fs-body">
                <input type="checkbox" className="fs-checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="button" className="fs-link text-sm">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="fs-btn-primary mt-6 w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in...
                </>
              ) : (
                `Log in as ${role}`
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-fs-muted">
            Your account must be verified before you can post or claim food. Admin access is invitation-only.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-fs-ink">New to FoodShare?</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => go("vendor-register")} className="fs-btn-outline">
                Register a business
              </button>
              <button type="button" onClick={() => go("receiver-register")} className="fs-btn-outline">
                Register an NGO
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-fs-muted">
            Need access help?{" "}
            <a href="mailto:support@foodshare.org" className="fs-link">
              support@foodshare.org
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
