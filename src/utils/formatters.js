/**
 * Safe formatting utilities for Snooker Guts App
 */

/**
 * Format currency with symbol and +/- prefix
 */
export const formatCurrency = (amount, symbol = '$', showPlus = true) => {
  const num = Number(amount) || 0;
  const absFormatted = Math.abs(num).toFixed(2);

  if (num > 0) {
    return showPlus ? `+${symbol}${absFormatted}` : `${symbol}${absFormatted}`;
  } else if (num < 0) {
    return `-${symbol}${absFormatted}`;
  }
  return `${symbol}0.00`;
};

/**
 * Format Guts Points with + prefix for positive values
 */
export const formatGutsPoints = (points) => {
  const pts = Number(points) || 0;
  if (pts > 0) return `+${pts} Pts`;
  return `${pts} Pts`;
};

/**
 * Format ISO Date string into a human-readable date & time
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoString;
  }
};
