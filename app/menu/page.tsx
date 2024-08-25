import MenuItems from '@/components/MenuItems'

export const metadata = {
  title: "Menu | Rafiki's Kitchen",
  description: 'Explore our delicious artisanal sandwiches',
}

export default function Menu() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
      <MenuItems />
      <div className="mt-8 p-4 bg-yellow-100 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Customers will need to book a delivery service to pick up their order at the selected slot.
        </p>
      </div>
    </div>
  )
}