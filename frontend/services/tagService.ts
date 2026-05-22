const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Tag {
  id: string;
  name: string;
}

export const tagService = {
  async getTags(): Promise<Tag[]> {
    const response = await fetch(`${API_URL}/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return response.json();
  },
};
