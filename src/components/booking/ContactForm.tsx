"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/common/PhoneInput";

interface Props {
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

export function ContactForm({ name, phone, onNameChange, onPhoneChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="guest-name">Twoje imię</Label>
        <Input
          id="guest-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="np. Anna Kowalska"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Numer telefonu</Label>
        <div className="mt-1.5">
          <PhoneInput value={phone} onChange={onPhoneChange} />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Wyślemy potwierdzenie SMS na ten numer.
        </p>
      </div>
    </div>
  );
}
