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
      <div className="w-full max-w-sm border border-line bg-paper p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="status-dot status-dot--available" aria-hidden />
          <h1 className="font-display font-700 text-xl">Bookin</h1>
        </div>
        <p className="text-ink-soft text-sm mb-6 font-mono">
          {mode === "sign_in" ? "Sign in to book equipment" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-mono text-ink-soft mb-1">
              Institutional email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
              placeholder="you@institution.edu"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-mono text-ink-soft mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line bg-white px-3 py-2 text-sm focus-ring"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-signal text-sm border border-signal/30 bg-signal/5 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-mono text-sm py-2.5 hover:bg-teal transition-colors disabled:opacity-50 focus-ring"
          >
            {loading ? "Working…" : mode === "sign_in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
          className="mt-4 text-xs font-mono text-ink-soft hover:text-ink underline focus-ring"
        >
          {mode === "sign_in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
