'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

import { Suspense } from 'react'

const ConfirmationContent = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-xl mb-2">Thank you for your order.</p>
      <p className="text-lg mb-8">Your order ID is: {orderId}</p>
      <p className="mb-8">Remember to book a delivery service to pick up your order at the selected slot.</p>
      <Link href="/" className="bg-stone-800 text-white px-6 py-3 rounded-md inline-block hover:bg-stone-700 transition-colors">
        Back to Home
      </Link>
    </div>
  )
}

export default function Confirmation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}