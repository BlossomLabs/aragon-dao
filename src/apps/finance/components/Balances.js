import React, { useMemo } from 'react'
import BN from 'bn.js'
import { Box, GU, textStyle, useTheme, useViewport } from '@aragon/ui'
import BalanceToken from './BalanceToken'
import { getConvertedAmount } from '../lib/conversion-utils'
import { useConvertRates } from './useConvertRates'

// Prepare the balances for the BalanceToken component
function useBalanceItems(balances) {
  const symbols = balances.map(({ symbol }) => symbol)

  const convertRates = useConvertRates(symbols)

  const balanceItems = useMemo(() => {
    return balances.map(({ address, balance, decimals, symbol }) => {
      return {
        address,
        balance,
        convertedAmount: convertRates[symbol]
          ? getConvertedAmount(balance, convertRates[symbol], decimals)
          : new BN('-1'),
        decimals,
        symbol,
      }
    })
  }, [balances, convertRates])
  return balanceItems
}

function Balances({ tokenBalances, loading }) {
  const theme = useTheme()
  const { below } = useViewport()
  const balanceItems = useBalanceItems(tokenBalances)

  const compact = below('medium')
  return (
    <div>
      <Box heading="Token Balances" padding={0}>
        <div
          css={`
            padding: ${(compact ? 1 : 2) * GU}px;
          `}
        >
          <div
            css={`
              display: flex;
              align-items: center;
              min-height: ${14 * GU}px;
              overflow-x: auto;
              padding: ${1 * GU}px;
            `}
          >
            {loading || balanceItems.length === 0 ? (
              <div
                css={`
                  display: flex;
                  width: 100%;
                  justify-content: center;
                  ${textStyle('body1')};
                  color: ${theme.content};
                `}
              >
                No token balances yet.
              </div>
            ) : (
              <ul
                css={`
                  list-style: none;
                  display: flex;
                  ${compact
                    ? `
                    flex-direction: column;
                    padding: ${1 * GU}px 0;
                  `
                    : ''}
                `}
              >
                {balanceItems.map(
                  ({ address, balance, convertedAmount, decimals, symbol }) => (
                    <li
                      key={address}
                      css={`
                        flex-shrink: 0;
                        display: block;
                        min-width: ${20 * GU}px;
                        padding-right: ${4 * GU}px;
                        ${compact ? `margin-bottom: ${3 * GU}px;` : ''}
                        &:last-of-type {
                          min-width: unset;
                          margin-bottom: 0;
                        }
                      `}
                    >
                      <BalanceToken
                        address={address}
                        amount={balance}
                        compact={compact}
                        convertedAmount={convertedAmount}
                        decimals={decimals}
                        symbol={symbol}
                      />
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>
      </Box>
    </div>
  )
}

export default Balances
