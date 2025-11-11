import { AUTH_TOKEN_KEY } from './constants';

export class LocalStorageWrapper {
  // Method to get 'authToken' from local storage
  static getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  // Generic method to get any item by key from local storage
  static getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  // Method to set an item in local storage
  static setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  // Method to remove an item from local storage
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Method to clear all items from local storage
  static clear(): void {
    localStorage.clear();
  }
}
