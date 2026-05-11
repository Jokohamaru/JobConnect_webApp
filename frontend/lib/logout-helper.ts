/**
 * Logout Helper - Xóa tất cả dữ liệu khi đăng xuất
 */

import { cookies } from './cookies';

export const logoutHelper = {
  /**
   * Xóa tất cả dữ liệu liên quan đến authentication
   */
  clearAllAuthData(): void {
    if (typeof window === 'undefined') return;

    // 1. Clear localStorage
    this.clearLocalStorage();

    // 2. Clear sessionStorage
    this.clearSessionStorage();

    // 3. Clear all cookies
    this.clearAllCookies();

    console.log('✅ All auth data cleared successfully');
  },

  /**
   * Xóa localStorage
   */
  clearLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Xóa các key cụ thể liên quan đến auth
      const authKeys = [
        'access_token',
        'refresh_token',
        'user',
        'ai-cv-data',
        'edit-cv-data',
      ];

      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Hoặc xóa toàn bộ localStorage (cẩn thận với cách này)
      // localStorage.clear();

      console.log('✅ localStorage cleared');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  },

  /**
   * Xóa sessionStorage
   */
  clearSessionStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.clear();
      console.log('✅ sessionStorage cleared');
    } catch (error) {
      console.error('❌ Error clearing sessionStorage:', error);
    }
  },

  /**
   * Xóa tất cả cookies
   */
  clearAllCookies(): void {
    if (typeof window === 'undefined') return;

    try {
      // Sử dụng cookies helper để xóa tất cả
      cookies.removeAll();

      // Backup: Xóa thủ công các cookies quan trọng
      const criticalCookies = [
        'access_token',
        'refresh_token',
        'session',
        'auth',
      ];

      criticalCookies.forEach(name => {
        cookies.remove(name);
      });

      console.log('✅ All cookies cleared');
    } catch (error) {
      console.error('❌ Error clearing cookies:', error);
    }
  },

  /**
   * Xóa IndexedDB (nếu có sử dụng)
   */
  async clearIndexedDB(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const databases = await window.indexedDB.databases();
      
      for (const db of databases) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }

      console.log('✅ IndexedDB cleared');
    } catch (error) {
      console.error('❌ Error clearing IndexedDB:', error);
    }
  },

  /**
   * Xóa Service Worker cache (nếu có)
   */
  async clearServiceWorkerCache(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );

      console.log('✅ Service Worker cache cleared');
    } catch (error) {
      console.error('❌ Error clearing Service Worker cache:', error);
    }
  },
};
