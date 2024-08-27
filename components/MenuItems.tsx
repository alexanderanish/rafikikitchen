'use client'

import Image from 'next/image'
import { useMenuStore } from '@/app/store/menuStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle, MinusCircle, ChevronLeft, ChevronRight, ShoppingCart, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const menuItems = [
  {
    id: 1,
    name: 'Nala',
    description: "The Nala features pork solantulem from Nihal's mum's recipe, cooked with kokum and spices. The sandwich is balanced with spicy Kasundi mustard, sweet apple jam, salted cucumber, lettuce, and creamy homemade mayonnaise.",
    price: 400,
    images: ['/pork_1.jpg', '/pork_2.jpg', '/pork_3.jpg'],
    vegetarian: false,
    allergens:["Pork", "Egg", "Mustard Seeds"],
    ingredients: ['Pork Solantulem (Kokum)', 'Homemade Mayonaise', 'Kasundi Mustard', 'Cucumber', 'Lettuce leaves', 'Spiced Apple Jam', 'Baguette'],
  },
  {
    id: 2,
    name: 'Rafiki',
    description: "If you love lemongrass, this sandwich is for you. It includes grilled chicken in a green chilli and lemongrass marinade, lemongrass labneh, pickled carrots, radish, salted cucumbers, and basil leaves for a punchy, spicy flavor.",
    price: 400,
    images: ['/chicken_1.jpg', '/chicken_2.jpg', '/chicken_3.jpg','/chicken_4.jpg', '/chicken_5.jpg', '/chicken_6.jpg'],
    vegetarian: false,
    allergens:["Lemongrass", "Chicken", "Fish Sauce", "Soy Sauce", "Curd"],
    ingredients: ['Green Chilli and Lemongrass Chicken', 'Pickled Carrot and Radish', 'Salted Cucumber', 'Lemongrass Labneh', 'Fish Sauce', 'Soy Sauce', 'Baguette'],
  },
  {
    id: 3,
    name: 'Jazz',
    description: "The Jazz is a vegetarian Middle Eastern sandwich with smoky baked tahini eggplant, homemade hummus, labneh, garlic toum, spiced tomato jam, basil leaves, and homemade mozzarella.",
    price: 350,
    images: ['/veg_1.jpg', '/veg_2.jpg', '/veg_3.jpg', '/veg_4.jpg'],
    vegetarian: true,
    allergens:["Eggplant", "Sesame Seeds", "Chickpeas", "Milk", "Curd" ],
    ingredients: ['Baked Tahini Eggplant', 'Hummus', 'Labneh', 'Garlic Toum', 'Spiced Tomato Jam', 'Mozarella','Basil Leaves','Baguette'],
  },
]

function Carousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <Image src={image} alt={`Slide ${index + 1}`} width={400} height={400}  className="w-full h-64 object-cover" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={prevSlide} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}

function VegIndicator({ isVegetarian }: { isVegetarian: boolean }) {
  const color = isVegetarian ? 'green' : 'red'
  return (
    <div 
      className={`flex items-center justify-center w-6 h-6 border-2 ${color === 'green' ? 'border-green-500' : 'border-red-500'} rounded-sm`}
      title={isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <div className={`w-3 h-3 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />
    </div>
  )
}

function AllergenInfo({ allergens }: { allergens: string[] }) {
  return (
    <div className="flex items-center mt-2">
      {/* <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" /> */}
      <span className="text-sm text-gray-600">
        Contains: {allergens.join(', ')}
      </span>
    </div>
  )
}

export default function MenuItems() {
  const { selectedItem, setSelectedItem, cart, addToCart, removeFromCart, searchQuery, cartCount } = useMenuStore()

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const router = useRouter()
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.map((item) => {
          const cartItem = cart.find((cartItem) => cartItem.id === item.id)
          const quantity = cartItem?.quantity || 0

          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Carousel images={item.images} />
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <VegIndicator isVegetarian={item.vegetarian} />
                </div>
                <p className="text-stone-600 mb-2">
                  {item.description}{' '}
                </p>
                <p className="text-stone-600 mb-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="text-stone-800 text-sm font-medium hover:underline"
                  >
                    View Details
                  </button>
                </p>
                <AllergenInfo allergens={item.allergens} />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">₹{item.price.toFixed(2)}</span>
                  <div className="flex items-center space-x-2">
                    {quantity > 0 ? (
                      <>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-600 hover:text-stone-800"
                          aria-label="Remove one from cart"
                          variant="ghost"
                          size="sm"
                        >
                          <MinusCircle className="w-6 h-6" />
                        </Button>
                        <span className="font-medium">{quantity}</span>
                        <Button
                          onClick={() => addToCart(item)}
                          className="text-stone-600 hover:text-stone-800"
                          aria-label="Add one to cart"
                          variant="ghost"
                          size="sm"
                        >
                          <PlusCircle className="w-6 h-6" />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => addToCart(item)} size="sm">
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            {/* <DialogDescription>{selectedItem?.description}</DialogDescription> */}
          </DialogHeader>
          <div className="py-4">
            {selectedItem && <Carousel images={selectedItem.images} />}

            <DialogDescription className="text-justify pt-4">{selectedItem?.description}</DialogDescription>
            <h4 className="font-medium mt-4 mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside">
              {selectedItem?.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">{ingredient}</li>
              ))}
            </ul>
            <AllergenInfo allergens={selectedItem?.allergens || []} />
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm mt-2">
                {selectedItem?.vegetarian ? 'Vegetarian' : 'Non-vegetarian'}
              </p>
              <VegIndicator isVegetarian={selectedItem?.vegetarian ?? false} />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button onClick={() => setSelectedItem(null)} variant="outline">
              Close
            </Button>
            <Button onClick={() => {
              addToCart(selectedItem!)
              setSelectedItem(null)
            }}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {cartCount > 0 && (
        <div className="fixed bottom-4 lg:bottom-16 right-4 z-50">
          <Button onClick={() => router.push('/checkout')} size="lg" className="shadow-lg bg-orange-500">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Proceed to Checkout ({cartCount})
          </Button>
        </div>
      )}
    </>
  )
}