import { NextResponse, type NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET;

if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function verifyAndDecodeToken(token: string): Promise<{ userId: string; role: string } | null> {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const parsedHeader = JSON.parse(new TextDecoder().decode(base64UrlToBytes(header))) as { alg?: string };
  if (parsedHeader.alg !== "HS256") return null;

  const parsedPayload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { exp?: number; userId?: string; role?: string };
  if (parsedPayload.exp && parsedPayload.exp * 1000 < Date.now()) return null;

  if (!SECRET) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(`${header}.${payload}`)
  );

  if (!valid) return null;

  return {
    userId: parsedPayload.userId || "",
    role: parsedPayload.role || "volunteer",
  };
}

const roleRouteMap: Record<string, string[]> = {
  admin: ["/dashboard/admin", "/dashboard/financials", "/dashboard/donors", "/dashboard/campaigns", "/dashboard/impact"],
  volunteer: ["/dashboard/volunteer"],
  donor: ["/dashboard/donor"],
  ngo_partner: ["/dashboard/volunteer"],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("yssf-session")?.value;

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = await verifyAndDecodeToken(token);
      if (!decoded) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const userRole = decoded.role.toLowerCase();
      const path = request.nextUrl.pathname;

      // Allow access to base dashboard
      if (path === "/dashboard") {
        return NextResponse.next();
      }

      // Check role-based access
      const allowedPaths = roleRouteMap[userRole] || [];
      const isAllowed = allowedPaths.some((p) => path.startsWith(p));

      if (!isAllowed) {
        // Redirect to appropriate dashboard for their role
        const roleDashboard: Record<string, string> = {
          admin: "/dashboard/admin",
          volunteer: "/dashboard/volunteer",
          donor: "/dashboard/donor",
          ngo_partner: "/dashboard/volunteer",
        };
        return NextResponse.redirect(new URL(roleDashboard[userRole] || "/dashboard", request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
