import React, { useCallback, useState } from 'react'
import {
  Button,
  GU,
  IconPlus,
  IconToken,
  SyncIndicator,
  Tabs,
  useViewport,
} from '@aragon/ui'

import { useVoterState } from './providers/VoterProvider'
import MultiModal from '../../components/MultiModal/MultiModal'
import DelegateVotingScreens from './components/ModalFlows/DelegateVotingScreens/DelegateVotingScreens'
import useFilterVotes from './hooks/useFilterVotes'
import useScrollTop from './hooks/useScrollTop'
import NoVotes from './screens/NoVotes'
import Votes from './screens/Votes'
import DelegatedBy from './components/DelegatedBy'
import { useAppLogic } from './app-logic'
import { SettingsProvider } from './vote-settings-manager'
import { useWallet } from '../../providers/Wallet'
import RevokeDelegationScreens from './components/ModalFlows/RevokeDelegation/RevokeDelegationScreens'
import CreateVoteScreens from './components/ModalFlows/NewVote/CreateVoteScreens'
import { useAppState } from './providers/VotingProvider'
import { addressesEqual } from '@/utils/web3-utils'
import { constants } from 'ethers'
import AppHeader from '@/components/AppHeader'

const TAB_ITEMS = account => (account ? ['Votes', 'Delegated'] : ['Votes'])

// const VALUES = Array.from(SECTIONS.values())

const App = React.memo(function App() {
  const [selectedTab, setSelectedTab] = useState(0)
  const { account } = useWallet()

  const [modalMode, setModalMode] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const {
    executionTargets,
    isSyncing,
    newVotePanel,
    selectVote,
    selectedVote,
    votes,
  } = useAppLogic()
  const { voter, voterStatus } = useVoterState()
  const { representativeManager } = useAppState()
  const showDelegateButton =
    account &&
    !voterStatus.loading &&
    !!representativeManager &&
    addressesEqual(representativeManager, constants.AddressZero)

  const { below } = useViewport()
  const compactMode = below('medium')

  const handleShowModal = useCallback(mode => {
    setModalVisible(true)
    setModalMode(mode)
  }, [])

  const handleRevokeDelegation = useCallback(() => {
    handleShowModal('revoke')
  }, [handleShowModal])

  const handleDelegate = useCallback(() => {
    handleShowModal('delegate')
  }, [handleShowModal])

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

  return (
    <>
      <React.Fragment>
        {votes.length === 0 && (
          <div
            css={`
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <NoVotes
              onNewVote={newVotePanel.requestOpen}
              isSyncing={isSyncing}
            />
          </div>
        )}
        {votes.length > 0 && (
          <React.Fragment>
            <SyncIndicator visible={isSyncing} shift={50} />
            <AppHeader
              primary="Voting"
              secondary={
                !selectedVote && (
                  <>
                    {showDelegateButton && (
                      <Button
                        mode="normal"
                        onClick={() =>
                          setModalMode(
                            voter?.representative
                              ? handleRevokeDelegation
                              : handleDelegate
                          )
                        }
                        label={
                          voter?.representative
                            ? 'Revoke Delegation'
                            : 'Vote Delegation'
                        }
                        icon={<IconToken />}
                        display={compactMode ? 'icon' : 'label'}
                        css={`
                          margin-right: ${1 * GU}px;
                        `}
                      />
                    )}
                    <Button
                      mode="strong"
                      onClick={handleNewVote}
                      label="New vote"
                      icon={<IconPlus />}
                      display={compactMode ? 'icon' : 'label'}
                    />
                  </>
                )
              }
            />
            <Tabs
              items={TAB_ITEMS(account)}
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

export default () => (
  <SettingsProvider>
    <App />
  </SettingsProvider>
)
