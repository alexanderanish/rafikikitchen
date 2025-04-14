'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingCart, Instagram } from 'lucide-react'
import { useMenuStore } from '@/app/store/menuStore'
import dynamic from 'next/dynamic'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

// Import SheetTrigger with ssr disabled to avoid hydration mismatch
const SheetTrigger = dynamic(
  () => import('@/components/ui/sheet').then(mod => mod.SheetTrigger),
  { ssr: false }
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cart, removeFromCart } = useMenuStore()
  const [mounted, setMounted] = useState(false)
  const [clientCart, setClientCart] = useState<any[]>([])
  
  useEffect(() => {
    setMounted(true)
    setClientCart(cart)
  }, [cart])
  
  const calculateTotal = () => {
    return clientCart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Create placeholder for cart button when not mounted
  const CartButton = () => (
    <button aria-label="Cart" className="p-2 relative">
      <ShoppingCart className="w-6 h-6" />
      {mounted && (
        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {clientCart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      )}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Rafiki's Kitchen" width={60} height={60} />
          <span className="ml-2 text-xl font-semibold">
            <Image src="/only_name.png" alt="Rafiki's Kitchen" width={200} height={200} />
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button className="hidden md:block" variant="ghost">Menu</Button>
          </Link>
          <Link href="https://www.instagram.com/rafiki.kitchen" passHref>
            <Button variant="ghost">
              <Instagram className="w-6 h-6" />
            </Button>
          </Link>

          {/* Cart */}
          {mounted ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {clientCart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {clientCart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {clientCart.length === 0 ? (
                    <p className="text-sm text-gray-500">Your cart is empty</p>
                  ) : (
                    <>
                      {clientCart.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {item.name} ({item.size})
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id, item.size)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center font-medium">
                          <p>Total</p>
                          <p>₹{calculateTotal().toFixed(2)}</p>
                        </div>
                        <Button className="w-full mt-4">
                          <Link href="/checkout">Checkout</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <CartButton />
          )}

          {/* Mobile Menu */}
          <button
            aria-label="Toggle menu"
            onClick={() => mounted && setIsMenuOpen(!isMenuOpen)}
            className="p-2 md:hidden"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {mounted && isMenuOpen && (
        <nav className="md:hidden bg-white border-t">
          <ul className="container mx-auto px-4 py-2 space-y-2">
            <li><Link href="/" passHref className="block py-2 text-center">Menu</Link></li>
          </ul>
        </nav>
      )}
    </header>
  )
}

