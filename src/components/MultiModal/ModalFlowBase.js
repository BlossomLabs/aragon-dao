import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { GU } from '@aragon/ui'
import MultiModalScreens from './MultiModalScreens'
import Stepper from '../Stepper/Stepper'
import { useWallet } from '../../providers/Wallet'
import ErrorScreen from './screens/ErrorScreen'

const indexNumber = {
  0: 'First',
  1: 'Second',
  2: 'Third',
  3: 'Fourth',
  4: 'Fifth',
}

function ModalFlowBase({
  displayErrorScreen,
  screens,
  transactions,
  transactionTitle,
}) {
  const { ethers } = useWallet()
  const signer = useMemo(() => ethers.getSigner(), [ethers])

  const transactionSteps = useMemo(
    () =>
      transactions
        ? transactions.map((transaction, index) => {
            const title = transaction.description
              ? transaction.description
              : transactions.length === 1
              ? 'Sign transaction'
              : `${indexNumber[index]} transaction`

            return {
              // TODO: Add titles from description
              title,
              handleSign: async ({
                setSuccess,
                setWorking,
                setError,
                setHash,
              }) => {
                try {
                  const trx = {
                    from: transaction.from,
                    to: transaction.to,
                    data: transaction.data,
                    gasLimit: transaction.gasLimit,
                    value: transaction.value ?? undefined,
                  }
                  const tx = await signer.sendTransaction(trx)

                  setHash(tx.hash)

                  setWorking()

                  // We need to wait for pre-transactions to mine before asking for the next signature
                  // TODO: Provide a better user experience than waiting on all transactions
                  await tx.wait()

                  setSuccess()
                } catch (err) {
                  console.error(err)
                  setError()
                }
              },
            }
          })
        : null,
    [transactions, signer]
  )

  const extendedScreens = useMemo(() => {
    const allScreens = []

    if (displayErrorScreen) {
      return [
        {
          content: <ErrorScreen />,
        },
      ]
    }

    // Spread in our flow screens
    if (screens) {
      allScreens.push(...screens)
    }

    // Apply transaction singing at the end
    if (transactionSteps) {
      allScreens.push({
        title: transactionTitle,
        width: modalWidthFromCount(transactions.length),
        content: (
          <Stepper
            steps={transactionSteps}
            css={`
              margin-top: ${3.25 * GU}px;
              margin-bottom: ${5.5 * GU}px;
            `}
          />
        ),
      })
    }

    return allScreens
  }, [
    displayErrorScreen,
    transactions,
    screens,
    transactionSteps,
    transactionTitle,
  ])

  return <MultiModalScreens screens={extendedScreens} />
}

function modalWidthFromCount(count) {
  if (count >= 3) {
    return 865
  }

  if (count === 2) {
    return 700
  }

  // Modal will fallback to the default
  return null
}

ModalFlowBase.propTypes = {
  screens: PropTypes.array,
  transactions: PropTypes.array,
  transactionTitle: PropTypes.string,
}

ModalFlowBase.defaultProps = {
  transactionTitle: 'Create transaction',
  displayErrorScreen: false,
}

export default React.memo(ModalFlowBase)
