// Application Constants

// Token Management
export const TOKEN_KEY = "token";
export const TOKEN_STORAGE = "localStorage"; // atau "cookies"

// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  SELLER_LOGIN: "/api/auth/login",
  SELLER_REGISTER: "/api/auth/register",
};

// Protected Routes (require token)
export const PROTECTED_ROUTES = [
  "/seller/dasboard",
  "/seller/products",
  "/seller/orders",
  "/seller/custom-products",
  "/orders",
  "/cart",
  "/checkout",
];

// Theme Colors
export const COLORS = {
  primary: "#8C735A",      // Brown
  secondary: "#DCC8B9",    // Beige
  accent: "#4A3B32",       // Dark Brown
  light: "#F4EFEA",        // Cream
};

// Token Utility Functions
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

export const hasToken = (): boolean => {
  return getToken() !== null;
};
