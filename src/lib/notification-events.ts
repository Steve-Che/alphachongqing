export const NOTIFICATIONS_UPDATED = "notifications-updated";

export function dispatchNotificationsUpdated(count?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UPDATED, { detail: { count } }),
  );
}
