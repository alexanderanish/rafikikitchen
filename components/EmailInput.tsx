import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EmailInput({ value, onChange, disabled = false }: EmailInputProps) {
  const [email, setEmail] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setEmail(input);
    onChange(input);

    if (!input) {
      setIsValid(false);
      setError('Email is required');
      return;
    }

    if (!emailRegex.test(input)) {
      setIsValid(false);
      setError('Invalid email format');
      return;
    }

    setIsValid(true);
    setError('');
  };

  return (
    <div className="mb-4">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        required
        placeholder="Enter your email address"
        disabled={disabled}
      />
      {!isValid && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
