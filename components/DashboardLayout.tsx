"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from "@/components/ui/card";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav>
          <ul>
            <li className="mb-2">
              <Link href="/" className={`block p-2 rounded ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                Trading Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/monitor" className={`block p-2 rounded ${isActive('/monitor') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                System Monitor
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/offlinemonitor" className={`block p-2 rounded ${isActive('/offlinemonitor') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                Offline System Monitor
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/chart" className={`block p-2 rounded ${isActive('/chart') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                Analysis Chart
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/plhistogram" className={`block p-2 rounded ${isActive('/plhistogram') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                P&L Histogram
              </Link>
             </li>
             <li className="mb-2">
              <Link href="/aimlmodel" className={`block p-2 rounded ${isActive('/aimlmodel') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                AIML Model Chart
              </Link>
             </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Card className="w-full h-full">
          {children}
        </Card>
      </main>
    </div>
  );
}