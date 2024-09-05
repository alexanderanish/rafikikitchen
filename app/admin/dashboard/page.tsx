'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import OrderSummaryDashboard from '@/components/OrderSummaryDashboard'

type Order = {
  _id: string
  orderId: string
  cart: any[]
  checkoutInfo: {
    name: string
    phone: string
    time_slot: string
    date:string
  }
  createdAt: string
  status: string
  paymentStatus: string
  notes: { text: string, addedBy: string, addedAt: string }[]
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

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
    } catch (error:any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ))
        toast({
          title: "Success",
          description: "Order status updated successfully",
        })
      } else {
        throw new Error(data.error || 'Failed to update order status')
      }
    } catch (error:any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        ))
        toast({
          title: "Success",
          description: "Payment status updated successfully",
        })
      } else {
        throw new Error(data.error || 'Failed to update payment status')
      }
    } catch (error:any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddNote = async (orderId: string) => {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ text: newNote }),
      })

      const data = await response.json()

      if (data.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, notes: [...order.notes, data.note] } : order
        ))
        setNewNote('')
        toast({
          title: "Success",
          description: "Note added successfully",
        })
      } else {
        throw new Error(data.error || 'Failed to add note')
      }
    } catch (error:any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

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
        <div>
          <Button onClick={() => router.push('/admin/users')} className="mr-2">Manage Users</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      {/* <OrderSummaryDashboard /> */}
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Order ID: {order.orderId}</h3>
            <p className="mb-2">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            <p className="mb-2">Date: {(() => {
        const [day, month, year] = order.checkoutInfo.date.split('-');
        const date = new Date(`${year}-${month}-${day}`);
        return date.toDateString();
      })()}</p>
            <p className="mb-2">Customer: {order.checkoutInfo.name}</p>
            <p className="mb-2">Phone: {order.checkoutInfo.phone}</p>
            <p className="mb-4">Time Slot: {order.checkoutInfo.time_slot}</p>
            {/* <div className="mb-4">
              <label htmlFor={`status-${order._id}`} className="block text-sm font-medium text-gray-700">Status</label>
              <Select onValueChange={(value) => handleStatusChange(order._id, value)} defaultValue={order.status}>
                <SelectTrigger id={`status-${order._id}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            {/* <div className="mb-4">
              <label htmlFor={`payment-${order._id}`} className="block text-sm font-medium text-gray-700">Payment Status</label>
              <Select onValueChange={(value) => handlePaymentStatusChange(order._id, value)} defaultValue={order.paymentStatus}>
                <SelectTrigger id={`payment-${order._id}`}>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <h4 className="text-lg font-semibold mb-2">Items:</h4>
            <ul className="list-disc list-inside mb-4">
              {order.cart.map((item, index) => (
                <li key={index}>
                  {item.name} - Quantity: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="font-semibold mb-4">
              Total: ${order.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </p>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Notes:</h4>
              {/* {order.notes.map((note, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded mb-2">
                  <p>{note.text}</p>
                  <p className="text-sm text-gray-500">Added by {note.addedBy} on {new Date(note.addedAt).toLocaleString()}</p>
                </div>
              ))} */}
              <div className="flex mt-2">
                <Input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note"
                  className="mr-2"
                />
                <Button onClick={() => handleAddNote(order._id)}>Add Note</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}