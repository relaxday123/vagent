import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Check if user has admin role
    const { data: roles } = await supabase.rpc("get_user_roles", {
      user_uuid: session.user.id,
    })

    const hasAdminRole = roles?.some((r) => r.role === "admin")

    if (!hasAdminRole) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  // Protect authenticated routes
  if ((req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/credit-score")) && !session) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname.startsWith("/auth/") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/:path*", "/credit-score"],
}
