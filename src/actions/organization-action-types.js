import AN_DELAY_ACTION_TYPES from '@/apps/an-delay/actions/an-delay-action.types'
import TOKENWRAPPERACTIONTYPES from '@/apps/token-wrapper/actions/token-action-types'
import VOTINGACTIONTYPES from '@/apps/voting/actions/voting-action-types'

export default {
  ...AN_DELAY_ACTION_TYPES,
  ...VOTINGACTIONTYPES,
  ...TOKENWRAPPERACTIONTYPES,
}
