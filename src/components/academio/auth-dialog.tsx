import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useWorkspace } from "./workspace-context";
export function AuthDialog() {
  const { authOpen, setAuthOpen } = useWorkspace();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (!authOpen) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Sign in to academio">
        <Button
          variant="ghost"
          size="icon"
          className="close"
          aria-label="Close sign in"
          onClick={() => setAuthOpen(false)}
        >
          <X />
        </Button>
        <div className="brand mb-6">
          <BookOpen />
          academio
        </div>
        <h2>
          {mode === "signup"
            ? "A little more you."
            : mode === "reset"
              ? "Reset your password"
              : "Welcome to your study space."}
        </h2>
        <p className="subtle text-sm">Save your conversations and make your focus count.</p>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setNotice("");
            const result =
              mode === "reset"
                ? await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + "/reset-password",
                  })
                : mode === "signup"
                  ? await supabase.auth.signUp({
                      email,
                      password,
                      options: { emailRedirectTo: window.location.origin },
                    })
                  : await supabase.auth.signInWithPassword({ email, password });
            setBusy(false);
            if (result.error) setError(result.error.message);
            else if (mode === "signup") setNotice("Check your email to confirm your account.");
            else if (mode === "reset") setNotice("Check your email for a password reset link.");
            else setAuthOpen(false);
          }}
        >
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
            />
          </label>
          {mode !== "reset" && (
            <label>
              Password
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-sm text-primary" role="status">
              {notice}
            </p>
          )}
          <Button disabled={busy} type="submit">
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : mode === "reset"
                  ? "Send reset link"
                  : "Sign in"}
          </Button>
        </form>
        {mode !== "reset" && (
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={async () => {
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result.error) setError(result.error.message);
            }}
          >
            Continue with Google
          </Button>
        )}
        <div className="flex flex-col items-center mt-4">
          <Button
            variant="link"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError("");
              setNotice("");
            }}
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New to academio? Create an account"}
          </Button>
          {mode === "signin" && (
            <Button variant="ghost" size="sm" onClick={() => setMode("reset")}>
              Forgot password?
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
