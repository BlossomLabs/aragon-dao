import React, { useCallback, useState } from 'react'
import {
  BackButton,
  Bar,
  Box,
  GU,
  Link,
  textStyle,
  Timer,
  useTheme,
  useViewport,
} from '@aragon/ui'
import { ErrorNotFound } from '@1hive/connect-react'
import DelayActions from '../components/DelayActions'
import DelayStatus from '../components/DelayStatus'
import LocalIdentityBadge from '@/components/LocalIdentityBadge/LocalIdentityBadge'

import STATUS from '../delay-status-types'
import { usePath } from '@/hooks/shared'
import { useDelayedScript } from '../hooks/useDelayedScripts'
import useDescribeScript from '@/hooks/shared/useDescribeScript'
import LayoutLimiter from '@/components/Layout/LayoutLimiter'
import MultiModal from '@/components/MultiModal/MultiModal'
import DelayActionScreens from '../components/ModalFlows/DelayActionScreens'
import { useWallet } from '@/providers/Wallet'
import LoadingSection from '@/components/Loading/LoadingSection'
import { formatTime } from '@/utils/time-utils'
import DelayHeader from '../components/DelayHeader'
import LayoutColumns from '@/components/Layout/LayoutColumns'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'
import DescriptionWithSkeleton from '@/components/Description/DescriptionWithSkeleton'
import { getReference, getTitle } from '../lib/delay-utils'

const DEFAULT_DESCRIPTION = 'No additional description provided.'
const VOTING_DESCRIBED_STEP_PREFIX = 'Create a new vote about '

const DelayDetailWrapper = ({ match }) => {
  const [, navigate] = usePath()
  const [
    delay,
    { loading: scriptLoading, error: scriptError },
  ] = useDelayedScript(match.params.id)
  const {
    describedSteps,
    targetApp,
    loading: describeLoading,
    error: describeError,
  } = useDescribeScript(delay?.evmCallScript, delay?.id)
  const loading = scriptLoading || describeLoading
  const error = scriptError || describeError
  const description =
    error instanceof ErrorNotFound
      ? "Couldn't load delayed script."
      : 'Loading delayed script.'

  return (
    <LayoutLimiter>
      <DelayHeader />
      <Bar>
        <BackButton onClick={() => navigate('../')} />
      </Bar>
      <LoadingSection
        show={loading || !!error}
        title={description}
        showSpinner={loading}
      >
        {delay && (
          <DelayDetail
            delay={delay}
            targetApp={targetApp}
            path={describedSteps}
            loading={describeLoading}
          />
        )}
      </LoadingSection>
    </LayoutLimiter>
  )
}
const DelayDetail = React.memo(({ delay, path, targetApp, loading }) => {
  const { account } = useWallet()
  const [modalVisible, setModalVisible] = useState(false)
  const [, setModalMode] = useState(null)
  const [delayAction, setDelayAction] = useState()
  const theme = useTheme()
  const { below } = useViewport()
  const compactMode = below('large')

  const { id, creator } = delay

  const handleModalClose = useCallback(() => {
    setModalVisible(false)
  }, [])

  const isFromSignalingProposal =
    path.length > 0 &&
    path[0].description.indexOf(VOTING_DESCRIBED_STEP_PREFIX) !== -1

  return (
    <>
      <LayoutColumns
        primary={
          <Box>
            <AppBadgeWithSkeleton targetApp={targetApp} />
            <section
              css={`
                display: grid;
                grid-template-columns: auto;
                grid-gap: ${2.5 * GU}px;
                margin-top: ${2.5 * GU}px;
              `}
            >
              <h1
                css={`
                  ${textStyle('title2')};
                `}
              >
                <span css="font-weight: bold;">Delay #{id}</span>
              </h1>
              <div
                css={`
                  display: grid;
                  grid-template-columns: ${!compactMode
                    ? '1fr minmax(300px, auto)'
                    : 'auto'};
                  grid-gap: ${!compactMode ? 5 * GU : 2.5 * GU}px;
                `}
              >
                <div>
                  <h2
                    css={`
                      ${textStyle('label2')};
                      color: ${theme.surfaceContentSecondary};
                      margin-bottom: ${2 * GU}px;
                    `}
                  >
                    Description
                  </h2>
                  <div
                    css={`
                      ${textStyle('body2')};
                    `}
                  >
                    {isFromSignalingProposal ? (
                      getTitle(path[0].description)
                    ) : path ? (
                      <DescriptionWithSkeleton path={path} loading={loading} />
                    ) : (
                      DEFAULT_DESCRIPTION
                    )}
                  </div>
                </div>
                <div>
                  <h2
                    css={`
                      ${textStyle('label2')};
                      color: ${theme.surfaceContentSecondary};
                      margin-bottom: ${2 * GU}px;
                    `}
                  >
                    Created By
                  </h2>
                  <div
                    css={`
                      display: flex;
                      align-items: flex-start;
                    `}
                  >
                    <LocalIdentityBadge entity={creator} />
                  </div>
                </div>
                {isFromSignalingProposal && (
                  <div>
                    <h2
                      css={`
                        ${textStyle('label2')};
                        color: ${theme.surfaceContentSecondary};
                        margin-bottom: ${2 * GU}px;
                      `}
                    >
                      Reference
                    </h2>
                    <div
                      css={`
                        ${textStyle('body2')};
                      `}
                    >
                      <Link href={getReference(path[0].description)} external>
                        {getReference(path[0].description)}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              {account && (
                <DelayActions
                  status={delay.status}
                  onDelayAction={action => {
                    setModalVisible(true)
                    setDelayAction(action)
                  }}
                />
              )}
              <MultiModal
                visible={modalVisible}
                onClose={handleModalClose}
                onClosed={() => setModalMode(null)}
              >
                <DelayActionScreens
                  delayedScript={delay}
                  action={delayAction}
                />
              </MultiModal>
            </section>
          </Box>
        }
        secondary={
          <Box heading="Status">
            <Status delay={delay} />
          </Box>
        }
      />
    </>
  )
})

function Status({ delay }) {
  const { status, executionTime, pausedAt } = delay
  const ONE_SECOND_IN_MS = 1000

  return (
    <div>
      <DelayStatus status={status} />
      <div
        css={`
          margin-top: 4px;
        `}
      >
        {status === STATUS.ONGOING && <Timer end={executionTime} />}

        {status === STATUS.PAUSED && (
          <span
            css={`
              ${textStyle('body3')};
            `}
          >
            {`${formatTime(
              (executionTime - pausedAt - ONE_SECOND_IN_MS) / ONE_SECOND_IN_MS
            )} remaining`}
          </span>
        )}
      </div>
    </div>
  )
}

export default DelayDetailWrapper
