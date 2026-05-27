const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SESSION_COOKIE = "yssf-session";

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  raised: number;
  goal: number;
  imageSrc: string;
  accentClass: string;
  progressColor: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  donations?: Donation[];
}

export interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventId: string;
  userId?: string | null;
  status: string;
  createdAt: string | Date;
  event?: Event;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  schoolPartner: string;
  description: string;
  fullDescription: string;
  imageSrc: string;
  badge: string;
  badgeColor: string;
  category: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  registrations?: EventRegistration[];
  _count?: { registrations: number };
}

export interface Donation {
  id: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  campaignId: string;
  userId?: string | null;
  paymentRef?: string | null;
  createdAt: string | Date;
  campaign?: Campaign;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string | null;
  imageSrc: string;
  tags: string;
  readTime: string;
  published: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
  date: string;
  createdAt: string | Date;
}

export interface DashboardStatsResponse {
  user: {
    id?: string;
    name: string | null;
    email: string;
    role?: string;
    skills?: string | null;
    profile?: { skills?: string[]; role?: string } | null;
  };
  stats: {
    totalDonated: number;
    eventsAttended: number;
    volunteerHours: number;
    impactScore: number;
  };
  recentDonations: Array<Donation & { campaign?: Campaign | null }>;
  recentRegistrations: Array<EventRegistration & { event: Event }>;
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalDonations: number;
  activeCampaigns: number;
  pendingVerifications: number;
  recentDonations: Array<Donation & { campaign?: Campaign | null }>;
  recentUsers: UserProfile[];
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  profile?: { role?: string } | null;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getCookie(SESSION_COOKIE);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Something went wrong");
  }

  return res.json();
}

function rememberSession(token: string) {
  setCookie(SESSION_COOKIE, token, 60 * 60 * 2); // 2 hours
}

function forgetSession() {
  deleteCookie(SESSION_COOKIE);
}

// ---- Auth ----

export async function apiSignIn(email: string, password: string) {
  const data = await apiFetch<{ success: boolean; user: { id: string; name: string; role: string }; token: string; emailVerified?: boolean }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  rememberSession(data.token);
  return data;
}

export async function apiSignUp(data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
}) {
  const result = await apiFetch<{ success: boolean; user: { id: string; name: string; role: string }; token: string; verificationRequired?: boolean; message?: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  rememberSession(result.token);
  return result;
}

export async function apiSignUpFull(data: Record<string, unknown>) {
  const result = await apiFetch<{ success: boolean; user: { id: string; name: string; role: string }; token: string }>("/api/auth/register-full", {
    method: "POST",
    body: JSON.stringify(data),
  });
  rememberSession(result.token);
  return result;
}

export async function apiGetMe() {
  return apiFetch<{ user: { id: string; name: string; email: string; role: string } | null }>("/api/auth/me");
}

export async function apiSignOut() {
  forgetSession();
  return apiFetch<{ success: boolean }>("/api/auth/signout", { method: "POST" });
}

// ---- Email Verification ----

export async function apiSendVerification() {
  return apiFetch<{ success: boolean; message: string }>("/api/auth/send-verification", {
    method: "POST",
  });
}

export async function apiVerifyEmail(email: string, code: string) {
  const result = await apiFetch<{ success: boolean; message: string; user: { id: string; name: string; role: string }; token: string }>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  if (result.token) {
    rememberSession(result.token);
  }
  return result;
}

export async function apiResendVerification(email: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ---- Campaigns ----

export async function apiGetCampaigns(filters?: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== "All") params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiFetch<Campaign[]>(`/api/campaigns${qs ? `?${qs}` : ""}`);
}

export async function apiGetCampaignBySlug(slug: string) {
  return apiFetch<Campaign>(`/api/campaigns/${slug}`);
}

// ---- Events ----

export async function apiGetEvents(filters?: { category?: string; status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== "All") params.set("category", filters.category);
  if (filters?.status && filters.status !== "All") params.set("status", filters.status.toLowerCase());
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiFetch<Event[]>(`/api/events${qs ? `?${qs}` : ""}`);
}

export async function apiGetEventBySlug(slug: string) {
  return apiFetch<Event>(`/api/events/${slug}`);
}

export async function apiRegisterForEvent(slug: string, data: { name: string; email: string; phone: string }) {
  return apiFetch<EventRegistration>(`/api/events/${slug}/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Blog ----

export async function apiGetBlogPosts(filters?: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== "All") params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiFetch<BlogPost[]>(`/api/blog${qs ? `?${qs}` : ""}`);
}

export async function apiGetBlogPost(slug: string) {
  return apiFetch<BlogPost>(`/api/blog/${slug}`);
}

// ---- Donations ----

export async function apiCreateDonation(data: {
  amount: number;
  donorName: string;
  donorEmail: string;
  campaignId: string;
}) {
  return apiFetch<Donation>("/api/donations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetDonations(campaignId?: string) {
  const params = new URLSearchParams();
  if (campaignId) params.set("campaignId", campaignId);
  const qs = params.toString();
  return apiFetch<Donation[]>(`/api/donations${qs ? `?${qs}` : ""}`);
}

// ---- Contact ----

export async function apiSubmitContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return apiFetch<Record<string, unknown>>("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Dashboard ----

export async function apiGetDashboardStats() {
  return apiFetch<DashboardStatsResponse>("/api/dashboard/stats");
}

export async function apiGetDonationHistory() {
  return apiFetch<Donation[]>("/api/dashboard/donation-history");
}

export async function apiGetAdminStats() {
  return apiFetch<AdminStatsResponse>("/api/dashboard/admin-stats");
}

export async function apiGetAllUsers(filters?: { role?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.role && filters.role !== "All") params.set("role", filters.role);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiFetch<UserProfile[]>(`/api/dashboard/users${qs ? `?${qs}` : ""}`);
}

export async function apiGetGalleryItems(category?: string) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  const qs = params.toString();
  return apiFetch<GalleryItem[]>(`/api/dashboard/gallery${qs ? `?${qs}` : ""}`);
}

// ---- Verification ----

export async function apiSendOTP(email: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/verify/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiVerifyOTP(email: string, code: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/verify/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function apiSendVerificationLink(email: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/verify/send-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiVerifyLink(token: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/verify/verify-link", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
