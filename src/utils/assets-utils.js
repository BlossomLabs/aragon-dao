import IconDarkMode from '@/assets/light/icon_dark_mode.svg'
import IconDarkModeDark from '@/assets/dark/icon_dark_mode.svg'
import LogoTypeCompact from '@/assets/light/logo_type_compact.svg'
import LogoTypeCompactDark from '@/assets/dark/logo_type_compact.svg'
import LogoType from '@/assets/light/logo_type.svg'
import LogoTypeDark from '@/assets/dark/logo_type.svg'

export const ICON_DARK_MODE = Symbol('ICON_DARK_MODE')
export const LOGO_TYPE_COMPACT = Symbol('LOGO_TYPE_COMPACT')
export const LOGO_TYPE = Symbol('LOGO_TYPE')

export default {
  [ICON_DARK_MODE]: {
    light: IconDarkMode,
    dark: IconDarkModeDark,
  },
  [LOGO_TYPE_COMPACT]: {
    light: LogoTypeCompact,
    dark: LogoTypeCompactDark,
  },
  [LOGO_TYPE]: {
    light: LogoType,
    dark: LogoTypeDark,
  },
}
