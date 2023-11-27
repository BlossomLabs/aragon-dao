import AN_DELAY_ACTION_TYPES from '@/apps/an-delay/actions/an-delay-action.types'
import VOTINGACTIONTYPES from '@/apps/voting/actions/voting-action-types'
import FINANCEACTIONTYPES from '@/apps/finance/actions/finance-action-types'

export default {
  ...AN_DELAY_ACTION_TYPES,
  ...VOTINGACTIONTYPES,
  ...FINANCEACTIONTYPES,
}
