"use client"; // <-- Add this at the top

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r">
        <div className="flex flex-col flex-1">
          <div className="flex items-center h-24 flex-shrink-0 px-4">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto" />
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              <Link href="/admin/dashboard" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
                Overview
              </Link>
              <Link href="/admin/dashboard/live-orders" className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
                Live Orders
              </Link>
            </nav>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between h-24 px-4">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto" />
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-3/4 max-w-sm rounded-lg shadow-lg p-6">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
              <X size={24} />
            </button>
            <nav className="space-y-4">
              <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="block py-3 text-lg font-medium hover:bg-gray-200">
                Overview
              </Link>
              <Link href="/admin/dashboard/live-orders" onClick={() => setIsOpen(false)} className="block py-3 text-lg font-medium hover:bg-gray-200">
                Live Orders
              </Link>
              <Button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="min-h-screen bg-gray-100">
          {/* Add padding for mobile header */}
          <div className="px-4 py-4 mt-24 md:mt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
