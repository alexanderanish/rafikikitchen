'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
  })

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e:any) => {
    e.preventDefault()
    // Here you would typically send the order data to your backend
    console.log('Order submitted:', formData)
    router.push('/confirmation')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-stone-700">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-stone-700">Address</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-stone-700">Pickup Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="time" className="block text-sm font-medium text-stone-700">Pickup Time</label>
        <input
          type="time"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-stone-800 text-white px-6 py-3 rounded-md hover:bg-stone-700 transition-colors"
      >
        Place Order
      </button>
    </form>
  )
}