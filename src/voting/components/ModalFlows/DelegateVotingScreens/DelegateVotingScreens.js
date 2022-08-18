import React, { useState, useCallback, useEffect, useMemo } from 'react'
import DelegateInitialScreen from './DelegateInitialScren'
import ModalFlowBase from '../../../../components/MultiModal/ModalFlowBase'
import BecomeADelegate from './BecomeADelegate'
import DelegateVotingPower from './DelegateVotingPower'

function DelegateVotingScreens() {
  const [delegateMode, setDelegateMode] = useState(true)

  const handleOnChooseAction = useCallback(delegate => {
    setDelegateMode(delegate)
  }, [])

  const screens = useMemo(
    () =>
      delegateMode
        ? [
            {
              title: 'Vote delegation',
              graphicHeader: false,
              content: (
                <DelegateInitialScreen onChooseAction={handleOnChooseAction} />
              ),
            },
            {
              title: 'Delegate your voting power',
              graphicHeader: false,
              content: <DelegateVotingPower />,
            },
          ]
        : [
            {
              title: 'Vote delegation',
              graphicHeader: false,
              content: (
                <DelegateInitialScreen onChooseAction={handleOnChooseAction} />
              ),
            },
            {
              title: 'Become a delegate',
              graphicHeader: false,
              content: <BecomeADelegate />,
            },
          ],
    [delegateMode, handleOnChooseAction]
  )
  return (
    <ModalFlowBase
      frontLoad
      // loading={loading}
      // transactions={transactions}
      // transactionTitle="Create proposal"
      screens={screens}
      onComplete={() => {}}
      // onCompleteActions={<GoToProposal />}
    />
  )
}

export default DelegateVotingScreens
