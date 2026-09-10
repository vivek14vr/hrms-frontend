module.exports = [
"[project]/frontend/app/(app)/admin/layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.4_@babel+core@7.29.7_@playwright+test@1.63.0_@types+node@24.13.4_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.4_@babel+core@7.29.7_@playwright+test@1.63.0_@types+node@24.13.4_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.4_@babel+core@7.29.7_@playwright+test@1.63.0_@types+node@24.13.4_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$queries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/queries.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function AdminLayout({ children }) {
    const { data, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$queries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoading && data && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$queries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["roleCanManage"])(data.user.role)) router.replace('/dashboard');
    }, [
        data,
        isLoading,
        router
    ]);
    if (isLoading || !data || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$queries$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["roleCanManage"])(data.user.role)) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto max-w-md p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$4_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$24$2e$13$2e$4_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoadingSkeleton"], {
            rows: 4
        }, void 0, false, {
            fileName: "[project]/frontend/app/(app)/admin/layout.tsx",
            lineNumber: 6,
            columnNumber: 394
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/app/(app)/admin/layout.tsx",
        lineNumber: 6,
        columnNumber: 356
    }, this);
    return children;
}
}),
];

//# sourceMappingURL=frontend_app_%28app%29_admin_layout_tsx_11xmjxf._.js.map