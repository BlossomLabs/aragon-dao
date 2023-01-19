export const DEFAULT_CHAIN_ID = 100

export const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

export const APPS_MENU_PANEL = [
  'blossom-token-wrapper',
  'blossom-tao-voting',
  'delay',
  'finance',
  'an-delay',
]

export const APPS_ROUTING = new Map([
  ['blossom-token-wrapper', 'wrapper'],
  ['blossom-tao-voting', 'voting'],
  ['delay', 'delay'],
  ['finance', 'finance'],
  ['an-delay', 'delay'],
])

export const APPS_ROUTING_TO_NAME = new Map([
  ['wrapper', 'blossom-token-wrapper'],
  ['voting', 'blossom-tao-voting'],
  ['delay', 'delay'],
  ['finance', 'finance'],
])

export const APPS_PANEL_INSTANCE_NAMES = new Map([
  ['0x2c7109166a3c1d306c51aa092445095254dbb99f', 'Budget'],
  ['0xb33d312b5399a82dda9230b343870c2e00fb9953', 'Governance'],
  ['0xefbcfb2769ad581a95ee2dd951e1cb7043dac0bf', 'Governance'],
  ['0xe44c38ff322f7790d2856510877f48a3a0d7595f', 'Budget'],
])

export const APP_CUSTOM_NAME = new Map([['Tao Voting', 'Delegate Voting']])
