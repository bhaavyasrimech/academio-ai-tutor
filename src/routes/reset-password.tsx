import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password · academio" },
      { name: "description", content: "Set a new password for your academio study account." },
      { property: "og:title", content: "Reset your password · academio" },
      { property: "og:description", content: "Securely update your academio password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});
function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  return (
    <main className="workspace">
      <h1>A fresh start.</h1>
      <form
        className="auth-form max-w-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.auth.updateUser({ password });
          setMessage(error ? error.message : "Your password has been updated.");
        }}
      >
        <label>
          New password
          <input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <Button type="submit">Update password</Button>
        <p role="status">{message}</p>
      </form>
    </main>
  );
}
