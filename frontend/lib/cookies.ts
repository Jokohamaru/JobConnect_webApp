// Cookie utilities

export const cookies = {
  /**
   * Set a cookie
   */
  set(name: string, value: string, days: number = 7): void {
    if (typeof window === 'undefined') return;

    const maxAge = days * 24 * 60 * 60; // Convert days to seconds
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  },

  /**
   * Get a cookie
   */
  get(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  },

  /**
   * Remove a cookie
   */
  remove(name: string): void {
    if (typeof window === 'undefined') return;

    // Remove with different path and domain variations to ensure complete removal
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${window.location.hostname}`;
  },

  /**
   * Remove all cookies
   */
  removeAll(): void {
    if (typeof window === 'undefined') return;
    
    const allCookies = document.cookie.split(';');
    
    for (let i = 0; i < allCookies.length; i++) {
      const cookie = allCookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      
      if (name) {
        this.remove(name);
      }
    }
  },

  /**
   * Check if a cookie exists
   */
  has(name: string): boolean {
    return this.get(name) !== null;
  },
};
