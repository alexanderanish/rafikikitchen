import Checkout from '@/components/Checkout'

export const metadata = {
  title: "Checkout | Rafiki's Kitchen",
  description: 'Complete your order',
  other: {
    'format-detection': 'telephone=no, date=no, email=no, address=no'
  }
}

export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 py-8" suppressHydrationWarning>
      <Checkout />
    </main>
  )
}