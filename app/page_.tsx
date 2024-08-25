'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from 'lucide-react'

const menuItems = [
  { id: 1, name: 'Classic Club', description: 'Triple-decker sandwich with turkey, bacon, lettuce, and tomato' },
  { id: 2, name: 'Veggie Delight', description: 'Grilled vegetables with hummus and feta cheese' },
  { id: 3, name: 'Spicy Chicken', description: 'Grilled spicy chicken with avocado and chipotle mayo' },
  { id: 4, name: 'Vegan Wrap', description: 'Assorted vegetables and hummus in a whole wheat wrap' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showOverlay, setShowOverlay] = useState(false)
  const router = useRouter()

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/menu?search=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Rafiki's Kitchen</h1>
        <p className="text-xl mb-6">Artisanal sandwiches crafted with love and care.</p>
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowOverlay(e.target.value.length > 0)
            }}
            className="pr-10"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1">
            <Search className="w-4 h-4" />
          </Button>
          {showOverlay && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              {filteredItems.map(item => (
                <Link
                  key={item.id}
                  href={`/menu?search=${encodeURIComponent(item.name)}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowOverlay(false)}
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </Link>
              ))}
            </div>
          )}
        </form>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-4 md:mb-0 md:pr-4">
            <Image src="/placeholder.svg" alt="Rafiki's Kitchen" width={500} height={300} className="rounded-lg" />
          </div>
          <div className="md:w-1/2">
            <p className="mb-4">
              Rafiki's Kitchen was born out of a passion for creating the perfect sandwich. Our artisanal approach combines fresh, locally-sourced ingredients with innovative flavor combinations.
            </p>
            <p>
              Every sandwich is crafted with care, ensuring a delightful experience with every bite.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Featured Sandwiches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.slice(0, 3).map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src="/placeholder.svg" alt={item.name} width={400} height={300} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-stone-600 mb-4">{item.description}</p>
                <Link href={`/menu?search=${encodeURIComponent(item.name)}`} className="text-stone-800 font-medium hover:underline">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 p-4 bg-yellow-100 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Customers will need to book a delivery service to pick up their order at the selected slot.
        </p>
      </div>
    </div>
  )
}