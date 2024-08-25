'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type Order = {
  _id: string
  cart: any[]
  checkoutInfo: {
    name: string
    phone: string
    date: string
    time_slot:string
  }
  createdAt: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      try {
        const response = await fetch('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        const data = await response.json()

        if (data.success) {
          setOrders(data.orders)
        } else {
          throw new Error(data.error || 'Failed to fetch orders')
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Order ID: {order._id}</h3>
            <p className="mb-2">Order Date: {new Date(order.createdAt).toLocaleString()}</p>
            <p className="mb-2">Customer: {order.checkoutInfo.name}</p>
            <p className="mb-2">Date: {order.checkoutInfo.date}</p>
            <p className="mb-2">Time Slot: {order.checkoutInfo.time_slot}</p>
            <h4 className="text-lg font-semibold mb-2">Items:</h4>
            <ul className="list-disc list-inside">
              {order.cart.map((item, index) => (
                <li key={index}>
                  {item.name} - Quantity: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold">
              Total: ${order.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}