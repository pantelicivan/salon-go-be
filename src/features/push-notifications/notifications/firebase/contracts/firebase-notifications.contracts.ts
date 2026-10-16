export interface FirebaseData {
  title?: string | null;
  body?: string | null;
  data?: string | null;
  topic?: string | null;
  receivers?: string[] | null;
  aps_thread_id: string;
  badge?: number | null;
  sound: string;
}

export interface ApnsConfig {
  headers: {
    'apns-priority': string;
  };
  payload: {
    aps: {
      alert: {
        title: string;
        body: string;
      };
      sound: string;
      badge: number;
      'thread-id': string;
    };
  };
}

export interface AndroidConfig {
  notification: {
    title?: string;
    body?: string;
    channel_id?: string;
  };
}

export interface Notification {
  title: string;
  body: string;
}

export interface FirebaseMessage {
  data?: any;
  notification?: Notification;
  apns?: ApnsConfig;
  android?: AndroidConfig;
}
