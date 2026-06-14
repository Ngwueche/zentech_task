import { apiClient, normalizeApiResponse } from '@/lib/apiClient'
import type { DashboardStats } from './types'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get('/api/dashboard')
  return normalizeApiResponse<DashboardStats>(data)
}
