/**
 * Get user avatar URL with fallback to default avatar
 * @param avaUrl - Avatar URL from database (can be null/undefined)
 * @returns Avatar URL or default /user.png
 */
export function getUserAvatar(avaUrl: string | null | undefined): string {
  if (avaUrl && avaUrl.trim() !== '') {
    if (avaUrl.startsWith('/uploads')) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return `${API_URL}${avaUrl}`;
    }
    return avaUrl;
  }
  return '/user.png';
}

/**
 * Get user initials from name for avatar placeholder
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Initials (e.g., "JD" for John Doe)
 */
export function getUserInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return `${first}${last}` || 'U';
}

/**
 * Generate avatar URL using UI Avatars service as fallback
 * @param name - User's full name
 * @param avaUrl - Avatar URL from database
 * @returns Avatar URL or generated avatar
 */
export function getAvatarWithFallback(
  name: string,
  avaUrl: string | null | undefined
): string {
  if (avaUrl && avaUrl.trim() !== '') {
    if (avaUrl.startsWith('/uploads')) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return `${API_URL}${avaUrl}`;
    }
    return avaUrl;
  }
  
  // Use local default avatar
  if (!name || name.trim() === '') {
    return '/user.png';
  }
  
  // Generate avatar with UI Avatars as alternative
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=0ea5e9&color=fff&size=128&bold=true&rounded=true`;
}

/**
 * Get formatted company logo URL (prefixing with API_URL if relative /uploads)
 * @param logoUrl - Logo URL from database
 * @returns Fully qualified URL or null
 */
export function getCompanyLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl || logoUrl.trim() === '') return null;
  if (logoUrl.startsWith('/uploads')) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${API_URL}${logoUrl}`;
  }
  return logoUrl;
}

