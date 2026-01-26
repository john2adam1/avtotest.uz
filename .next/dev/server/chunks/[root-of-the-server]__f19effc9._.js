module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/avtotest/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/avtotest/node_modules/@supabase/ssr/dist/module/index.js [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/avtotest/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/avtotest/node_modules/next/server.js [middleware] (ecmascript)");
;
;
async function proxy(request) {
    console.log("Middleware hitting path:", request.nextUrl.pathname);
    // Create response early
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: request.headers
        }
    });
    // Skip middleware for static files and API routes
    if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.includes('.') // Skip files with extensions
    ) {
        return response;
    }
    try {
        // Only create Supabase client if we have the required env vars
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://lgacbbewpuzeyxijzfii.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYWNiYmV3cHV6ZXl4aWp6ZmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NDE4MzcsImV4cCI6MjA4MjIxNzgzN30.P-CO-3mUHX0Pcrf1jgNcGqEXPiQEILnyGq9-340FLKc"), {
            cookies: {
                getAll () {
                    return request.cookies.getAll();
                },
                setAll (cookiesToSet) {
                    cookiesToSet.forEach(({ name, value })=>request.cookies.set(name, value));
                    response = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next({
                        request
                    });
                    cookiesToSet.forEach(({ name, value, options })=>response.cookies.set(name, value, options));
                }
            }
        });
        // Get user from Supabase Auth server for security
        const { data: { user } } = await supabase.auth.getUser();
        const pathname = request.nextUrl.pathname;
        // Public routes - no auth needed
        const publicRoutes = [
            '/',
            '/login',
            '/register'
        ];
        if (publicRoutes.includes(pathname)) {
            // Redirect authenticated users away from login/register
            // But allow them to stay on login if there's a session conflict/logout reason
            const hasSessionReason = request.nextUrl.searchParams.has('session') || request.nextUrl.searchParams.has('reason');
            if (user && (pathname === '/login' || pathname === '/register') && !hasSessionReason) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/dashboard", request.url));
            }
            return response;
        }
        // Protected routes - require authentication
        const protectedRoutes = [
            '/dashboard',
            '/admin',
            '/test',
            '/settings',
            '/tickets'
        ];
        const isProtectedRoute = protectedRoutes.some((route)=>pathname.startsWith(route));
        if (isProtectedRoute) {
            // Redirect to login if not authenticated
            if (!user) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", request.url));
            }
            // Single Device Login Check
            const deviceId = request.cookies.get("device_id")?.value;
            // We need to fetch the user's active_device_id from DB
            // We can use the existing session object but it doesn't have active_device_id usually unless we update the type or query again
            // To be safe and secure, we query the user table.
            const { data: userData } = await supabase.from("users").select("active_device_id").eq("id", user.id).single();
            if (userData?.active_device_id) {
                if (!deviceId || deviceId !== userData.active_device_id) {
                    // Session conflict or old session
                    // 1. Sign out from Supabase to clear server-side session
                    await supabase.auth.signOut();
                    // 2. Create redirect response
                    const redirectResponse = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$avtotest$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login?session=conflict", request.url));
                    // 3. Transfer any cookies set by signOut (from the 'response' object updated in setAll)
                    response.cookies.getAll().forEach((cookie)=>{
                        redirectResponse.cookies.set(cookie);
                    });
                    return redirectResponse;
                }
            }
            // Admin route protection - only check if accessing admin routes
            if (pathname.startsWith("/admin")) {
                // We'll check admin status in the page component instead
                // This avoids an extra database query in middleware
                response.headers.set('x-require-admin', 'true');
            }
        }
        return response;
    } catch (error) {
        console.error("Middleware error:", error);
        return response;
    }
}
const config = {
    matcher: [
        /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f19effc9._.js.map