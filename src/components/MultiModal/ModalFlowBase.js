import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { GU } from '@aragon/ui'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import MultiModalScreens from './MultiModalScreens'
import Stepper from '../Stepper/Stepper'
import { useWallet } from '../../providers/Wallet'
import ErrorScreen from './screens/ErrorScreen'
import SafeStep from '../SafeStep'
import { getRecommendedGasLimit } from '@/utils/tx-utils'
import { useNetwork } from '@/hooks/shared'

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
  const { connected: isSafeConnected } = useSafeAppsSDK()
  const { ethers, type } = useWallet()
  const { chainId } = useNetwork()
  const isContractSender = type === 'contract'
  const signer = useMemo(
    () => (ethers && ethers.getSigner ? ethers.getSigner() : null),
    [ethers]
  )

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
              title,
              handleSign: async ({
                setSuccess,
                setWorking,
                setError,
                setHash,
              }) => {
                try {
                  const tx = {
                    from: transaction.from,
                    to: transaction.to,
                    data: transaction.data,
                    value: transaction.value ?? undefined,
                  }

                  /**
                   * We have to perform the estimated gas calculation inside the modal flow as there may
                   * be pre-transactions that need to be executed in order to calculate the gas of the next
                   * transaction correctly.
                   */
                  let gasLimit = isContractSender
                    ? /*
                       * Specific condition for Wallet Connect usages through a Safe contract:
                       * We need to set the gas limit to 0 to avoid an issue that sets safeTxGas
                       * wrongly provoking a tx revert.
                       */
                      0
                    : await getRecommendedGasLimit(chainId, signer, tx)

                  tx.gasLimit = gasLimit

                  const txReceipt = await signer.sendTransaction(tx)

                  setHash(txReceipt.hash)

                  setWorking()

                  // We need to wait for pre-transactions to mine before asking for the next signature
                  // TODO: Provide a better user experience than waiting on all transactions
                  await txReceipt.wait()

                  setSuccess()
                } catch (err) {
                  console.error(err)
                  setError()
                }
              },
            }
          })
        : null,
    [transactions, signer, isContractSender, chainId]
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

    if (isSafeConnected) {
      // Add the Safe transaction screen
      allScreens.push({
        content: <SafeStep transactions={transactions} />,
      })
    } else if (transactionSteps) {
      // Apply transaction singing at the end
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
    screens,
    isSafeConnected,
    transactionSteps,
    transactions,
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
