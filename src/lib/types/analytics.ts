// src/lib/types/analytics.ts

export interface AnalyticsSummary {
  total_leads: number;
  total_quotes: number;
  accepted_quotes: number;
  pending_quotes: number;
  rejected_quotes: number;
  total_messages: number;
  unread_messages: number;
  avg_response_time_hours: number | null;
  conversion_rate: number;
}

export interface DailyData {
  date: string;
  count: number;
}

export interface DailyQuoteData extends DailyData {
  accepted: number;
}

export interface EventTypeData {
  type: string;
  count: number;
}

export interface QuoteStatusData {
  status: string;
  count: number;
}

export interface MonthlyComparison {
  current_month_leads: number;
  last_month_leads: number;
  current_month_quotes: number;
  last_month_quotes: number;
}

export interface GuestCountData {
  range: string;
  count: number;
}

export interface VendorAnalytics {
  summary: AnalyticsSummary;
  leads_by_day: DailyData[];
  quotes_by_day: DailyQuoteData[];
  leads_by_event_type: EventTypeData[];
  quotes_by_status: QuoteStatusData[];
  monthly_comparison: MonthlyComparison;
  guest_count_distribution: GuestCountData[];
}
