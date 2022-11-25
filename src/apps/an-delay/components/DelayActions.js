import React from 'react'
import { useTheme } from '@aragon/ui'

import DelayButton from './DelayButton'
import ResumeIcon from '../assets/resume.svg'
import PauseIcon from '../assets/pause.svg'

import STATUS from '../delay-status-types'
import actions from '../actions/an-delay-action.types'

const getMainActionProps = (status, theme) => {
  switch (status) {
    case STATUS.ONGOING:
      return {
        mode: 'normal',
        mainAction: actions.PAUSE_EXECUTION,
        label: 'Pause',
        beforeIcon: PauseIcon,
        css: `color: white; background-color: ${theme.purple};`,
      }
    case STATUS.PAUSED:
      return {
        mode: 'positive',
        mainAction: actions.RESUME_EXECUTION,
        label: 'Resume',
        beforeIcon: ResumeIcon,
      }
    default:
      return {
        mode: 'strong',
        mainAction: actions.EXECUTE,
        label: 'Execute',
      }
  }
}

const DelayActions = React.memo(({ status, onDelayAction }) => {
  const theme = useTheme()
  const props = getMainActionProps(status, theme)

  return (
    <div
      css={`
        width: 100%;
        display: flex;
        justify-content: space-around;
        margin-top: 16px;
      `}
    >
      <DelayButton {...props} onClick={() => onDelayAction(props.mainAction)} />
      <DelayButton
        label="Cancel"
        onClick={() => onDelayAction(actions.CANCEL_EXECUTION)}
      />
    </div>
  )
})

export default DelayActions
