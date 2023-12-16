import DarkLogo from '@/assets/dark/commons-logo.svg'
import LightLogo from '@/assets/light/commons-logo.png'
import LightLogoCompact from '@/assets/light/commons-logo-compact.png'
import DarkLogoCompact from '@/assets/dark/commons-logo-compact.png'
import IconDarkMode from '@/assets/light/icon_dark_mode.svg'
import IconDarkModeDark from '@/assets/dark/icon_dark_mode.svg'

export const ICON_DARK_MODE = Symbol('ICON_DARK_MODE')
export const LOGO_TYPE_COMPACT = Symbol('LOGO_TYPE_COMPACT')
export const LOGO_TYPE = Symbol('LOGO_TYPE')

export default {
  [ICON_DARK_MODE]: {
    light: IconDarkMode,
    dark: IconDarkModeDark,
  },
  [LOGO_TYPE_COMPACT]: {
    light: LightLogoCompact,
    dark: DarkLogoCompact,
  },
  [LOGO_TYPE]: {
    light: LightLogo,
    dark: DarkLogo,
  },
}
