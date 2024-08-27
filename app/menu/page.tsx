import MenuItems from '@/components/MenuItems'

export const metadata = {
  title: "Menu | Rafiki's Kitchen",
  description: 'Explore our delicious artisanal sandwiches',
}

export default function Menu() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">The Menu</h1>
      <div className="my-8 p-4 bg-yellow-100 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Customers will need to book a delivery service to pick up their order at the selected slot. (e.g. Dunzo, Swiggy Genie, Porter, etc)
        </p>
      </div>
      <MenuItems />
    </div>
  )
}