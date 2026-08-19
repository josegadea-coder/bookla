"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === "sign_in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface border border-border rounded-card shadow-card p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-md bg-teal flex items-center justify-center text-white text-xs font-bold">
            B
          </span>
          <h1 className="font-semibold text-xl text-ink">Bookin</h1>
        </div>
        <p className="text-ink-soft text-sm mb-6">
          {mode === "sign_in" ? "Sign in to book lab equipment" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
              Institutional email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-control px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus-ring focus:border-teal"
              placeholder="you@institution.edu"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-control px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus-ring focus:border-teal"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-danger text-sm border border-danger/20 bg-danger-soft rounded-control px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal text-white text-sm font-medium rounded-control py-2.5 hover:bg-teal-hover transition-colors disabled:opacity-50 focus-ring"
          >
            {loading ? "Working…" : mode === "sign_in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
          className="mt-4 text-sm text-ink-soft hover:text-teal transition-colors focus-ring rounded"
        >
          {mode === "sign_in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
