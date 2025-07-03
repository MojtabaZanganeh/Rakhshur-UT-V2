export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions
) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", options).format(date);
};

export function timeAgo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "در آینده";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} روز پیش`;
  } else if (hours > 0) {
    return `${hours % 24} ساعت پیش`;
  } else if (minutes > 0) {
    return `${minutes % 60} دقیقه پیش`;
  } else {
    return `${seconds % 60} ثانیه پیش`;
  }
}
