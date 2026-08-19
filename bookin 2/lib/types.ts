export type Role = "member" | "lab_admin" | "super_admin";
export type EquipmentStatus = "active" | "maintenance" | "retired";

export interface Lab {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  lab_id: string | null;
}

export interface Equipment {
  id: string;
  lab_id: string;
  name: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  min_booking_minutes: number;
  max_booking_minutes: number;
  notes: string;
}

export interface Booking {
  id: string;
  equipment_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled";
  purpose: string;
  profiles?: Pick<Profile, "full_name" | "email">;
}
