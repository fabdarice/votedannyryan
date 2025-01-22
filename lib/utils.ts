import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} years ago`;
}

export const truncateAddress = (address: string, chars: number = 6): string => {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Define a sleep function that returns a Promise
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatUSD(amount: number): string {
  const amountTrunc: number = Math.floor(amount); // For positive numbers
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, currency: "USD",
  }).format(amountTrunc);
}
