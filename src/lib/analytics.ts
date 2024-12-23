type GtagAction = 'config' | 'event'

interface GtagEvent {
  action: string
  category: string
  label: string
  value?: number
}

declare global {
  interface Window {
    gtag: (
      action: GtagAction,
      targetId: string,
      eventParams?: {
        page_path?: string;
        event_category?: string;
        event_label?: string;
        value?: number;
      }
    ) => void;
  }
}

export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with actual GA tracking ID

// Log page views
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Log specific events
export const event = ({ action, category, label, value }: GtagEvent) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track specific accomplishment actions
export const trackAccomplishmentAction = (
  action: 'create' | 'update' | 'delete' | 'export',
  details?: string
) => {
  event({
    action,
    category: 'Accomplishment',
    label: details || action,
  });
};
