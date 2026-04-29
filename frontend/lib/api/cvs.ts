import { get, post, del } from '@/lib/api-client';

export interface CV {
  id: string;
  candidate_id: string;
  file_name: string;
  file_path: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getMyCVs() {
  return get<CV[]>('/candidates/me/cvs');
}

export async function uploadCV(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Note: This will need multipart/form-data support
  return post<CV>('/candidates/me/cvs', formData);
}

export async function deleteCV(cvId: string) {
  return del(`/candidates/me/cvs/${cvId}`);
}

export async function setDefaultCV(cvId: string) {
  return post(`/candidates/me/cvs/${cvId}/default`, {});
}
