'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingCart, Instagram } from 'lucide-react'
import { useMenuStore } from '@/app/store/menuStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cart, cartCount, removeFromCart, isCartOpen, setIsCartOpen } = useMenuStore()

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
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <button aria-label="Cart" className="p-2 relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              {cart.length === 0 ? (
                <p className="py-4">Your cart is empty</p>
              ) : (
                <div className="py-4">
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{item.name} <span className="text-sm text-grey">({item.size})</span></p>
                        <p className="text-sm text-stone-600">
                          ₹{item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.cartId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium">
                      Total: ₹{cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </p>
                  </div>
                  <Link href="/checkout" passHref>
                    <Button className="w-full mt-4" onClick={() => setIsCartOpen(false)}>
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Mobile Menu */}
          <button
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 md:hidden"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t">
          <ul className="container mx-auto px-4 py-2 space-y-2">
            <li><Link href="/" passHref className="block py-2 text-center">Menu</Link></li>
          </ul>
        </nav>
      )}
    </header>
  )
}
