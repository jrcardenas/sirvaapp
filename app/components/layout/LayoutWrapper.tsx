"use client";

import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-6 py-4 min-h-screen flex flex-col">
      <Header />
      {children}
    </div>
  );
}
