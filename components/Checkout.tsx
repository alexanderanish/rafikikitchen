'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMenuStore } from '@/app/store/menuStore'
import dynamic from 'next/dynamic'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { PhoneInput } from './PhoneInput'
import { EmailInput } from './EmailInput'
import { AvailabilityIndicator } from './AvailabilityIndicator'

// Import Button with ssr disabled to avoid hydration mismatch
const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button), { ssr: false })

// Import OrderSummary with client-only rendering to entirely avoid hydration issues
const DynamicOrderSummary = dynamic(() => import('./OrderSummary'), { ssr: false })

export default function Checkout() {
  const router = useRouter()
  const { cart, checkoutInfo, setCheckoutInfo, placeOrder } = useMenuStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeSlots, setTimeSlots] = useState<{value: string, label: string}[]>([])
  const [mounted, setMounted] = useState(false)
  
  // Predefined date range - static to avoid hydration mismatch
  const allPossibleDates = [
    { value: "10-04-2025", label: "Thursday, 10th April, 2025" },
    { value: "11-04-2025", label: "Friday, 11th April, 2025" },
    { value: "12-04-2025", label: "Saturday, 12th April, 2025" },
    { value: "13-04-2025", label: "Sunday, 13th April, 2025" },
    { value: "14-04-2025", label: "Monday, 14th April, 2025" },
    { value: "15-04-2025", label: "Tuesday, 15th April, 2025" },
    { value: "16-04-2025", label: "Wednesday, 16th April, 2025" },
    { value: "17-04-2025", label: "Thursday, 17th April, 2025" }
  ];
  
  // Parse a date string in DD-MM-YYYY format
  const parseDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  };
  
  // Function to filter dates based on cutoff times - only run on client
  const getAvailableDates = useCallback(() => {
    // Return all dates during server-side rendering to avoid hydration mismatch
    if (typeof window === 'undefined') return allPossibleDates;
  
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    return allPossibleDates.filter(dateObj => {
      const orderDate = parseDate(dateObj.value);
      if (!orderDate) return false;
      
      // Reset to midnight for date comparison
      orderDate.setHours(0, 0, 0, 0);
      
      // Don't allow ordering for past dates
      if (orderDate < today) return false;
      
      const orderDay = orderDate.getDay();
      
      // For weekend orders (Saturday and Sunday)
      if (orderDay === 0 || orderDay === 6) {
        // Find the Friday before this weekend
        const fridayBefore = new Date(orderDate);
        fridayBefore.setDate(orderDate.getDate() - (orderDay === 0 ? 2 : 1));
        fridayBefore.setHours(0, 0, 0, 0);
        
        // If today is past that Friday, or it is Friday but after 4pm
        if (today > fridayBefore || 
            (today.getTime() === fridayBefore.getTime() && currentDay === 5 && currentHour >= 16)) {
          return false;
        }
      } 
      // For weekday orders (Monday to Friday)
      else {
        // Find the day before
        const dayBefore = new Date(orderDate);
        dayBefore.setDate(orderDate.getDate() - 1);
        dayBefore.setHours(0, 0, 0, 0);
        
        // If today is past the day before, or it is the day before but after 9pm
        if (today > dayBefore || 
            (today.getTime() === dayBefore.getTime() && currentHour >= 21)) {
          return false;
        }
      }
      
      return true;
    });
  }, []);
  
  // Update time slots based on selected date
  const updateTimeSlots = useCallback((dateStr: string) => {
    if (!dateStr) {
      setTimeSlots([]);
      return;
    }
    
    const orderDate = parseDate(dateStr);
    if (!orderDate) {
      setTimeSlots([]);
      return;
    }
    
    const day = orderDate.getDay();
    
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
  }, []);
  
  // Initial setup and client-side validation
  useEffect(() => {
    // This will only run on the client, after hydration is complete
    setMounted(true);
    
    // Check if currently selected date is valid only after mounting
    if (cart.length > 0) {
      const availableDates = getAvailableDates();
      if (checkoutInfo.date && !availableDates.some(d => d.value === checkoutInfo.date)) {
        setCheckoutInfo({ ...checkoutInfo, date: '', time_slot: '' });
      } else if (checkoutInfo.date) {
        updateTimeSlots(checkoutInfo.date);
      }
    }
  }, []);
  
  // Setup interval to periodically check date availability
  useEffect(() => {
    if (!mounted) return;
    
    const checkDateAvailability = () => {
      const availableDates = getAvailableDates();
      if (checkoutInfo.date && !availableDates.some(d => d.value === checkoutInfo.date)) {
        setCheckoutInfo({ ...checkoutInfo, date: '', time_slot: '' });
      }
    };
    
    const intervalId = setInterval(checkDateAvailability, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [mounted, checkoutInfo, getAvailableDates, setCheckoutInfo]);
  
  // Update time slots when date changes
  useEffect(() => {
    if (mounted && checkoutInfo.date) {
      updateTimeSlots(checkoutInfo.date);
    }
  }, [mounted, checkoutInfo.date, updateTimeSlots]);
  
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

  // Consistently use allPossibleDates for server rendering to avoid hydration mismatch
  const availableDates = mounted ? getAvailableDates() : allPossibleDates;
  
  // Create a stable layout that doesn't change structure between server and client
  return (
    <div className="checkout-container" suppressHydrationWarning>
      {!mounted ? (
        // Initial server render - use a consistent structure with placeholders
        <div className="checkout-wrapper">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="h-7 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-7 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : cart.length === 0 ? (
        // Empty cart view - only shown after client-side mounting
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="mb-4">Add some items to your cart before proceeding to checkout.</p>
          <Button onClick={() => router.push('/')}>Go to Menu</Button>
        </div>
      ) : (
        // Normal checkout view - only shown after client-side mounting
        <div className="checkout-wrapper">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Checkout</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={mounted ? (checkoutInfo.name || '') : ''}
                    onChange={(e) => mounted && setCheckoutInfo({ ...checkoutInfo, name: e.target.value })}
                    required
                    disabled={!mounted}
                  />
                </div>
                <PhoneInput
                  value={mounted ? (checkoutInfo.phone || '') : ''}
                  onChange={(value) => mounted && setCheckoutInfo({ ...checkoutInfo, phone: value })}
                  disabled={!mounted}
                />
                <EmailInput
                  value={mounted ? (checkoutInfo.email || '') : ''}
                  onChange={(value) => mounted && setCheckoutInfo({ ...checkoutInfo, email: value })}
                  disabled={!mounted}
                />
                <div className="mb-4">
                  <Label htmlFor="date">Date</Label>
                  <Select 
                    required 
                    onValueChange={(value) => mounted && setCheckoutInfo({...checkoutInfo, date: value, time_slot: ''})}
                    value={mounted ? (checkoutInfo.date || '') : ''}
                    disabled={!mounted}
                  >  
                    <SelectTrigger
                      id="date"
                      className="items-start"
                    >
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.length > 0 ? (
                        availableDates.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            <div className="flex flex-col gap-1">
                              <span>{date.label}</span>
                              <AvailabilityIndicator date={date.value} className="mt-1" />
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-sm">
                          No available dates based on current cutoff times.
                          {mounted && new Date().getDay() === 5 && new Date().getHours() >= 16 ? 
                            " Weekend orders must be placed by Friday 4PM." : 
                            mounted && new Date().getHours() >= 21 ? 
                              " Orders for tomorrow must be placed by 9PM today." : 
                              " Please try again later."
                          }
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {mounted && checkoutInfo.date && (
                    <div className="mt-2">
                      <AvailabilityIndicator date={checkoutInfo.date} />
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="time_slot">Time Slot</Label>
                  <Select
                    required 
                    disabled={!mounted || !checkoutInfo.date}
                    onValueChange={(value) => mounted && setCheckoutInfo({ ...checkoutInfo, time_slot: value })}
                    value={mounted ? (checkoutInfo.time_slot || '') : ''}
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
                              <span>{slot.label}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {mounted ? (
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </Button>
                ) : (
                  <div className="h-10 bg-primary text-primary-foreground rounded-md w-full inline-block"></div>
                )}
              </form>
              <div className="mt-4 p-4 bg-yellow-100 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Customers will need to book a delivery service to pick up their order at the selected slot. (e.g. Dunzo, Swiggy Genie, Porter, etc)
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  <strong>Order cutoff times:</strong> Weekend orders (Saturday/Sunday) must be placed by Friday 4PM. Weekday orders must be placed by 9PM the night before.
                </p>
              </div>
            </div>
            <div className="order-summary-container">
              <DynamicOrderSummary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}