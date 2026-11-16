const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const pointsFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatPoints(points: number): string {
  return pointsFormatter.format(points);
}

/** « 18:00 » → « 18h », « 18:30 » → « 18h30 » */
export function formatHour(time: string): string {
  const [hours = '', minutes = '00'] = time.split(':');
  return minutes === '00' ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}
