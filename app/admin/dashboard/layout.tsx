import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-32 bg-white shadow-md">
        <nav className="mt-5">
          <Link href="/admin/dashboard" className="block py-2 px-4 text-sm hover:bg-gray-200">
            Overview
          </Link>
          <Link href="/admin/dashboard/live-orders" className="block py-2 px-4 text-sm hover:bg-gray-200">
            Live Orders
          </Link>
          {/* Add more dashboard links as needed */}
        </nav>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        {children}
      </main>
    </div>
  )
}