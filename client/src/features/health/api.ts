import { apiClient } from '@/lib/apiClient'
import type { HealthCheckResult, HealthStatus } from './types'

export async function fetchHealth(): Promise<HealthCheckResult> {
  try {
    const { data, status } = await apiClient.get('/health')

    let healthStatus: HealthStatus = 'Unknown'

    if (status === 200) {
      const raw = data as { status?: string } | string
      const statusStr =
        typeof raw === 'string'
          ? raw.toLowerCase()
          : (raw?.status ?? '').toLowerCase()

      if (statusStr === 'healthy') healthStatus = 'Healthy'
      else if (statusStr === 'unhealthy') healthStatus = 'Unhealthy'
      else healthStatus = 'Healthy'
    } else {
      healthStatus = 'Unhealthy'
    }

    return { status: healthStatus, checkedAt: new Date(), rawResponse: data }
  } catch {
    return { status: 'Unhealthy', checkedAt: new Date() }
  }
}
