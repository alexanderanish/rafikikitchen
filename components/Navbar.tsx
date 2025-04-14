"use client"

import Link from "next/link"
import { useRouter } from "next/router"

export default function Navbar() {
  const router = useRouter()

  const isActive = (path: string) => {
    return router.pathname === path ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
  }

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-white font-bold text-xl cursor-pointer">Rafiki Kitchen</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/cashier">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/cashier")} cursor-pointer`}>
                    Cashier
                  </span>
                </Link>
                <Link href="/orders">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/orders")} cursor-pointer`}>
                    Orders
                  </span>
                </Link>
                <Link href="/kitchen">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/kitchen")} cursor-pointer`}>
                    Kitchen
                  </span>
                </Link>
                <Link href="/inventory">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/inventory")} cursor-pointer`}>
                    Inventory
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/cashier">
            <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/cashier")} cursor-pointer`}>
              Cashier
            </span>
          </Link>
          <Link href="/orders">
            <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/orders")} cursor-pointer`}>
              Orders
            </span>
          </Link>
          <Link href="/kitchen">
            <span className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/kitchen")} cursor-pointer`}>
              Kitchen
            </span>
          </Link>
          <Link href="/inventory">
            <span
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/inventory")} cursor-pointer`}
            >
              Inventory
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

