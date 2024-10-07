'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMenuStore } from '@/app/store/menuStore'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import OrderSummary from './OrderSummary'
import { useEffect } from 'react'
import { PhoneInput } from './PhoneInput'

export default function Checkout() {
  const router = useRouter()
  const { cart, checkoutInfo, setCheckoutInfo, placeOrder } = useMenuStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // useEffect(() => {
  //   setCheckoutInfo({ date: '08-09-2024' })
  //   //eslint-disable-next-line react-hooks/exhaustive-deps
  // },[])

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
              value={checkoutInfo.name}
              onChange={(e) => setCheckoutInfo({ name: e.target.value })}
              required
            />
          </div>
          {/* <div className="mb-4">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={checkoutInfo.phone}
              onChange={(e) => setCheckoutInfo({ phone: e.target.value })}
              required
            />
            
          </div> */}
          <PhoneInput
            value={checkoutInfo.phone}
            onChange={(value) => setCheckoutInfo({ ...checkoutInfo, phone: value })}
          />
          <div className="mb-4">
            <Label htmlFor="date">Date</Label>
            <Select required onValueChange={(value)=> setCheckoutInfo({...checkoutInfo, date:value})}>  
              <SelectTrigger
                id="date"
                className="items-start"
              >
                <SelectValue placeholder="Select a date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="22-09-2024">
                  <div className="flex items-start gap-3">
                    <div className="grid gap-0.5">
                      <p>
                      Sunday, 22nd September, 2024
                      </p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Label htmlFor="time_slot">Time Slot</Label>
            <Select required onValueChange={(value) => setCheckoutInfo({ time_slot: value })}>  
              <SelectTrigger
                id="time_slot"
                className="items-start"
              >
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12:00">
                  <div className="flex items-start gap-3">
                    <div className="grid gap-0.5">
                      <p>
                      12:00 PM
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="13:00">
                  <div className="flex items-start gap-3">
                    <div className="grid gap-0.5">
                      <p>
                      01:00 PM
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="14:00">
                  <div className="flex items-start gap-3">
                    <div className="grid gap-0.5">
                      <p>
                      02:00 PM
                      </p>
                    </div>
                  </div>
                </SelectItem>
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
