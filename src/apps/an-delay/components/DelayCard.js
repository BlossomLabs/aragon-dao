import React from 'react'
import styled from 'styled-components'
import { Card, GU, textStyle } from '@aragon/ui'

import CustomProgressBar from './CustomProgressBar'
import DelayStatus from '../components/DelayStatus'

import STATUS from '../delay-status-types'
import DescriptionWithSkeleton from '@/components/Description/DescriptionWithSkeleton'
import { usePath } from '@/hooks/shared'
import useDecribeScript from '@/hooks/shared/useDescribeScript'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'
import { parseContext } from '../lib/delay-utils'
import { VOTING_DESCRIBED_STEP_PREFIX } from '@/constants'

const DelayCard = React.memo(({ delay }) => {
  const [, navigate] = usePath()
  const {
    id,
    evmCallScript,
    status,
    timeSubmitted,
    totalTimePaused,
    executionTime,
    pausedAt,
  } = delay
  const { describedSteps, targetApp, loading } = useDecribeScript(
    evmCallScript,
    id
  )

  const isFromSignalingProposal =
    describedSteps.length > 0 &&
    describedSteps[0].description.indexOf(VOTING_DESCRIBED_STEP_PREFIX) !== -1

  const [title] = parseContext(describedSteps[0]?.description)

  if (isFromSignalingProposal) {
    describedSteps[0].annotatedDescription[0].value =
      VOTING_DESCRIBED_STEP_PREFIX + `"${title}"`
  }

  return (
    <CardItem onClick={() => navigate(`scripts/${id}`)}>
      <div>
        <AppBadgeWithSkeleton
          targetApp={targetApp}
          loading={loading}
          badgeOnly
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
        <DescriptionWithSkeleton
          path={describedSteps}
          itemNumber={id}
          loading={loading}
        />
      </div>
      <div>
        {status === STATUS.PENDING_EXECUTION ? (
          <DelayStatus status={delay.status} />
        ) : (
          <CustomProgressBar
            start={new Date(timeSubmitted.getTime() + totalTimePaused)}
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
