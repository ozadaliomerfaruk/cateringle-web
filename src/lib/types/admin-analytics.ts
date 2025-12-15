// src/lib/types/admin-analytics.ts

export interface AdminSummary {
  total_vendors: number;
  approved_vendors: number;
  pending_vendors: number;
  total_users: number;
  total_leads: number;
  total_quotes: number;
  accepted_quotes: number;
  total_reviews: number;
  pending_reviews: number;
  total_messages: number;
  platform_conversion_rate: number;
}

export interface DailyData {
  date: string;
  count: number;
}

export interface DailyVendorData extends DailyData {
  approved: number;
}

export interface DailyQuoteData extends DailyData {
  accepted: number;
}

export interface CityData {
  city: string;
  count: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface TopVendorData {
  vendor_name: string;
  lead_count: number;
  quote_count: number;
}

export interface MonthlyComparison {
  current_month_leads: number;
  last_month_leads: number;
  current_month_vendors: number;
  last_month_vendors: number;
  current_month_quotes: number;
  last_month_quotes: number;
  current_month_users: number;
  last_month_users: number;
}

export interface EventTypeData {
  type: string;
  count: number;
}

export interface QuoteStatusData {
  status: string;
  count: number;
}

export interface WeeklyActivity {
  new_leads: number;
  new_vendors: number;
  new_quotes: number;
  new_messages: number;
  new_reviews: number;
}

export interface AdminAnalytics {
  summary: AdminSummary;
  leads_by_day: DailyData[];
  vendors_by_day: DailyVendorData[];
  quotes_by_day: DailyQuoteData[];
  vendors_by_city: CityData[];
  vendors_by_category: CategoryData[];
  top_vendors_by_leads: TopVendorData[];
  monthly_comparison: MonthlyComparison;
  leads_by_event_type: EventTypeData[];
  quotes_by_status: QuoteStatusData[];
  weekly_activity: WeeklyActivity;
}
