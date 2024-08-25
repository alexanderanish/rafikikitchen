import Checkout from '@/components/Checkout'

export const metadata = {
  title: "Checkout | Rafiki's Kitchen",
  description: 'Complete your order',
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Checkout />
    </div>
  )
}