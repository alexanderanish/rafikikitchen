'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { format, parse } from 'date-fns'

type Order = {
  id: string
  sandwichId: string
  sandwichName: string
  quantity: number
  timeSlot: string
}

type SandwichSummary = {
  id: string
  name: string
  totalQuantity: number
  quantityBySlot: {
    [key: string]: number
  }
}

export default function OrderSummaryDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const formattedDate = format(selectedDate, 'dd-MM-yyyy')
        const response = await fetch(`/api/order-summary?date=${formattedDate}`)
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data.orders)
      } catch (err) {
        setError('An error occurred while fetching the orders')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [selectedDate])

  const getSandwichSummary = (orders: Order[], timeSlot: string): SandwichSummary[] => {
    const summary: { [key: string]: SandwichSummary } = {}

    orders.forEach(order => {
      if (!summary[order.sandwichId]) {
        summary[order.sandwichId] = {
          id: order.sandwichId,
          name: order.sandwichName,
          totalQuantity: 0,
          quantityBySlot: {}
        }
      }

      if (timeSlot === 'all' || order.timeSlot === timeSlot) {
        summary[order.sandwichId].totalQuantity += order.quantity
      }

      if (!summary[order.sandwichId].quantityBySlot[order.timeSlot]) {
        summary[order.sandwichId].quantityBySlot[order.timeSlot] = 0
      }
      summary[order.sandwichId].quantityBySlot[order.timeSlot] += order.quantity
    })

    return Object.values(summary)
  }

  const sandwichSummary = getSandwichSummary(orders, selectedTimeSlot)
  const timeSlots = Array.from(new Set(orders.map(order => order.timeSlot))).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary Dashboard</CardTitle>
        <CardDescription>Overview of sandwich orders by time slot</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <DatePicker
            date={selectedDate}
            onDateChange={(date) => {
              if (date) {
                setSelectedDate(date)
              }
            }}
          />
          <Select onValueChange={setSelectedTimeSlot} defaultValue={selectedTimeSlot}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time Slots</SelectItem>
              {timeSlots.map(slot => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sandwich</TableHead>
                <TableHead className="text-right">Total Quantity</TableHead>
                {timeSlots.map(slot => (
                  <TableHead key={slot} className="text-right">{slot}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sandwichSummary.map(sandwich => (
                <TableRow key={sandwich.id}>
                  <TableCell className="font-medium">{sandwich.name}</TableCell>
                  <TableCell className="text-right">{sandwich.totalQuantity}</TableCell>
                  {timeSlots.map(slot => (
                    <TableCell key={slot} className="text-right">
                      {sandwich.quantityBySlot[slot] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}