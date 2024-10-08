import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  halfPrice: number
  images: string[]
  video?: string
  vegetarian: boolean
  ingredients: string[]
  allergens: string[]
}

type CartItem = Pick<MenuItem, 'id' | 'name'> & { 
  cartId: number
  quantity: number
  size: 'full' | 'half'
  price: number
};

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
  addToCart: (item: MenuItem, size: 'full' | 'half') => void
  removeFromCart: (cartId: number) => void
  updateCartItemQuantity: (cartId: number, quantity: number) => void
  cartCount: number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  checkoutInfo: CheckoutInfo
  setCheckoutInfo: (info: Partial<CheckoutInfo>) => void
  placeOrder: () => Promise<{ success: boolean; orderId?: string; error?: string }>
  clearCart: () => void
}

export const useMenuStore = create(
  persist<MenuStore>(
    (set, get) => ({
      selectedItem: null,
      setSelectedItem: (item) => set({ selectedItem: item }),
      cart: [],
      addToCart: (item, size) => set((state) => {
        console.log('item', item, 'size', size)
        const existingItem = state.cart.find((cartItem) => cartItem.id === item.id && cartItem.size === size)
        const price = size === 'full' ? item.price : item.halfPrice
        if (existingItem) {
          // If item already exists, increment the quantity
          return {
            cart: state.cart.map((cartItem) =>
              cartItem.cartId === existingItem.cartId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
            cartCount: state.cartCount + 1,
          }
        }
        // Auto-increment cartId for new items
        const cartId = state.cart.length > 0 ? Math.max(...state.cart.map(cartItem => cartItem.cartId)) + 1 : 1;
        return {
          cart: [...state.cart, { id: item.id, name: item.name, quantity: 1, size, price, cartId }],
          cartCount: state.cartCount + 1,
        }
      }),
      removeFromCart: (cartId) => set((state) => {
        const existingItem = state.cart.find((cartItem) => cartItem.cartId === cartId)
        if (existingItem && existingItem.quantity > 1) {
          return {
            cart: state.cart.map((cartItem) =>
              cartItem.cartId === cartId
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            ),
            cartCount: state.cartCount - 1,
          }
        }
        return {
          cart: state.cart.filter((cartItem) => cartItem.cartId !== cartId),
          cartCount: state.cartCount - (existingItem?.quantity || 0),
        }
      }),
      updateCartItemQuantity: (cartId, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.cartId === cartId ? { ...item, quantity } : item
        ),
        cartCount: state.cart.reduce((count, item) => 
          item.cartId === cartId ? count + quantity : count + item.quantity, 0
        ),
      })),
      cartCount: 0,
      isCartOpen: false,
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      checkoutInfo: {
        name: '',
        phone: '',
        date: '',
        time_slot: '',
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
            set({ cart: [], cartCount: 0, checkoutInfo: { name: '', phone: '', date: '', time_slot: '' } })
            return { success: true, orderId: data.orderId }
          } else {
            throw new Error(data.error || 'An error occurred while processing your order.')
          }
        } catch (error: any) {
          console.error('Error placing order (store):', error)
          return { success: false, error: error.message }
        }
      },
      clearCart: () => set({ cart: [], cartCount: 0 }),
    }),
    {
      name: 'menu-store',
      getStorage: () => localStorage,
    }
  )
)
