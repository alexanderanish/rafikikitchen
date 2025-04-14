'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {WhatsAppDialog} from "@/components/WhatsappDialog";
import { AvailabilityIndicator } from '@/components/AvailabilityIndicator'

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
  size: string
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
  const [selectedDate, setSelectedDate] = useState<string>()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshingDates, setIsRefreshingDates] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const fetchAvailableDates = useCallback(async () => {
    try {
      setIsRefreshingDates(true)
      // Use a timestamp to bust the cache and force a fresh request
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/live-orders/available-dates?t=${timestamp}`, {
        cache: "no-store", 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch available dates')
      const data = await response.json()
      setAvailableDates(data.dates)
      if (data.dates.length > 0) {
        // Always select the most recent date (last in the array)
        const latestDate = data.dates[data.dates.length - 1]
        setSelectedDate(latestDate)
      }
    } catch (err) {
      console.error('Failed to fetch available dates:', err)
      toast({
        title: "Error",
        description: "Failed to fetch available dates",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingDates(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!selectedDate || !availableDates.includes(selectedDate)) {
      return; // Do nothing if selectedDate is not available
    }
    setIsLoading(true)
    setError(null)
    try {
      // Use a timestamp to bust the cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/live-orders?date=${selectedDate}&t=${timestamp}`, {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data.orders)
    } catch (err) {
      setError('An error occurred while fetching the orders')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, availableDates])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchAvailableDates()
    
    // Set up auto-refresh for available dates
    const datesRefreshInterval = setInterval(() => {
      fetchAvailableDates()
    }, 5 * 60 * 1000) // Refresh available dates every 5 minutes

    return () => clearInterval(datesRefreshInterval)
  }, [router, fetchAvailableDates])

  useEffect(() => {
    fetchOrders()
    
    // Set up auto-refresh for orders
    const ordersRefreshInterval = setInterval(() => {
      fetchOrders()
    }, 60 * 1000) // Refresh orders every minute
    
    return () => clearInterval(ordersRefreshInterval)
  }, [selectedDate, selectedTimeSlot, fetchOrders])

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
    const summary: {
      [key: string]: { half: number; full: number; totalIncome: number };
    } = {};
    let totalHalves = 0;
    let totalFulls = 0;
  
    if (!orders || !Array.isArray(orders)) {
      return { sandwichDetails: [], totalIncome: 0, totalHalves: 0, totalFulls: 0 };
    }
  
    // Filter orders by selected time slot
    const filteredOrders =
      selectedTimeSlot === "all"
        ? orders
        : orders.filter(
            (order) => order.checkoutInfo.time_slot === selectedTimeSlot
          );
  
    filteredOrders.forEach((order) => {
      if (order.status !== "done") {
        order.cart.forEach((item) => {
          const isHalf = item.size.toLowerCase() === "half";
          const isFull = item.size.toLowerCase() === "full";
  
          if (!summary[item.name]) {
            summary[item.name] = { half: 0, full: 0, totalIncome: 0 };
          }
  
          if (isHalf) {
            summary[item.name].half += item.quantity;
            totalHalves += item.quantity;
          } else if (isFull) {
            summary[item.name].full += item.quantity;
            totalFulls += item.quantity;
          }
  
          summary[item.name].totalIncome += item.price * item.quantity;
        });
      }
    });
  
    return {
      sandwichDetails: Object.entries(summary).sort(
        ([, a], [, b]) => b.totalIncome - a.totalIncome
      ),
      totalIncome: Object.values(summary).reduce(
        (total, item) => total + item.totalIncome,
        0
      ),
      totalHalves,
      totalFulls,
    };
  };
  
  
  

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
        {/* <ul className="text-sm">
          {order.cart.map((item, index) => (
            <li key={index}>{item.quantity}x {item.name} {item.size}</li>
          ))}
        </ul> */}
        <div className="text-sm">
          <ul>
            {order.cart.map((item, index) => (
              <li key={index}>
                <span>
                  {item.quantity}x {item.name} ({item.size}) - ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="font-bold mt-2">
            Total: ₹{order.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
          </div>
        </div>
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
        <div className="flex justify-between items-center mt-4">
          <WhatsAppDialog
            orderName={order.checkoutInfo.name}
            orderNumber={order.checkoutInfo.phone}
            orderCart={order.cart}
            timeSlot={order.checkoutInfo.time_slot}
            date={order.checkoutInfo.date}
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-10">
      {/* <h1 className="text-3xl font-bold mb-6">Live Order Management</h1> */}
      <div className="mb-6 flex items-center space-x-4">
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue>{selectedDate || "Select an order date"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableDates.map((date) => (
              <SelectItem key={date} value={date}>
                {format(parse(date, 'dd-MM-yyyy', new Date()), 'dd MMM yyyy') || date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={() => fetchAvailableDates()} 
          variant="outline"
          disabled={isRefreshingDates}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshingDates ? 'animate-spin' : ''}`} />
          Refresh Dates
        </Button>

        {selectedDate && (
          <AvailabilityIndicator date={selectedDate} />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           
              <CardTitle>Orders</CardTitle>
              <Button 
                className="mb-4" 
                onClick={() => fetchOrders()} 
                variant="outline" 
                disabled={isLoading}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
              {sandwichSummary.sandwichDetails.length === 0 ? (
                <p>No sandwiches to prepare at the moment.</p>
              ) : (
                <ul>
                  {sandwichSummary.sandwichDetails.map(([name, details]) => (
                    <li
                      key={name}
                      className="flex flex-col py-2 border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{name}</span>
                        <div className="flex justify-between space-x-2">
                          <Badge variant="secondary" className='justify-between space-x-2'>
                            <span>
                              H: {details.half}
                            </span>
                          </Badge>
                          <Badge variant="secondary" className='justify-between space-x-2'>
                            <span>
                              F: {details.full}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end items-center font-bold mt-4 space-x-3">
                <span>Halves: {sandwichSummary.totalHalves}</span>
                <span>Fulls: {sandwichSummary.totalFulls}</span>
              </div>
              <div className="font-bold mt-4 text-right">
                Total: ₹{sandwichSummary.totalIncome.toFixed(2)}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}