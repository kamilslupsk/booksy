import type { Provider, Service, AvailabilityRule, VacationBlock, Booking, Review, Subscription } from "@prisma/client";

export type ProviderWithServices = Provider & {
  services: Service[];
  availabilityRules: AvailabilityRule[];
  vacationBlocks: VacationBlock[];
  reviews: Review[];
  subscription: Subscription | null;
};

export type BookingWithDetails = Booking & {
  service: Service;
  provider: Provider;
};

export interface WizardState {
  step: 1 | 2 | 3;
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedSlot: string | null;
  guestName: string;
  guestPhone: string;
}

export type WizardAction =
  | { type: "SET_SERVICE"; service: Service }
  | { type: "SET_DATE"; date: Date }
  | { type: "SET_SLOT"; slot: string }
  | { type: "SET_GUEST_NAME"; name: string }
  | { type: "SET_GUEST_PHONE"; phone: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "RESET" };
