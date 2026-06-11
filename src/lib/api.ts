export type Role = "admin" | "head_office" | "manager" | "chef" | "waiter" | "customer";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  branch: string | null;
  branchId: number | null;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  role: "customer";
  phone?: string;
  branch: string | null;
  branchId: number | null;
};

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
};

export type Order = {
  id: number;
  customer: string;
  branch: string;
  total: number;
  status: string;
  created_at: string;
};

export type CustomerOrder = {
  id: number;
  customer_id: number;
  branch: string;
  items: string;
  total: number;
  status: string;
  created_at: string;
};

export type Booking = {
  id: number;
  customer_id: number;
  branch: string;
  guests: number;
  booking_date: string;
  booking_time: string;
  status: string;
};

export type InventoryItem = {
  id: number;
  name: string;
  branch: string;
  quantity: number;
  unit: string;
  reorder_level: number;
};

export type Report = {
  totalSales: number;
  totalOrders: number;
  lowStock: number;
  topItem: string;
};

type AuthResponse = { user: User };

const API_URL = import.meta.env.VITE_API_URL || "https://steakz-final.onrender.com";
const staffRoles: Role[] = ["admin", "head_office", "manager", "chef", "waiter"];

export const steakzBranches = [
  "Mayfair Prime Steakhouse",
  "Soho Flame Grill",
  "Kensington Steak Room",
  "Canary Wharf Grill House",
  "Covent Garden Steakhouse",
];

async function request<T>(path: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const staffUser = JSON.parse(sessionStorage.getItem("steakz_staff_user") || "null") as User | null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (staffUser) {
      headers["X-User-Role"] = staffUser.role;
      if (staffUser.branch) headers["X-User-Branch"] = staffUser.branch;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const response = await fetch(`${API_URL}${normalizedPath}`, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) },
    });

    if (!response.ok) throw new Error("API request failed");
    return await response.json();
  } catch {
    if (fallback !== undefined) return fallback;
    throw new Error("The backend is not available.");
  }
}

async function login(email: string, password: string) {
  const { user } = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return user;
}

export async function staffLogin(email: string, password: string): Promise<User | undefined> {
  const user = await login(email, password);
  if (!staffRoles.includes(user.role)) return undefined;

  sessionStorage.setItem("steakz_staff_user", JSON.stringify(user));
  sessionStorage.removeItem("steakz_customer_user");
  return user;
}

export function clearStaffSession() {
  sessionStorage.removeItem("steakz_staff_user");
  sessionStorage.removeItem("steakz_customer_user");
}

export async function customerLogin(email: string, password: string): Promise<Customer | undefined> {
  const user = await login(email, password);
  if (user.role !== "customer") return undefined;

  const customer = user as Customer;
  sessionStorage.setItem("steakz_customer_user", JSON.stringify(customer));
  sessionStorage.removeItem("steakz_staff_user");
  return customer;
}

export async function customerRegister(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  branch?: string;
}): Promise<Customer> {
  const { user } = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (user.role !== "customer") throw new Error("Registration did not return a customer account.");
  const customer = user as Customer;
  sessionStorage.setItem("steakz_customer_user", JSON.stringify(customer));
  sessionStorage.removeItem("steakz_staff_user");
  return customer;
}

export const api = {
  getMenuItems: () => request<MenuItem[]>("/api/menu-items", undefined, []),
  getOrders: () => request<Order[]>("/api/orders", undefined, []),
  getInventory: () => request<InventoryItem[]>("/api/inventory", undefined, []),
  getUsers: () => request<User[]>("/api/users", undefined, []),
  getReports: () => request<Report>("/api/reports", undefined, { totalSales: 0, totalOrders: 0, lowStock: 0, topItem: "" }),
  getCustomerBookings: (customerId: number) => request<Booking[]>(`/api/customers/${customerId}/bookings`, undefined, []),
  getCustomerOrders: (customerId: number) => request<CustomerOrder[]>(`/api/customers/${customerId}/orders`, undefined, []),
  saveMenuItem: (item: Partial<MenuItem>) => request<MenuItem>("/api/menu-items", { method: "POST", body: JSON.stringify(item) }, item as MenuItem),
  saveOrder: (order: Partial<Order>) => request<Order>("/api/orders", { method: "POST", body: JSON.stringify(order) }, order as Order),
  saveCustomerBooking: (booking: Partial<Booking>) => request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(booking) }, booking as Booking),
  saveCustomerOrder: (order: Partial<CustomerOrder>) => request<CustomerOrder>("/api/customer-orders", { method: "POST", body: JSON.stringify(order) }, order as CustomerOrder),
  saveInventoryItem: (item: Partial<InventoryItem>) => request<InventoryItem>("/api/inventory", { method: "POST", body: JSON.stringify(item) }, item as InventoryItem),
  saveUser: (user: Partial<User>) => request<User>("/api/users", { method: "POST", body: JSON.stringify(user) }, user as User),
};
