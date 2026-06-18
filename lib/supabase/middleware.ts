import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");
  const isAdminRoute = path.startsWith("/admin");
  const isShopRoute =
    path.startsWith("/catalog") ||
    path.startsWith("/preorders") ||
    path.startsWith("/messages") ||
    path.startsWith("/pending");

  // Not logged in -> redirect protected routes to login
  if (!user && (isAdminRoute || isShopRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in -> resolve role/approval and gate access
  if (user && (isAdminRoute || isShopRoute || isAuthRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, approved")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";
    const approved = profile?.approved ?? false;

    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : approved ? "/catalog" : "/pending";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = approved ? "/catalog" : "/pending";
      return NextResponse.redirect(url);
    }

    if (isShopRoute && role !== "admin" && !approved && path !== "/pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
