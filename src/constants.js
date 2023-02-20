import { GU } from '@aragon/ui'

export const APPS_MENU_PANEL = [
  'blossom-token-wrapper',
  'blossom-tao-voting',
  'delay',
  'finance',
  'an-delay',
]

export const APPS_ROUTING = new Map([
  ['blossom-token-wrapper', 'token-wrapper'],
  ['blossom-tao-voting', 'voting'],
  ['delay', 'delay'],
  ['finance', 'finance'],
  ['an-delay', 'delay'],
])

export const APPS_ROUTING_TO_NAME = new Map([
  ['token-wrapper', 'blossom-token-wrapper'],
  ['voting', 'blossom-tao-voting'],
  ['delay', 'delay'],
  ['finance', 'finance'],
])

export const APP_CUSTOM_NAME = new Map([['Tao Voting', 'Delegate Voting']])

export const MAIN_HEADER_HEIGHT = 8 * GU

export const VOTING_REFERENCE_SEPARATOR = '|'

export const VOTING_DESCRIBED_STEP_PREFIX = 'Create a new vote about '
