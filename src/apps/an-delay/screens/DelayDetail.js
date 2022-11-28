import React, { useState } from 'react'
import {
  BackButton,
  Bar,
  Box,
  GU,
  Split,
  textStyle,
  Timer,
  useLayout,
  useTheme,
} from '@aragon/ui'
import { ErrorNotFound } from '@1hive/connect-react'
import DelayActions from '../components/DelayActions'
import DelayStatus from '../components/DelayStatus'
import LocalIdentityBadge from '@/components/LocalIdentityBadge/LocalIdentityBadge'
import LocalLabelAppBadge from '@/components/LocalIdentityBadge/LocalLabelAppBadge'

import STATUS from '../delay-status-types'
import { formatTime } from '../lib/math-utils'
import { usePath } from '@/hooks/shared'
import { useDelayedScript } from '../hooks/useDelayedScripts'
import useDescribeScript from '@/hooks/shared/useDescribeScript'
import Description from '@/components/Description'
import LayoutLimiter from '@/components/Layout/LayoutLimiter'
import MultiModal from '@/components/MultiModal/MultiModal'
import DelayActionScreens from '../components/ModalFlows/DelayActionScreens'
import { useWallet } from '@/providers/Wallet'
import LoadingSection from '@/components/Loading/LoadingSection'

const DEFAULT_DESCRIPTION = 'No additional description provided.'

const DelayDetailWrapper = ({ match }) => {
  const [, navigate] = usePath()
  const [
    delay,
    { loading: scriptLoading, error: scriptError },
  ] = useDelayedScript(match.params.id)
  const {
    describedSteps,
    loading: describeLoading,
    error: describeError,
  } = useDescribeScript(delay?.evmCallScript, delay?.id)
  const loading = scriptLoading || describeLoading
  const error = scriptError || describeError
  const description =
    error instanceof ErrorNotFound
      ? 'Delayed script not found'
      : 'Loading delayed script'

  return (
    <LayoutLimiter>
      <Bar>
        <BackButton onClick={() => navigate('/delay/scripts')} />
      </Bar>
      <LoadingSection
        show={loading || !!error}
        title={description}
        showSpinner={loading}
      >
        {delay && <DelayDetail delay={delay} path={describedSteps} />}
      </LoadingSection>
    </LayoutLimiter>
  )
}
const DelayDetail = React.memo(({ delay, path }) => {
  const { account } = useWallet()
  const [modalVisible, setModalVisible] = useState(false)
  const [, setModalMode] = useState(null)
  const [delayAction, setDelayAction] = useState()
  const theme = useTheme()
  const { layoutName } = useLayout()

  const { id, creator, executionTargetData } = delay

  return (
    <>
      <Split
        primary={
          <Box>
            <LocalLabelAppBadge
              appAddress={executionTargetData.address}
              iconSrc={executionTargetData.iconSrc}
              // TODO: find proper identifier
              // identifier={executionTargetData.identifier}
              label={executionTargetData.name}
            />
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
                  grid-template-columns: ${layoutName === 'large'
                    ? '1fr minmax(300px, auto)'
                    : 'auto'};
                  grid-gap: ${layoutName === 'large' ? 5 * GU : 2.5 * GU}px;
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
                    {path ? (
                      <Description path={path} />
                    ) : (
                      // TODO: Improve default description (include execution target's data)
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
                onClose={() => setModalVisible(false)}
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
