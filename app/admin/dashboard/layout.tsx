"use client"; // <-- Add this at the top

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:block w-48 bg-white shadow-md">
        <nav className="mt-5">
          <Link href="/admin/dashboard" className="block py-2 px-4 text-sm hover:bg-gray-200">
            Overview
          </Link>
          <Link href="/admin/dashboard/live-orders" className="block py-2 px-4 text-sm hover:bg-gray-200">
            Live Orders
          </Link>
        </nav>
      </aside>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md bg-white shadow">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white w-3/4 max-w-sm rounded-lg shadow-lg">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
              <X size={24} />
            </button>
            <nav className="mt-10 space-y-4 text-center">
              <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="block py-3 text-lg font-medium hover:bg-gray-200">
                Overview
              </Link>
              <Link href="/admin/dashboard/live-orders" onClick={() => setIsOpen(false)} className="block py-3 text-lg font-medium hover:bg-gray-200">
                Live Orders
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
        {children}
      </main>
    </div>
  );
}
