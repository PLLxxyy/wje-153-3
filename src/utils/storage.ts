/* ================================================================
   localStorage helpers — type-safe read/write
   ================================================================ */

import { STORAGE_KEYS } from '../types';
import type { Venue, Booking, DaySlot, Review, UserProfile } from '../types';

/* ---------- generic helpers ---------- */

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Venues ---------- */

export function getVenues(): Venue[] {
  return readJSON<Venue[]>(STORAGE_KEYS.VENUES, []);
}

export function saveVenues(venues: Venue[]): void {
  writeJSON(STORAGE_KEYS.VENUES, venues);
}

export function getVenueById(id: string): Venue | undefined {
  return getVenues().find((v) => v.id === id);
}

/* ---------- Bookings ---------- */

export function getBookings(): Booking[] {
  return readJSON<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
}

export function saveBookings(bookings: Booking[]): void {
  writeJSON(STORAGE_KEYS.BOOKINGS, bookings);
}

export function addBooking(booking: Booking): void {
  const list = getBookings();
  list.push(booking);
  saveBookings(list);
}

export function updateBooking(id: string, patch: Partial<Booking>): void {
  const list = getBookings();
  const idx = list.findIndex((b) => b.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    saveBookings(list);
  }
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

/* ---------- Day Slots ---------- */

export function getDaySlots(): DaySlot[] {
  return readJSON<DaySlot[]>(STORAGE_KEYS.DAY_SLOTS, []);
}

export function saveDaySlots(slots: DaySlot[]): void {
  writeJSON(STORAGE_KEYS.DAY_SLOTS, slots);
}

export function getDaySlot(venueId: string, date: string): DaySlot | undefined {
  return getDaySlots().find((s) => s.venueId === venueId && s.date === date);
}

export function upsertDaySlot(slot: DaySlot): void {
  const list = getDaySlots();
  const idx = list.findIndex((s) => s.venueId === slot.venueId && s.date === slot.date);
  if (idx >= 0) {
    list[idx] = slot;
  } else {
    list.push(slot);
  }
  saveDaySlots(list);
}

/* ---------- Reviews ---------- */

export function getReviews(): Review[] {
  return readJSON<Review[]>(STORAGE_KEYS.REVIEWS, []);
}

export function saveReviews(reviews: Review[]): void {
  writeJSON(STORAGE_KEYS.REVIEWS, reviews);
}

export function addReview(review: Review): void {
  const list = getReviews();
  list.push(review);
  saveReviews(list);
}

export function getReviewsByVenue(venueId: string): Review[] {
  return getReviews().filter((r) => r.venueId === venueId);
}

/* ---------- User ---------- */

export function getUser(): UserProfile {
  const fallback: UserProfile = { id: 'user_1', name: '用户', phone: '', isAdmin: false };
  return readJSON<UserProfile>(STORAGE_KEYS.USER, fallback);
}

export function saveUser(user: UserProfile): void {
  writeJSON(STORAGE_KEYS.USER, user);
}

/* ---------- Favorites ---------- */

export function getFavorites(): string[] {
  return readJSON<string[]>(STORAGE_KEYS.FAVORITES, []);
}

export function saveFavorites(favorites: string[]): void {
  writeJSON(STORAGE_KEYS.FAVORITES, favorites);
}

export function isFavorite(venueId: string): boolean {
  return getFavorites().includes(venueId);
}

export function toggleFavorite(venueId: string): boolean {
  const list = getFavorites();
  const idx = list.indexOf(venueId);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveFavorites(list);
    return false;
  }
  list.push(venueId);
  saveFavorites(list);
  return true;
}

/* ---------- Init flag ---------- */

export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}
