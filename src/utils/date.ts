/**
 * Date & Currency formatting utilities
 */

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getDaysDifference(targetDateString: string): number {
  if (!targetDateString) return 0;
  const target = new Date(targetDateString);
  const now = new Date();
  // Strip hours to compare calendar days
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateToday(dateString?: string): boolean {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();
  return (
    target.getDate() === now.getDate() &&
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear()
  );
}

export function isBirthdayToday(dobString?: string): boolean {
  if (!dobString) return false;
  const dob = new Date(dobString);
  const now = new Date();
  return dob.getDate() === now.getDate() && dob.getMonth() === now.getMonth();
}
