import { create } from 'zustand'

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  video?: string
  vegetarian: boolean
  ingredients: string[]
}

type CartItem = MenuItem & { quantity: number }

type CheckoutInfo = {
  name: string
  phone: string
  date: string
  time_slot: string
}

type MenuStore = {
  selectedItem: MenuItem | null
  setSelectedItem: (item: MenuItem | null) => void
  cart: CartItem[]
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: number) => void
  cartCount: number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  checkoutInfo: CheckoutInfo
  setCheckoutInfo: (info: Partial<CheckoutInfo>) => void
  placeOrder: () => any
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  cart: [],
  addToCart: (item) => set((state) => {
    const existingItem = state.cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      return {
        cart: state.cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ),
        cartCount: state.cartCount + 1,
      }
    }
    return {
      cart: [...state.cart, { ...item, quantity: 1 }],
      cartCount: state.cartCount + 1,
    }
  }),
  removeFromCart: (itemId) => set((state) => {
    const existingItem = state.cart.find((cartItem) => cartItem.id === itemId)
    if (existingItem && existingItem.quantity > 1) {
      return {
        cart: state.cart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        ),
        cartCount: state.cartCount - 1,
      }
    }
    return {
      cart: state.cart.filter((cartItem) => cartItem.id !== itemId),
      cartCount: state.cartCount - (existingItem?.quantity || 0),
    }
  }),
  cartCount: 0,
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  checkoutInfo: {
    name: '',
    phone: '',
    date:'',
    time_slot:'',
  },
  setCheckoutInfo: (info) => set((state) => ({
    checkoutInfo: { ...state.checkoutInfo, ...info },
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
        set({ cart: [], cartCount: 0, checkoutInfo: { name: '', phone: '', date: '', time_slot:'' } })
        return { success: true, orderId: data.orderId }
      } else {
        throw new Error(data.error || 'An error occurred while processing your order.')
      }
    } catch (error:any) {
      console.error('Error placing order:', error)
      return { success: false, error: error.message }
    }
  },
}))