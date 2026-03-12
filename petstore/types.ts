// ──────────────────────────────────────────────
// Domain Types — Petstore API
// ──────────────────────────────────────────────

export interface Category {
  id?: number;
  name?: string;
}

export interface Tag {
  id?: number;
  name?: string;
}

export interface Pet {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: 'available' | 'pending' | 'sold';
}

export interface Order {
  id?: number;
  petId: number;
  quantity: number;
  shipDate?: string;
  status?: 'placed' | 'approved' | 'delivered';
  complete?: boolean;
}

export interface User {
  id?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  userStatus?: number;
}

export interface ApiResponse {
  code?: number;
  type?: string;
  message?: string;
}

export interface InventoryResponse {
  [status: string]: number;
}

// ──────────────────────────────────────────────
// Test Data Builder Types
// ──────────────────────────────────────────────

export type PetStatus = 'available' | 'pending' | 'sold';
export type OrderStatus = 'placed' | 'approved' | 'delivered';
