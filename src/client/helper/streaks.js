export function isNextDay(lastDateStr) {
  const last = new Date(lastDateStr);
  const today = new Date();

  // normalize both to midnight so only the date part matters
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}
