"use client";

import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatPolishPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function PhoneInput({ value, onChange, disabled, placeholder = "123 456 789" }: PhoneInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatPolishPhone(e.target.value);
    onChange(formatted);
  }

  return (
    <div className="flex">
      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm select-none">
        +48
      </span>
      <Input
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-l-none"
      />
    </div>
  );
}
