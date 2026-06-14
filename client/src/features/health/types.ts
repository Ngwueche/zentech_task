export type HealthStatus = 'Healthy' | 'Unhealthy' | 'Unknown'

export type HealthCheckResult = {
  status: HealthStatus
  checkedAt: Date
  rawResponse?: unknown
}
