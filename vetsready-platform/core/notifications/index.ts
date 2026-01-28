/**
 * Notifications Service
 * Event-based notification abstraction with future SMS/email support
 */

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  channel: 'in_app' | 'email' | 'sms' | 'push';
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  preferredEmail?: string;
  preferredPhone?: string;
  notificationTopics: {
    benefits?: boolean;
    employment?: boolean;
    education?: boolean;
    wellness?: boolean;
    community?: boolean;
  };
}

export interface EventHandler {
  (payload: any): Promise<void> | void;
}

export interface Event {
  type: string;
  domain: string;
  userId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export interface INotificationService {
  // In-App Notifications
  sendInAppNotification(userId: string, notification: Notification): Promise<void>;
  getInAppNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  deleteNotification(userId: string, notificationId: string): Promise<void>;

  // Event Management
  subscribe(event: string, handler: EventHandler): void;
  unsubscribe(event: string, handler?: EventHandler): void;
  publish(event: string, payload: any): Promise<void>;

  // Future: Email & SMS
  sendEmailNotification(userId: string, subject: string, body: string): Promise<void>;
  sendSmsNotification(userId: string, message: string): Promise<void>;

  // Preferences
  getPreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
}
