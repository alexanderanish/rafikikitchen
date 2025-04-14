"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { DataTable } from "./data-table"
import { columns, Order } from "./columns"
import { OrderDetailsModal } from "./order-details-modal"

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      } else {
        throw new Error(data.error || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }
    fetchOrders()

    // Add event listener for showing order details
    const handleShowOrderDetails = (event: CustomEvent) => {
      setSelectedOrder(event.detail)
    }

    window.addEventListener('showOrderDetails', handleShowOrderDetails as EventListener)

    return () => {
      window.removeEventListener('showOrderDetails', handleShowOrderDetails as EventListener)
    }
  }, [router, fetchOrders])

  const handleExportCsv = async () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    try {
      const response = await fetch("/api/admin/orders/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download CSV")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      const now = new Date()
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`
      const filename = `rafiki_kitchen_order_${formattedDate}.csv`
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error("Error exporting orders:", error)
      toast({
        title: "Error",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button onClick={handleExportCsv}>Export CSV</Button>
      </div>
      <div className="mt-8">
        <DataTable columns={columns} data={orders} />
      </div>
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSave={handleOrderUpdate}
      />
    </div>
  )
}
