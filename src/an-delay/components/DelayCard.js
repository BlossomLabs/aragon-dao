import React from 'react'
import styled from 'styled-components'
import { Card, GU, textStyle } from '@aragon/ui'

import CustomProgressBar from './CustomProgressBar'
import DelayStatus from '../components/DelayStatus'
import LocalLabelAppBadge from '../components/LocalIdentityBadge/LocalLabelAppBadge'

import STATUS from '../delay-status-types'
import DescriptionWithSkeleton from './Description/DescriptionWithSkeleton'
import { usePath } from '../hooks/shared'
import useDecribeScript from '../hooks/useDescribeScript'

const DelayCard = React.memo(({ delay }) => {
  const [, navigate] = usePath()
  const {
    id,
    evmCallScript,
    executionTargetData,
    status,
    timeSubmitted,
    totalTimePaused,
    executionTime,
    pausedAt,
  } = delay
  const [describedSteps, { loading }] = useDecribeScript(evmCallScript, id)

  return (
    <CardItem onClick={() => navigate(`/delay/scripts/${id}`)}>
      <div>
        <LocalLabelAppBadge
          appAddress={executionTargetData.address}
          iconSrc={executionTargetData.iconSrc}
          identifier={executionTargetData.identifier}
          label={executionTargetData.name}
        />
      </div>
      <div
        css={`
          // overflow-wrap:anywhere and hyphens:auto are not supported yet by
          // the latest versions of Safari (as of June 2020), which
          // is why word-break:break-word has been added here.
          hyphens: auto;
          overflow-wrap: anywhere;
          word-break: break-word;
          ${textStyle('body2')};
          height: ${27 * 3}px; // 27px * 3 = line-height * 3 lines
          line-height: ${27}px; // 27px = line-height of textstyle('body1')
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        `}
      >
        <DescriptionWithSkeleton path={describedSteps} loading={loading} />
      </div>
      <div>
        {status === STATUS.PENDING_EXECUTION ? (
          <DelayStatus status={delay.status} />
        ) : (
          <CustomProgressBar
            start={timeSubmitted + totalTimePaused}
            endDate={executionTime}
            pausedAt={pausedAt}
          />
        )}
      </div>
    </CardItem>
  )
})

const CardItem = styled(Card)`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr auto;
  grid-gap: ${1 * GU}px;
  padding: ${3 * GU}px;
  box-shadow: rgba(51, 77, 117, 0.2) 0px 1px 3px;
  border: 0;
  cursor: pointer;
`

export default DelayCard
