import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  vegetarian: boolean
  allergens: string[]
  ingredients: string[]
}

export type CartItem = MenuItem & {
  quantity: number
  size: string
}

type CheckoutInfo = {
  name: string
  phone: string
  email: string
  date: string
  time_slot: string
}

interface MenuStore {
  selectedItem: MenuItem | null
  setSelectedItem: (item: MenuItem | null) => void
  cart: CartItem[]
  addToCart: (item: MenuItem, size: string) => void
  removeFromCart: (id: number, size: string) => void
  decreaseQuantity: (id: number, size: string) => void
  clearCart: () => void
  items: MenuItem[]
  setItems: (items: MenuItem[]) => void
  checkoutInfo: CheckoutInfo
  setCheckoutInfo: (info: Partial<CheckoutInfo>) => void
  placeOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>
  searchQuery: string
  setSearchQuery: (query: string) => void
  cartCount: number
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set, get) => ({
      selectedItem: null,
      setSelectedItem: (item) => set({ selectedItem: item }),
      cart: [],
      items: [],
      setItems: (items) => set({ items }),
      checkoutInfo: {
        name: '',
        phone: '',
        email: '',
        date: '',
        time_slot: ''
      },
      setCheckoutInfo: (info) => set((state) => ({
        checkoutInfo: { ...state.checkoutInfo, ...info }
      })),
      placeOrder: async () => {
        const { cart, checkoutInfo } = get()
        try {
          const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart, checkoutInfo }),
          })

          const data = await response.json()

          if (data.success) {
            // Clear the cart and reset checkout info
            set({ 
              cart: [], 
              checkoutInfo: { name: '', phone: '', email: '', date: '', time_slot: '' } 
            })
            return { success: true, orderId: data.orderId }
          } else {
            throw new Error(data.error || 'An error occurred while processing your order.')
          }
        } catch (error: any) {
          console.error('Error placing order:', error)
          return { success: false, error: error.message }
        }
      },
      addToCart: (item, size) => {
        const cart = get().cart
        const existingItem = cart.find(
          (cartItem) => cartItem.id === item.id && cartItem.size === size
        )

        if (existingItem) {
          set({
            cart: cart.map((cartItem) =>
              cartItem.id === item.id && cartItem.size === size
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
            cartCount: get().cartCount + 1
          })
        } else {
          set({
            cart: [...cart, { ...item, size, quantity: 1 }],
            cartCount: get().cartCount + 1
          })
        }
      },
      removeFromCart: (id, size) => {
        const cart = get().cart
        const itemToRemove = cart.find(
          (item) => item.id === id && item.size === size
        )
        if (itemToRemove) {
          set({
            cart: cart.filter(
              (item) => !(item.id === id && item.size === size)
            ),
            cartCount: get().cartCount - itemToRemove.quantity
          })
        }
      },
      decreaseQuantity: (id, size) => {
        const cart = get().cart
        const existingItem = cart.find(
          (item) => item.id === id && item.size === size
        )

        if (existingItem && existingItem.quantity > 1) {
          set({
            cart: cart.map((item) =>
              item.id === id && item.size === size
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
            cartCount: get().cartCount - 1
          })
        } else {
          get().removeFromCart(id, size)
        }
      },
      clearCart: () => set({ cart: [], cartCount: 0 }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      cartCount: 0,
    }),
    {
      name: 'menu-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
