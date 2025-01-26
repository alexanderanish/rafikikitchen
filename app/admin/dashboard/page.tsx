'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Edit } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Order = {
  _id: string
  orderId: string
  cart: any[]
  checkoutInfo: {
    name: string
    phone: string
    time_slot: string
    date: string
  }
  createdAt: string
  status: string
  paymentStatus: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchOrders()
  }, [])

  const handleExportCsv = () => {
    const token = localStorage.getItem('adminToken');

    fetch('/api/admin/orders/export', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to download CSV');
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to export orders. Please try again.');
      });
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        throw new Error(data.error || 'Failed to fetch orders')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrderId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setOrders((prev) => prev.filter((order) => order._id !== selectedOrderId))
        toast({
          title: "Success",
          description: "Order deleted successfully",
        })
      } else {
        throw new Error(data.error || 'Failed to delete order')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSelectedOrderId(null)
    }
  }

  const handleEditOrder = (orderId: string) => {
    router.push(`/admin/orders/edit/${orderId}`)
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push('/admin/login')}>Logout</Button>
      </div>
      <div className="mb-6">
        <Button onClick={handleExportCsv}>Export Orders</Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-md rounded-lg p-6 relative">
            <h3 className="text-xl font-semibold mb-2">Order ID: {order.orderId}</h3>
            <p className="mb-2">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            <p className="mb-2">Date: {(() => {
              const [day, month, year] = order.checkoutInfo.date.split('-')
              const date = new Date(`${year}-${month}-${day}`)
              return date.toDateString()
            })()}</p>
            <p className="mb-2">Customer: {order.checkoutInfo.name}</p>
            <p className="mb-2">Phone: {order.checkoutInfo.phone}</p>
            <p className="mb-4">Time Slot: {order.checkoutInfo.time_slot}</p>
            <h4 className="text-lg font-semibold mb-2">Items:</h4>
            <ul className="list-disc list-inside mb-4">
              {order.cart.map((item, index) => (
                <li key={index}>
                  {item.name} - Quantity: {item.quantity} - Rs. {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="font-semibold mb-4">
              Total: Rs. {order.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </p>

            {/* Trash Icon with Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  onClick={() => setSelectedOrderId(order._id)}
                  className="absolute bottom-4 right-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={24} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this order? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteOrder}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Edit Icon
            <button
              onClick={() => handleEditOrder(order._id)}
              className="absolute bottom-4 right-16 text-blue-500 hover:text-blue-700"
            >
              <Edit size={24} />
            </button> */}
          </div>
        ))}
      </div>
    </div>
  )
}
