import { useTheme } from '@aragon/ui'
import assets from '@/utils/assets-utils'

export function useAsset(iconType) {
  const theme = useTheme()

  if (!iconType) {
    return ''
  }

  return assets[iconType][theme._appearance]
}
