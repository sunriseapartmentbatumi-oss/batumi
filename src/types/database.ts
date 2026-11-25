// Ręcznie zsynchronizowane z supabase/migrations. Po zmianie schematu wygeneruj ponownie: supabase gen types typescript (docs/DATA-MODEL.md §12).
export type ReservationStatus = "pending_payment" | "confirmed" | "cancelled" | "expired" | "completed";
export type BookingSource = "direct" | "phone" | "airbnb" | "booking" | "other";

type Timestamps = { created_at: string; updated_at: string };

export type Property = {
  id: string;
  name: string;
  currency: string;
  minimum_stay_nights: number;
  cleaning_fee_minor: number;
  extra_guest_fee_minor: number;
  tax_amount_minor: number;
} & Timestamps;

export type Amenity = { id: string; property_id: string; name: string; created_at: string };

export type CalendarBlock = {
  id: string;
  property_id: string;
  blocked_during: string;
  reason: string | null;
  source: string;
  external_reference: string | null;
  created_by: string | null;
} & Timestamps;

export type Reservation = {
  id: string;
  reference: string;
  property_id: string;
  status: ReservationStatus;
  source: BookingSource;
  external_reference: string | null;
  check_in: string;
  check_out: string;
  stay_period: string;
  nights_count: number;
  adults_count: number;
  children_count: number;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  guest_message: string | null;
  currency: string;
  accommodation_amount_minor: number;
  cleaning_fee_minor: number;
  extra_guest_fee_minor: number;
  discount_amount_minor: number;
  tax_amount_minor: number;
  total_amount_minor: number;
  amount_due_minor: number;
  terms_version: string;
  privacy_version: string;
  terms_accepted_at: string;
  hold_expires_at: string | null;
  confirmed_at: string | null;
  reminder_sent_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
} & Timestamps;

export type AdminProfile = { user_id: string; role: string; is_active: boolean; created_at: string };
