export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface NotificationsResult {
  notifications: NotificationItem[];
  total_count: number;
}
