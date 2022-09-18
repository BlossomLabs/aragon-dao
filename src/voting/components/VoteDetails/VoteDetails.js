import React, { useMemo, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  GU,
  IconCheck,
  IconLock,
  IdentityBadge,
  Link,
  Tag,
  TokenAmount,
  textStyle,
  useLayout,
  useTheme,
} from '@aragon/ui'
import DisputableActionStatus from './DisputableActionStatus'
import DisputableStatusLabel from '../DisputableStatusLabel'
import {
  VOTE_CANCELLED,
  VOTE_SCHEDULED,
  VOTE_SETTLED,
  VOTE_DISPUTED,
  VOTE_CHALLENGED,
} from '../../types/disputable-statuses'
import InfoField from '../InfoField'
import InfoBoxes from './InfoBoxes'
import LayoutColumns from '../../../components/Layout/LayoutColumns'
import LayoutBox from '../../../components/Layout/LayoutBox'
import { safeDiv } from '../../math-utils'
import SummaryBar from './SummaryBar'
import SummaryRow from './SummaryRow'
import StatusInfo from './StatusInfo'
import FeedbackModule from './FeedbackModule'
import Description from '../Description'
import VoteActions from './VoteActions'
import VoteCast from './VoteCast'
import TargetAppBadge from '../TargetAppBadge'
import { addressesEqual } from '../../web3-utils'
import { getIpfsUrlFromUri } from '../../../utils/ipfs-utils'
import { useDescribeVote } from '../../hooks/useDescribeVote'
import LoadingSkeleton from '../Loading/LoadingSkeleton'
import { useWallet } from '../../../providers/Wallet'
import MultiModal from '../../../components/MultiModal/MultiModal'
import VoteScreens from '../../components/ModalFlows/VoteScreens/VoteScreens'
import useActions from '../../hooks/useActions'

function getPresentation(disputableStatus) {
  const disputablePresentation = {
    [VOTE_CANCELLED]: {
      boxPresentation: 'disabled',
      disabledProgressBars: true,
    },
    [VOTE_SETTLED]: {
      boxPresentation: 'disabled',
      disabledProgressBars: true,
    },
    [VOTE_CHALLENGED]: {
      boxPresentation: 'warning',
      disabledProgressBars: true,
    },
    [VOTE_DISPUTED]: {
      boxPresentation: 'negative',
      disabledProgressBars: true,
    },
  }

  return disputablePresentation[disputableStatus] || {}
}

function VoteDetails({ vote }) {
  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState({})
  const [modalMode, setModalMode] = useState(null)
  const [voteSupported, setVoteSupported] = useState(false)
  const { voteId, id, script, voterInfo, votingToken, disputableStatus } = vote
  const { votingActions } = useActions()
  console.log('vote!!! ', vote)

  const { description, targetApp, loading, emptyScript } = useDescribeVote(
    script,
    id
  )

  const { boxPresentation, disabledProgressBars } = useMemo(
    () => getPresentation(disputableStatus),
    [disputableStatus]
  )

  const handleVote = useCallback(data => {
    setModalVisible(true)
    setModalData(data)
  }, [])

  const handleExecute = useCallback(() => {
    votingActions.executeVote(voteId, script)
  }, [votingActions, voteId, script])

  const accountHasVoted = voterInfo && voterInfo.hasVoted
  const showVoteActions = !accountHasVoted

  return (
    <>
      <LayoutColumns
        primary={
          <LayoutBox primary mode={boxPresentation}>
            <div
              css={`
                display: grid;
                grid-auto-flow: row;

                grid-gap: ${4 * GU}px;
              `}
            >
              <div
                css={`
                  display: flex;
                  justify-content: space-between;
                `}
              >
                <TargetAppBadge
                  useDefaultBadge={emptyScript}
                  targetApp={targetApp}
                  loading={loading}
                />
                {accountHasVoted && (
                  <Tag icon={<IconCheck size="small" />} label="Voted" />
                )}
              </div>
              <h1
                css={`
                  ${textStyle('title2')};
                  font-weight: bold;
                `}
              >
                Vote #{voteId}
              </h1>
              <Details
                vote={vote}
                disputableStatus={disputableStatus}
                emptyScript={emptyScript}
                description={description}
                descriptionLoading={loading}
              />
              <SummaryInfo
                vote={vote}
                disabledProgressBars={disabledProgressBars}
              />
              {accountHasVoted && (
                <VoteCast voteSupported={voterInfo.supports} vote={vote} />
              )}
              {!vote.hasEnded && (
                <VoteActions
                  vote={vote}
                  onVote={handleVote}
                  onExecute={handleExecute}
                />
              )}
            </div>
          </LayoutBox>
        }
        secondary={
          <>
            <DisputableActionStatus vote={vote} />
            <InfoBoxes
              vote={vote}
              disabledProgressBars={disabledProgressBars}
            />
          </>
        }
      />
      <MultiModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onClosed={() => setModalMode(null)}
      >
        <VoteScreens vote={vote} {...modalData} />
      </MultiModal>
    </>
  )
}

/* eslint-disable react/prop-types */
function Details({
  vote,
  disputableStatus,
  descriptionLoading,
  emptyScript,
  description,
}) {
  const { context, creator } = vote

  const { layoutName } = useLayout()

  const twoColumnMode = layoutName === 'max'

  const justificationUrl = useMemo(
    () => (context.startsWith('ipfs') ? getIpfsUrlFromUri(context) : null),
    [context]
  )

  return (
    <div
      css={`
        display: grid;
        grid-template-columns: ${twoColumnMode ? `1fr ${30 * GU}px` : '1fr'};
        grid-gap: ${3 * GU}px;
      `}
    >
      {emptyScript ? (
        <InfoField label="Description">
          <p>{context}</p>
        </InfoField>
      ) : (
        <div>
          <InfoField label="Description">
            <DescriptionWithSkeleton
              description={description}
              loading={descriptionLoading}
            />
          </InfoField>

          <InfoField
            label="Justification"
            css={`
              margin-top: ${3 * GU}px;
            `}
          >
            {justificationUrl ? (
              <Link
                href={justificationUrl}
                css={`
                  max-width: 90%;
                `}
              >
                <span
                  css={`
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: left;
                  `}
                >
                  Read more
                </span>
              </Link>
            ) : (
              <p>{context}</p>
            )}
          </InfoField>
        </div>
      )}

      <InfoField label="Status">
        <DisputableStatusLabel status={disputableStatus} />
      </InfoField>
      <InfoField label="Submitted By">
        <div
          css={`
            display: flex;
            align-items: flex-start;
          `}
        >
          <IdentityBadge entity={creator} />
        </div>
      </InfoField>
    </div>
  )
}

function DescriptionWithSkeleton({ description, loading }) {
  if (loading) {
    return (
      <>
        <LoadingSkeleton
          css={`
            width: 95%;
          `}
        />
        <LoadingSkeleton
          css={`
            width: 70%;
          `}
        />
        <LoadingSkeleton
          css={`
            width: 35%;
          `}
        />
      </>
    )
  }

  return <Description path={description} />
}

function SummaryInfo({ vote, disabledProgressBars }) {
  const { account: connectedAccount } = useWallet()
  const theme = useTheme()

  const { yeas, nays, settledAt } = vote
  const totalVotes = parseFloat(yeas) + parseFloat(nays)
  const yeasPct = safeDiv(parseFloat(yeas), totalVotes)
  const naysPct = safeDiv(parseFloat(nays), totalVotes)

  let mode = null

  if (vote.challenger && addressesEqual(vote.challenger, connectedAccount)) {
    mode = 'challenger'
  }

  if (addressesEqual(vote.creator, connectedAccount) && settledAt > 0) {
    mode = 'submitter'
  }

  return (
    <div>
      <InfoField label="Votes">
        <SummaryBar
          disabledProgressBars={disabledProgressBars}
          positiveSize={yeasPct}
          negativeSize={naysPct}
          requiredSize={
            parseFloat(vote.settings.formattedMinimumAcceptanceQuorumPct) / 100
          }
          css={`
            margin-bottom: ${2 * GU}px;
          `}
        />
        <div
          css={`
            display: inline-block;
          `}
        >
          <SummaryRow
            color={disabledProgressBars ? theme.surfaceOpened : theme.positive}
            label="Yes"
            pct={yeasPct * 100}
            token={{
              amount: yeas,
              symbol: vote.votingToken.symbol,
              decimals: vote.votingToken.decimals,
            }}
          />
          <SummaryRow
            color={disabledProgressBars ? theme.controlUnder : theme.negative}
            label="No"
            pct={naysPct * 100}
            token={{
              amount: nays,
              symbol: vote.votingToken.symbol,
              decimals: vote.votingToken.decimals,
            }}
          />
        </div>
      </InfoField>

      {mode && (
        <FeedbackModule
          vote={vote}
          connectedAccount={connectedAccount}
          mode={mode}
        />
      )}
      <StatusInfo vote={vote} />
    </div>
  )
}
/* eslint-disable react/prop-types */

VoteDetails.propTypes = {
  vote: PropTypes.object,
}

export default VoteDetails
