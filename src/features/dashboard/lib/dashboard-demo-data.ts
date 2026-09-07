/**
 * TODO/DASHBOARD_DEMO_DATA — isolated motivational quotes only.
 * Replace with a user preferences / quotes API when available.
 * Never mix these into financial or device metrics.
 */

const QUOTES = [
  "Stay focused. Make progress. Build the life you want.",
  "Small steps today become big outcomes tomorrow.",
  "Clarity beats intensity. Know what matters now.",
  "Your system works when you work the system.",
  "Progress is a habit, not an event.",
] as const;

export function dashboardQuote(now = new Date()): string {
  const index = now.getDate() % QUOTES.length;
  return QUOTES[index]!;
}
