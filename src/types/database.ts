export type PropertyCategory =
  | "Residential"
  | "Industrial"
  | "Commercial"
  | "Agricultural Land"
  | "Non-agricultural Land";

export interface PropertyRow {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  city: string | null;
  village: string | null;
  area_unit: "sq. mtr" | "sq. ft" | "Acre" | null;
  area_value: number | null;
  survey_number: string | null;
  category: PropertyCategory;
  amenities: string[];
  configuration: string | null; // e.g. 1BHK, 4B2H2K
  floor_number: string | null;
  room_size: string | null;
  plot_size: string | null;
  zone_type: string | null;
  fencing: string | null;
  related_properties: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyImageRow {
  id: string;
  property_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface InquiryRow {
  id: string;
  property_id: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  type: "credit" | "debit";
  title: string;
  source: string;
  amount: number;
  date: string;
  created_at: string;
  linked_credit_id?: string | null; // <-- NEW
}

export interface ReviewRow {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar_url: string | null;
  created_at: string;
}

// ── Enriched / joined types ───────────────────────────────────

export interface PropertyWithImages extends PropertyRow {
  property_images: PropertyImageRow[];
}

// ── Insert / Update payloads ─────────────────────────────────

export interface PropertyInsert {
  public_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  city: string | null;
  village: string | null;
  area_unit: "sq. mtr" | "sq. ft" | "Acre" | null;
  area_value: number | null;
  survey_number: string | null;
  category: PropertyCategory;
  configuration: string | null;
  floor_number: string | null;
  room_size: string | null;
  plot_size: string | null;
  zone_type: string | null;
  fencing: string | null;
  related_properties: string[] | null;
  is_published: boolean;
}

export type PropertyUpdate = Partial<PropertyInsert>;

export interface InquiryInsert {
  property_id: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
}

// ── Supabase Database type (for typed client) ────────────────

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: PropertyRow;
        Insert: {
          id?: string;
          public_id: string;
          title: string;
          description?: string | null;
          price: number;
          location: string;
          city?: string | null;
          village?: string | null;
          area_unit?: "sq. mtr" | "sq. ft" | "Acre" | null;
          area_value?: number | null;
          survey_number?: string | null;
          category: PropertyCategory;
          configuration?: string | null;
          floor_number?: string | null;
          room_size?: string | null;
          plot_size?: string | null;
          zone_type?: string | null;
          fencing?: string | null;
          related_properties?: string[] | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          location?: string;
          city?: string | null;
          village?: string | null;
          area_unit?: "sq. mtr" | "sq. ft" | "Acre" | null;
          area_value?: number | null;
          survey_number?: string | null;
          category?: PropertyCategory;
          configuration?: string | null;
          floor_number?: string | null;
          room_size?: string | null;
          plot_size?: string | null;
          zone_type?: string | null;
          fencing?: string | null;
          related_properties?: string[] | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      property_images: {
        Row: PropertyImageRow;
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
          display_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          phone: string;
          email: string;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          phone?: string;
          email?: string;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: ReviewRow;
        Insert: {
          id?: string;
          name: string;
          role: string;
          quote: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          quote?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
