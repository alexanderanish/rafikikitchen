"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "../layout"
import { menuItems } from "../data/menuData"

interface InventoryItem {
  _id: string
  itemId: string
  name: string
  currentQuantity: number
}

interface OrderItem {
  itemId: string
  name: string
  price: number
  quantity: number
}

interface CustomerInfo {
  customerName: string
  email: string
  phoneNumber: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  halfPrice?: number
  vegetarian?: boolean
  images?: string[]
  image?: string
}

export default function CashierPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: "",
    email: "",
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Get all menu items including lemonade and pasteis de nata
  const allMenuItems: MenuItem[] = [
    ...menuItems,
    {
      id: "lemonade",
      name: "Lemonade",
      description: "Refreshing lemonade",
      price: 3.5,
      image: "/images/lemonade.jpg",
    },
    {
      id: "pasteis-de-nata",
      name: "Pasteis de Nata",
      description: "Portuguese custard tart",
      price: 2.5,
      image: "/images/pasteis.jpg",
    },
  ]

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory")
      const data = await res.json()

      if (data.success) {
        setInventory(data.data)
      } else {
        setError("Failed to fetch inventory")
      }
    } catch (error) {
      setError("Error fetching inventory")
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = (itemId: string) => {
    const menuItem = allMenuItems.find((item) => item.id === itemId)
    const inventoryItem = inventory.find((item) => item.itemId === itemId)

    if (!menuItem || !inventoryItem) return

    // Check if there's enough inventory
    if (inventoryItem.currentQuantity <= 0) {
      setError(`${menuItem.name} is out of stock`)
      return
    }

    // Check if item is already in the order
    const existingItemIndex = selectedItems.findIndex((item) => item.itemId === itemId)

    if (existingItemIndex >= 0) {
      // Check if we can add more of this item
      const currentQuantity = selectedItems[existingItemIndex].quantity
      if (currentQuantity >= inventoryItem.currentQuantity) {
        setError(`Cannot add more ${menuItem.name}. Only ${inventoryItem.currentQuantity} available.`)
        return
      }

      // Increment quantity
      const updatedItems = [...selectedItems]
      updatedItems[existingItemIndex].quantity += 1
      setSelectedItems(updatedItems)
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          itemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ])
    }

    setError("")
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...selectedItems]
    updatedItems.splice(index, 1)
    setSelectedItems(updatedItems)
  }

  const handleQuantityChange = (index: number, value: number) => {
    const itemId = selectedItems[index].itemId
    const inventoryItem = inventory.find((item) => item.itemId === itemId)

    if (!inventoryItem) return

    // Check if there's enough inventory
    if (value > inventoryItem.currentQuantity) {
      setError(`Cannot add ${value} of ${selectedItems[index].name}. Only ${inventoryItem.currentQuantity} available.`)
      return
    }

    const updatedItems = [...selectedItems]
    updatedItems[index].quantity = value
    setSelectedItems(updatedItems)
    setError("")
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      setError("Please add at least one item to the order")
      return
    }

    if (!customerInfo.customerName) {
      setError("Please enter customer name")
      return
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...customerInfo,
          items: selectedItems,
          totalAmount: calculateTotal(),
          orderDate: new Date(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess("Order created successfully!")
        setSelectedItems([])
        setCustomerInfo({
          customerName: "",
          email: "",
          phoneNumber: "",
        })
        fetchInventory() // Refresh inventory

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError("Failed to create order")
      }
    } catch (error) {
      setError("Error creating order")
    }
  }

  if (loading)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    )

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Cashier</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
            <div className="grid grid-cols-2 gap-4">
              {allMenuItems.map((item) => {
                const inventoryItem = inventory.find((invItem) => invItem.itemId === item.id)
                const available = inventoryItem ? inventoryItem.currentQuantity : 0

                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${available <= 0 ? "opacity-50" : ""}`}
                    onClick={() => handleAddItem(item.id)}
                  >
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    <p className={`text-sm ${available <= 5 ? "text-red-500" : "text-gray-500"}`}>
                      {available} available
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Current Order</h2>

            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">Customer Information</h3>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={customerInfo.customerName}
                    onChange={handleCustomerInfoChange}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={customerInfo.phoneNumber}
                    onChange={handleCustomerInfoChange}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
              {selectedItems.length === 0 ? (
                <p className="p-4 text-gray-500">No items added to order</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, Number.parseInt(e.target.value))}
                            className="border rounded w-16 px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-2">${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-medium">
                        Total:
                      </td>
                      <td className="px-4 py-2 font-bold">${calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <button
              onClick={handleSubmitOrder}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              disabled={selectedItems.length === 0 || !customerInfo.customerName}
            >
              Submit Order
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

