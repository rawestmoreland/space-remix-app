import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
import { ILaunchResult } from '~/services/launchService';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function launchListRequest(url: string, apiKey: string) {
  const response = await axios.get(url, {
    headers:
      process.env.NODE_ENV === 'production'
        ? {
            Authorization: `Token ${apiKey}`,
          }
        : undefined,
  });
  return response;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime({
  dateString,
  displayUTC = true,
}: {
  dateString: string;
  displayUTC?: boolean;
}) {
  const date = new Date(dateString);
  if (displayUTC) {
    const minutes = date.getUTCMinutes();
    const hours = date.getUTCHours();
    return `${hours}:${minutes.toString().padStart(2, '0')} UTC`;
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isoDurationToHumanReadable(isoDuration: string) {
  const regex =
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);

  if (!matches) {
    return 'Invalid duration format';
  }

  const [, years, months, days, hours, minutes, seconds] = matches.map(Number);

  const parts = [];
  if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

  if (parts.length === 0) {
    return '0 seconds';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return parts.join(' and ');
  }

  return parts.slice(0, -1).join(', ') + ', and ' + parts.slice(-1);
}

export function timeUntilLaunch(launch: ILaunchResult) {
  const launchDate = new Date(launch.net);
  const now = new Date();
  const diff = launchDate.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `T-${days}d ${hours}h`;
  } else if (hours > 0) {
    return `T-${hours}h`;
  } else if (diff > 0) {
    return 'Launching soon';
  } else {
    return 'Launched';
  }
}

export function getLaunchStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'go for launch':
    case 'launch successful':
      return 'bg-green-600 text-white hover:bg-green-700';
    case 'to be confirmed':
      return 'bg-yellow-600 text-white hover:bg-yellow-700';
    case 'launch failure':
      return 'bg-red-600 text-white hover:bg-red-700';
    default:
      return 'bg-gray-600 text-white hover:bg-gray-700';
  }
}
