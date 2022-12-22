import React from 'react'
import {
  GU,
  Button,
  Header,
  IconPlus,
  Main,
  SidePanel,
  SyncIndicator,
} from '@aragon/ui'
import { useGuiStyle } from '@/hooks/shared'
// import { ETHER_TOKEN_FAKE_ADDRESS } from './lib/token-utils'
// import { IdentityProvider } from './components/IdentityManager/IdentityManager'
import Balances from './components/Balances'
// import NewTransferPanelContent from './components/NewTransfer/PanelContent'
import Transfers from './components/Transfers'
import useBalances from './hooks/useBalances'
import NoTransfers from './components/NoTransfers'

const App = () => {
  // handleNewTransferOpen = () => {
  //   this.setState({ newTransferOpened: true })
  // }
  // handleNewTransferClose = () => {
  //   this.setState({ newTransferOpened: false })
  // }
  // handleWithdraw = (tokenAddress, recipient, amount, reference) => {
  //   // Immediate, one-time payment
  //   this.props.api
  //     .newImmediatePayment(tokenAddress, recipient, amount, reference)
  //     .toPromise() // Don't care about response
  //   this.handleNewTransferClose()
  // }
  // handleDeposit = (tokenAddress, amount, reference) => {
  //   const { api, appState } = this.props
  //   const { periodDuration, periods } = appState

  //   let intentParams
  //   if (tokenAddress === ETHER_TOKEN_FAKE_ADDRESS) {
  //     intentParams = { value: amount }
  //   } else {
  //     // Get the number of period transitions necessary; we floor because we don't need to
  //     // transition the current period
  //     const lastPeriodStart = periods[periods.length - 1].startTime
  //     const periodTransitions = Math.floor(
  //       Math.max(Date.now() - lastPeriodStart, 0) / periodDuration
  //     )

  //     intentParams = {
  //       token: { address: tokenAddress, value: amount },
  //       // While it's generally a bad idea to hardcode gas in intents, in the case of token deposits
  //       // it prevents metamask from doing the gas estimation and telling the user that their
  //       // transaction will fail (before the approve is mined).
  //       // The actual gas cost is around ~180k + 20k per 32 chars of text + 80k per period
  //       // transition but we do the estimation with some breathing room in case it is being
  //       // forwarded (unlikely in deposit).
  //       gas:
  //         450000 +
  //         20000 * Math.ceil(reference.length / 32) +
  //         80000 * periodTransitions,
  //     }
  //   }

  //   // Don't care about response
  //   api.deposit(tokenAddress, amount, reference, intentParams).toPromise()
  //   this.handleNewTransferClose()
  // }

  // handleResolveLocalIdentity = address => {
  //   return this.props.api.resolveAddressIdentity(address).toPromise()
  // }
  // handleShowLocalIdentityModal = address => {
  //   return this.props.api
  //     .requestAddressIdentityModification(address)
  //     .toPromise()
  // }

  const [tokenBalances, { loading: loadingTokens }] = useBalances()

  return (
    // <IdentityProvider
    //   onResolve={this.handleResolveLocalIdentity}
    //   onShowLocalIdentityModal={this.handleShowLocalIdentityModal}
    // >
    <>
      <Header
        primary="Finance"
        secondary={
          <Button
            mode="strong"
            onClick={() => {}}
            label="New transfer"
            icon={<IconPlus />}
          />
        }
      />
      {loadingTokens ? (
        <div
          css={`
            height: calc(100vh - ${8 * GU}px);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <NoTransfers isSyncing={loadingTokens} />
        </div>
      ) : (
        <>
          <Balances tokenBalances={tokenBalances} loading={loadingTokens} />
          <Transfers tokens={tokenBalances} />
        </>
      )}

      {/* <SidePanel
          opened={newTransferOpened}
          onClose={this.handleNewTransferClose}
          title="New transfer"
        >
          <NewTransferPanelContent
            opened={newTransferOpened}
            tokens={tokens}
            onWithdraw={this.handleWithdraw}
            onDeposit={this.handleDeposit}
          />
        </SidePanel> */}
    </>
    // </IdentityProvider>
  )
}

export default () => {
  const { appearance } = useGuiStyle()
  return (
    <Main theme={appearance} assetsUrl="./aragon-ui">
      <App />
    </Main>
  )
}
