"use client";

import { useReducer } from "react";
import type { Service } from "@prisma/client";

export interface WizardState {
  step: 1 | 2 | 3;
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedSlot: string | null;
  guestName: string;
  guestPhone: string;
}

type Action =
  | { type: "SET_SERVICE"; service: Service }
  | { type: "SET_DATE"; date: Date }
  | { type: "SET_SLOT"; slot: string }
  | { type: "SET_GUEST_NAME"; name: string }
  | { type: "SET_GUEST_PHONE"; phone: string }
  | { type: "NEXT" }
  | { type: "PREV" };

const initial: WizardState = {
  step: 1,
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  guestName: "",
  guestPhone: "",
};

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_SERVICE":
      return { ...state, selectedService: action.service, selectedDate: null, selectedSlot: null };
    case "SET_DATE":
      return { ...state, selectedDate: action.date, selectedSlot: null };
    case "SET_SLOT":
      return { ...state, selectedSlot: action.slot };
    case "SET_GUEST_NAME":
      return { ...state, guestName: action.name };
    case "SET_GUEST_PHONE":
      return { ...state, guestPhone: action.phone };
    case "NEXT":
      return { ...state, step: Math.min(state.step + 1, 3) as 1 | 2 | 3 };
    case "PREV":
      return { ...state, step: Math.max(state.step - 1, 1) as 1 | 2 | 3 };
    default:
      return state;
  }
}

export function useBookingWizard() {
  const [state, dispatch] = useReducer(reducer, initial);

  return {
    state,
    setService: (service: Service) => dispatch({ type: "SET_SERVICE", service }),
    setDate: (date: Date) => dispatch({ type: "SET_DATE", date }),
    setSlot: (slot: string) => dispatch({ type: "SET_SLOT", slot }),
    setGuestName: (name: string) => dispatch({ type: "SET_GUEST_NAME", name }),
    setGuestPhone: (phone: string) => dispatch({ type: "SET_GUEST_PHONE", phone }),
    next: () => dispatch({ type: "NEXT" }),
    prev: () => dispatch({ type: "PREV" }),
    canNext:
      (state.step === 1 && !!state.selectedService) ||
      (state.step === 2 && !!state.selectedDate && !!state.selectedSlot) ||
      state.step === 3,
  };
}
