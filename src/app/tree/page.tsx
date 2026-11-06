"use client";

import React, { useEffect, useState } from "react";

export default function MagicTreePage() {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSearch(window.location.search);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0d14] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">Growing 3D Magic Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden bg-[#0a0d14] m-0 p-0 border-0">
      <iframe
        src={`/tree-engine/index.html${search}`}
        className="w-full h-full border-0 block"
        title="CruseQR Magic Tree"
        allow="web-share; accelerometer; gyroscope"
      />
    </main>
  );
}
