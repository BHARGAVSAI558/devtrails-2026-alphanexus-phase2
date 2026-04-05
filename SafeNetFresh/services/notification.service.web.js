/** Web: no native push / local notifications. Stubs keep imports safe. */

export async function registerForPushNotificationsAsync() {
  return null;
}

export function setupNotificationHandlers() {
  return () => {};
}

export async function presentClaimUpdateLocalNotification() {}

export async function presentDisruptionLocalNotification() {}

export async function presentPayoutCreditedLocalNotification() {}
