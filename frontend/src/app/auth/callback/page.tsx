"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth_failed");
        return;
      }

      if (session?.access_token) {
        // Register/login the user in our backend with the Supabase token
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/google-supabase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              supabaseToken: session.access_token,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0],
              avatarUrl: session.user.user_metadata?.avatar_url,
            }),
          });

          const data = await res.json();

          if (data.success && data.token) {
            // Store our JWT token
            document.cookie = `yssf-session=${encodeURIComponent(data.token)}; path=/; max-age=${60 * 60 * 2}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
            router.push("/dashboard");
            return;
          }
        } catch (err) {
          console.error("Backend auth error:", err);
        }
      }

      router.push("/login?error=no_session");
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-900 mx-auto" />
        <p className="font-heading font-semibold text-primary-900">Completing sign in...</p>
      </div>
    </div>
  );
}
