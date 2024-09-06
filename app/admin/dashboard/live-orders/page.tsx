'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, RefreshCcw, History } from 'lucide-react'
import { format, parse } from 'date-fns'
import { toast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Sandwich = {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  vegetarian: boolean
  allergens: string[]
  ingredients: string[]
  quantity: number
}

type CheckoutInfo = {
  name: string
  phone: string
  date: string
  time_slot: string
}

type Order = {
  _id: string
  cart: Sandwich[]
  checkoutInfo: CheckoutInfo
  createdAt: string
  status: 'todo' | 'in-progress' | 'done'
  actions: { status: string; timestamp: string }[]
}


export default function LiveOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'))
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const fetchAvailableDates = async () => {
    try {
      const response = await fetch('/api/live-orders/available-dates')
      if (!response.ok) throw new Error('Failed to fetch available dates')
      const data = await response.json()
      setAvailableDates(data.dates)
    } catch (err) {
      console.error('Failed to fetch available dates:', err)
      toast({
        title: "Error",
        description: "Failed to fetch available dates",
        variant: "destructive",
      })
    }
  }

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/live-orders?date=${selectedDate}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data.orders)
    } catch (err) {
      setError('An error occurred while fetching the orders')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchAvailableDates()
  }, [])


  useEffect(() => {
    fetchOrders()
    // In a real application, you would set up a websocket or polling mechanism here
    // const intervalId = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    // return () => clearInterval(intervalId)

  }, [selectedDate, selectedTimeSlot])

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch('/api/live-orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      })
      if (!response.ok) throw new Error('Failed to update order status')
      await fetchOrders() // Refresh orders after update
      toast({
        title: "Order Updated",
        description: `Order #${orderId} status changed to ${newStatus}`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getSandwichSummary = () => {
    const summary: { [key: string]: number } = {}
    if (!orders || !Array.isArray(orders)) return []
  
    // Filter orders by selected time slot
    const filteredOrders = selectedTimeSlot === 'all'
      ? orders
      : orders.filter(order => order.checkoutInfo.time_slot === selectedTimeSlot)
  
    filteredOrders.forEach(order => {
      if (order.status !== 'done') {
        order.cart.forEach(item => {
          summary[item.name] = (summary[item.name] || 0) + item.quantity
        })
      }
    })
  
    return Object.entries(summary).sort((a, b) => b[1] - a[1])
  }
  

  const sandwichSummary = getSandwichSummary()

  const OrderHistory = ({ orderId }: { orderId: string }) => {
    const [history, setHistory] = useState<{ status: string; timestamp: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      const fetchHistory = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/live-orders/${orderId}/history`)
          if (!response.ok) throw new Error('Failed to fetch order history')
          const data = await response.json()
          setHistory(data.actionHistory)
        } catch (err) {
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchHistory()
    }, [orderId])

    if (isLoading) return <p>Loading history...</p>

    return (
      <ul className="space-y-2">
        {history.map((action, index) => (
          <li key={index} className="text-sm">
            {format(new Date(action.timestamp), 'HH:mm:ss')} - {action.status}
          </li>
        ))}
      </ul>
    )
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Order Name- {order.checkoutInfo.name}
        </CardTitle>
        <Badge variant={order.status === 'todo' ? 'default' : order.status === 'in-progress' ? 'destructive' : 'outline'}>
          {order.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2">Time Slot: {order.checkoutInfo.time_slot}</div>
        <ul className="text-sm">
          {order.cart.map((item, index) => (
            <li key={index}>{item.quantity}x {item.name}</li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-4">
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Order History</DialogTitle>
                <DialogDescription>Order #{order.id}</DialogDescription>
              </DialogHeader>
              <OrderHistory orderId={order.id} />
            </DialogContent>
          </Dialog> */}
          <div></div>
          <div className="flex space-x-2">
            {order.status !== 'todo' && (
              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order._id, 'todo')}>
                <Clock className="mr-2 h-4 w-4" />
                Move to Todo
              </Button>
            )}
            {order.status !== 'in-progress' && (
              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order._id, 'in-progress')}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Start Preparing
              </Button>
            )}
            {order.status !== 'done' && (
              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order._id, 'done')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Done
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Live Order Management</h1>
      <div className="mb-6 flex items-center space-x-4">
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            {availableDates.map((date) => (
              <SelectItem key={date} value={date}>
                {format(parse(date, 'dd-MM-yyyy', new Date()), 'dd MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
       
        

      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           
              <CardTitle>Orders</CardTitle>
              <Button 
                className="mb-4" 
                onClick={() => fetchOrders()} 
                variant="outline" 
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Orders
              </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setSelectedTimeSlot('all')}>All</TabsTrigger>
                <TabsTrigger value="12:00" onClick={() => setSelectedTimeSlot('12:00')}>12:00</TabsTrigger>
                <TabsTrigger value="13:00" onClick={() => setSelectedTimeSlot('13:00')}>13:00</TabsTrigger>
                <TabsTrigger value="14:00" onClick={() => setSelectedTimeSlot('14:00')}>14:00</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <p>Loading orders...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : orders.length === 0 ? (
                    <p>No orders found for this date and time slot.</p>
                  ) : (
                    orders.map(order => (
                      <OrderCard key={order._id} order={order} />
                    ))
                  )}
                </ScrollArea>
              </TabsContent>
              {['12:00', '13:00', '14:00'].map(slot => (
                <TabsContent key={slot} value={slot}>
                  <ScrollArea className="h-[600px]">
                    {isLoading ? (
                      <p>Loading orders...</p>
                    ) : error ? (
                      <p className="text-red-500">{error}</p>
                    ) : orders.filter(order => order.checkoutInfo.time_slot === slot).length === 0 ? (
                      <p>No orders found for this date and time slot.</p>
                    ) : (
                      orders.filter(order => order.checkoutInfo.time_slot === slot).map(order => (
                        <OrderCard key={order._id} order={order} />
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sandwich Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {sandwichSummary.length === 0 ? (
                <p>No sandwiches to prepare at the moment.</p>
              ) : (
                <ul>
                  {sandwichSummary.map(([name, quantity]) => (
                    <li key={name} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span>{name}</span>
                      <Badge variant="secondary">{quantity}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}