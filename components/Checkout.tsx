'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMenuStore } from '@/app/store/menuStore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import OrderSummary from './OrderSummary'
import { PhoneInput } from './PhoneInput'
import { EmailInput } from './EmailInput';

export default function Checkout() {
  const router = useRouter()
  const { cart, checkoutInfo, setCheckoutInfo, placeOrder } = useMenuStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeSlots, setTimeSlots] = useState<{value: string, label: string}[]>([])
  const [mounted, setMounted] = useState(false)
  
  // Predefined date range - static to avoid hydration mismatch
  const availableDates = [
    { value: "10-04-2025", label: "Thursday, 10th April, 2025" },
    { value: "11-04-2025", label: "Friday, 11th April, 2025" },
    { value: "12-04-2025", label: "Saturday, 12th April, 2025" },
    { value: "13-04-2025", label: "Sunday, 13th April, 2025" },
    { value: "14-04-2025", label: "Monday, 14th April, 2025" },
    { value: "15-04-2025", label: "Tuesday, 15th April, 2025" },
    { value: "16-04-2025", label: "Wednesday, 16th April, 2025" },
    { value: "17-04-2025", label: "Thursday, 17th April, 2025" }
  ];
  
  // Prevent hydration mismatch by only rendering client-side
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update time slots based on selected date
  useEffect(() => {
    if (checkoutInfo.date) {
      const date = new Date(checkoutInfo.date.split('-').reverse().join('-'));
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Weekend slots (Saturday and Sunday)
      if (day === 0 || day === 6) {
        setTimeSlots([
          { value: '12:00', label: '12:00 PM' },
          { value: '13:00', label: '01:00 PM' },
          { value: '14:00', label: '02:00 PM' }
        ]);
      } 
      // Weekday slots (Monday to Friday)
      else {
        setTimeSlots([
          { value: '19:00', label: '07:00 PM' },
          { value: '20:00', label: '08:00 PM' }
        ]);
      }
    }
  }, [checkoutInfo.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await placeOrder()
      if (result.success) {
        router.push(`/confirmation?orderId=${result.orderId}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error:any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while placing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle empty cart
  if (!mounted) {
    return null; // Return nothing on server-side render to prevent hydration mismatch
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="mb-4">Add some items to your cart before proceeding to checkout.</p>
        <Button onClick={() => router.push('/')}>Go to Menu</Button>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={checkoutInfo.name || ''}
              onChange={(e) => setCheckoutInfo({ ...checkoutInfo, name: e.target.value })}
              required
            />
          </div>
          <PhoneInput
            value={checkoutInfo.phone || ''}
            onChange={(value) => setCheckoutInfo({ ...checkoutInfo, phone: value })}
          />
          <EmailInput
            value={checkoutInfo.email || ''}
            onChange={(value) => setCheckoutInfo({ ...checkoutInfo, email: value })}
          />
          <div className="mb-4">
            <Label htmlFor="date">Date</Label>
            <Select 
              required 
              onValueChange={(value) => setCheckoutInfo({...checkoutInfo, date: value, time_slot: ''})}
              value={checkoutInfo.date}
            >  
              <SelectTrigger
                id="date"
                className="items-start"
              >
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    <div className="flex items-start gap-3">
                      <div className="grid gap-0.5">
                        <p>{date.label}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Label htmlFor="time_slot">Time Slot</Label>
            <Select
              required 
              disabled={!checkoutInfo.date}
              onValueChange={(value) => setCheckoutInfo({ ...checkoutInfo, time_slot: value })}
              value={checkoutInfo.time_slot}
            >  
              <SelectTrigger
                id="time_slot"
                className="items-start"
              >
                <SelectValue placeholder={!checkoutInfo.date ? "Select a date first" : "Select a time slot"} />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(slot => (
                  <SelectItem key={slot.value} value={slot.value}>
                    <div className="flex items-start gap-3">
                      <div className="grid gap-0.5">
                        <p>{slot.label}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </Button>
        </form>
        <div className="mt-4 p-4 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Customers will need to book a delivery service to pick up their order at the selected slot. (e.g. Dunzo, Swiggy Genie, Porter, etc)
          </p>
        </div>
      </div>
      <div>
        <OrderSummary />
      </div>
    </div>
  )
}