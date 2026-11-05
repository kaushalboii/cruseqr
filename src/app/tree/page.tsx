"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const MagicTreeCanvas = dynamic(() => import("@/components/tree/MagicTreeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f6f1e7] text-stone-700">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide">Growing 3D Magic Tree...</p>
      </div>
    </div>
  ),
});

export default function MagicTreePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#f6f1e7] text-stone-700">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold tracking-wide">Growing 3D Magic Tree...</p>
          </div>
        </div>
      }
    >
      <MagicTreeCanvas />
    </Suspense>
  );
}
