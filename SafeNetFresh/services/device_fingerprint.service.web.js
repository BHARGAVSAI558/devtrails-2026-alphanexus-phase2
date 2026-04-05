/** Web: skip SQLite, SecureStore, sensors, background tasks — telemetry is native-only. */

export function logAppOpen() {}

export function logAppBackground() {}

export function startScreenVisit() {}

export function endScreenVisit() {}

export function logButtonTap() {}

export function logClaimStatusView() {}

export async function syncDeviceTelemetryToPolicy() {}
