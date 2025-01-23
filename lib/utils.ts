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


export function formatNumberWithCommas(num: number | string): string {
  // Convert the input to a string if it's a number
  let numStr = typeof num === 'number' ? num.toString() : num.trim();

  // Handle multiple decimal points by keeping only the first one
  const firstDecimalIndex = numStr.indexOf('.');
  if (firstDecimalIndex !== -1) {
    // Remove any additional decimal points
    numStr =
      numStr.slice(0, firstDecimalIndex + 1) +
      numStr.slice(firstDecimalIndex + 1).replace(/\./g, '');
  }

  // Split the number into integer and decimal parts
  let [integerPart, decimalPart] = numStr.split('.');

  // Handle numbers starting with a decimal point (e.g., ".1234")
  if (integerPart === '') {
    integerPart = '0';
  }

  // Handle negative numbers
  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.slice(1);
  }

  // Regular expression to add commas every three digits from the end
  const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Re-add the negative sign if necessary
  const formattedInteger = isNegative ? `-${integerWithCommas}` : integerWithCommas;

  // If there's a decimal part, format it to have at most two decimals
  if (decimalPart) {
    // Truncate to two decimal places without rounding
    decimalPart = decimalPart.slice(0, 2);
    return `${formattedInteger}.${decimalPart}`;
  }

  // If there's no decimal part, return the integer part
  return formattedInteger;
}
