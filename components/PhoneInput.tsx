import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
}

export function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState(value)

  useEffect(() => {
    setPhoneNumber(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '')
    if (input.length <= 10) {
      setPhoneNumber(input)
      onChange(input)
    }
  }

  return (
    <div className="mb-4">
      <Label htmlFor="phone">Phone Number</Label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
          +91
        </span>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          className="rounded-l-none"
          required
          pattern="[0-9]{10}"
          maxLength={10}
          placeholder="Enter 10 digit number"
        />
      </div>
      {phoneNumber.length > 0 && phoneNumber.length < 10 && (
        <p className="mt-1 text-sm text-red-500">Please enter a 10-digit phone number</p>
      )}
    </div>
  )
}