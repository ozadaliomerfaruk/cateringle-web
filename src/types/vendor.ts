// src/types/vendor.ts

export interface VendorImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

export interface SearchVendorResult {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  avg_price_per_person: number | null;
  min_guest_count: number | null;
  max_guest_count: number | null;
  lead_time_type: string | null;
  available_24_7: boolean;
  has_refrigerated_vehicle: boolean;
  serves_outside_city: boolean;
  halal_certified: boolean;
  free_tasting: boolean;
  free_delivery: boolean;
  accepts_last_minute: boolean;
  city_name: string | null;
  district_name: string | null;
  avg_rating: number;
  review_count: number;
  images: VendorImage[];
}

export interface SearchVendorsResponse {
  vendors: SearchVendorResult[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}
