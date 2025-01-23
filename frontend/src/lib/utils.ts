import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { XataClient } from "./xata"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  if (!process.env.XATA_DATABASE_URL || !process.env.XATA_API_KEY || !process.env.XATA_BRANCH) {
    throw new Error('Missing Xata configuration environment variables.');
  }

  instance = new XataClient({
    databaseURL: process.env.XATA_DATABASE_URL,
    apiKey: process.env.XATA_API_KEY,
    fetch: fetch,
    branch: process.env.XATA_BRANCH,
  });
  return instance;
};