import { Badge } from '@/components/ui/Badge'

const colourMap: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; dot: boolean }> = {
  blue: { variant: 'info', dot: true },
  red: { variant: 'danger', dot: true },
  green: { variant: 'success', dot: true },
  yellow: { variant: 'warning', dot: true },
  orange: { variant: 'warning', dot: true },
  purple: { variant: 'purple', dot: true },
  black: { variant: 'default', dot: true },
  white: { variant: 'default', dot: false },
  grey: { variant: 'default', dot: true },
  gray: { variant: 'default', dot: true },
  cyan: { variant: 'info', dot: true },
  pink: { variant: 'purple', dot: true },
}

type ColourBadgeProps = {
  colour: string
}

export function ColourBadge({ colour }: ColourBadgeProps) {
  const key = colour.toLowerCase()
  const config = colourMap[key] ?? { variant: 'default' as const, dot: true }

  return (
    <Badge variant={config.variant} dot={config.dot}>
      {colour}
    </Badge>
  )
}
