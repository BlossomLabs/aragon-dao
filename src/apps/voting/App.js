import React, { useCallback, useEffect, useState } from 'react'
import { Button, GU, IconPlus, IconToken, Tabs, useViewport } from '@aragon/ui'
import { constants } from 'ethers'

import { useUserState } from './providers/User'
import MultiModal from '../../components/MultiModal/MultiModal'
import DelegateVotingScreens from './components/ModalFlows/DelegateVotingScreens/DelegateVotingScreens'
import useFilterVotes from './hooks/useFilterVotes'
import useScrollTop from './hooks/useScrollTop'
import Votes from './screens/Votes'
import DelegatedBy from './components/DelegatedBy'
import { useAppLogic } from './app-logic'
import { useWallet } from '../../providers/Wallet'
import RevokeDelegationScreens from './components/ModalFlows/RevokeDelegation/RevokeDelegationScreens'
import CreateVoteScreens from './components/ModalFlows/NewVote/CreateVoteScreens'
import { useAppState } from './providers/VotingProvider'
import { addressesEqual } from '@/utils/web3-utils'
import AppHeader from '@/components/AppHeader'
import LoadingAppScreen from '@/components/Loading/LoadingAppScreen'
import { useWait } from '@/hooks/shared/useWait'
import noVotesPng from './assets/no-votes.png'
import { APP_TYPES } from '@/app-types'
import { capitalizeFirstLetter } from '@/utils/format'

const getTabItems = (account, isGovernanceVoting) =>
  account && isGovernanceVoting ? ['Votes', 'Your Delegators'] : ['Votes']

const App = React.memo(function App() {
  const [selectedTab, setSelectedTab] = useState(0)
  const { account } = useWallet()

  const [modalMode, setModalMode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const {
    executionTargets,
    isSyncing: isAppSyncing,
    selectVote,
    selectedVote,
    votes,
  } = useAppLogic()
  const { user, userStatus } = useUserState()
  const { representativeManager, type } = useAppState()
  const { below } = useViewport()
  const isWaiting = useWait()
  const compactMode = below('medium')
  const isLoading = isAppSyncing || isWaiting
  const noVotes = votes?.length === 0
  const isGovernanceVoting =
    !!representativeManager &&
    addressesEqual(representativeManager, constants.AddressZero)
  const showDelegateButton =
    account && !userStatus.loading && isGovernanceVoting
  const increaseCardHegiht =
    account && !isLoading && type === APP_TYPES.GOVERNANCE
  const votingType = capitalizeFirstLetter(type)

  const handleShowModal = useCallback(mode => {
    setModalVisible(true)
    setModalMode(mode)
  }, [])

  const handleNewVote = useCallback(() => {
    handleShowModal('newVote')
  }, [handleShowModal])

  const handleHideModal = useCallback(() => {
    setModalVisible(false)
  }, [])

  const {
    filteredVotes,
    voteStatusFilter,
    handleVoteStatusFilterChange,
    voteOutcomeFilter,
    handleVoteOutcomeFilterChange,
    voteTrendFilter,
    handleVoteTrendFilterChange,
    voteAppFilter,
    handleVoteAppFilterChange,
    voteDateRangeFilter,
    handleVoteDateRangeFilterChange,
    handleClearFilters,
  } = useFilterVotes(votes, executionTargets)

  useScrollTop(selectedVote)

  // Go to available tab when account disconnects
  useEffect(() => {
    if (!account) {
      setSelectedTab(0)
    }
  }, [account])

  return (
    <>
      <React.Fragment>
        {noVotes || isLoading ? (
          <LoadingAppScreen
            isLoading={isLoading}
            emptyStateLabel={noVotes ? 'No proposals yet' : 'Loaded'}
            action={
              account ? (
                <div
                  css={`
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: ${1 * GU}px;
                  `}
                >
                  {showDelegateButton && (
                    <DelegationButton user={user} onClick={handleShowModal} />
                  )}
                  <Button
                    wide
                    mode="strong"
                    onClick={handleNewVote}
                    css={`
                      ${type ? 'height: 50px;' : ''}
                    `}
                  >
                    <>
                      Create a new {type && <br />}
                      {type?.toLowerCase()} proposal
                    </>
                  </Button>
                </div>
              ) : null
            }
            illustration={
              <img
                css={`
                  margin: auto;
                  height: 170px;
                `}
                src={noVotesPng}
                alt="No proposal here"
              />
            }
            css={
              increaseCardHegiht
                ? `
              height: 380px;
            `
                : ''
            }
          />
        ) : (
          <React.Fragment>
            <AppHeader
              primary="Voting"
              secondary={
                !selectedVote && (
                  <>
                    {showDelegateButton && (
                      <DelegationButton
                        compactMode={compactMode}
                        user={user}
                        onClick={handleShowModal}
                        css={`
                          margin-right: ${1 * GU}px;
                        `}
                      />
                    )}
                    {account && (
                      <Button
                        mode="strong"
                        onClick={handleNewVote}
                        label={`New ${votingType} Proposal`}
                        icon={<IconPlus />}
                        display={compactMode ? 'icon' : 'label'}
                      />
                    )}
                  </>
                )
              }
            />
            <Tabs
              items={getTabItems(account, isGovernanceVoting)}
              onChange={setSelectedTab}
              selected={selectedTab}
            />
            {selectedTab === 0 ? (
              <Votes
                votes={votes}
                selectVote={selectVote}
                executionTargets={executionTargets}
                filteredVotes={filteredVotes}
                voteStatusFilter={voteStatusFilter}
                handleVoteStatusFilterChange={handleVoteStatusFilterChange}
                voteOutcomeFilter={voteOutcomeFilter}
                handleVoteOutcomeFilterChange={handleVoteOutcomeFilterChange}
                voteTrendFilter={voteTrendFilter}
                handleVoteTrendFilterChange={handleVoteTrendFilterChange}
                voteAppFilter={voteAppFilter}
                handleVoteAppFilterChange={handleVoteAppFilterChange}
                voteDateRangeFilter={voteDateRangeFilter}
                handleVoteDateRangeFilterChange={
                  handleVoteDateRangeFilterChange
                }
                handleClearFilters={handleClearFilters}
              />
            ) : (
              account && <DelegatedBy />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
      <MultiModal
        visible={modalVisible}
        onClose={handleHideModal}
        onClosed={() => setModalMode(null)}
      >
        {modalMode === 'delegate' && <DelegateVotingScreens />}
        {modalMode === 'revoke' && <RevokeDelegationScreens />}
        {modalMode === 'newVote' && <CreateVoteScreens />}
      </MultiModal>
    </>
  )
})

function DelegationButton({ user, onClick, compactMode, ...props }) {
  return (
    <Button
      mode="normal"
      onClick={() => onClick(user?.representative ? 'revoke' : 'delegate')}
      label={user?.representative ? 'Revoke Delegation' : 'Vote Delegation'}
      icon={<IconToken />}
      display={compactMode ? 'icon' : 'label'}
      {...props}
    />
  )
}

export default () => <App />
