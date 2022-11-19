import AN_DELAY_ACTION_TYPES from '../an-delay/actions/an-delay-action.types'
import VOTINGACTIONTYPES from '../voting/actions/voting-action-types'
import TOKENWRAPPERACTIONTYPES from '../token-wrapper/actions/token-action-types'

export default {
  ...AN_DELAY_ACTION_TYPES,
  ...VOTINGACTIONTYPES,
  ...TOKENWRAPPERACTIONTYPES,
}
