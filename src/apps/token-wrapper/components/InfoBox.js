import React from 'react'
import { Box, GU, TokenBadge, useTheme, textStyle } from '@aragon/ui'
import { useNetwork } from '@/hooks/shared'
import wrap from '../assets/wrap.svg'
import { fromDecimals } from '@/utils/math-utils'

function InfoBox({ depositedToken, wrappedToken }) {
  const network = useNetwork()
  const theme = useTheme()
  const depositedTokenAddress = depositedToken.address ?? depositedToken.id
  const wrappedTokenAddress = wrappedToken.address ?? wrappedToken.id
  const totalSupply = wrappedToken.totalSupply
    ? fromDecimals(
        wrappedToken.totalSupply.toString(),
        wrappedToken.numDecimals
      )
    : '0'
  const depositedTokenSymbol = depositedToken.symbol
  const wrappedTokenSymbol = wrappedToken.symbol

  return (
    <React.Fragment>
      <Box heading="Wrapped Token">
        <h2
          css={`
            ${textStyle('title4')};
            display: flex;
            justify-content: space-between;
          `}
        >
          <TokenBadge
            address={depositedTokenAddress}
            networkType={network?.type}
            symbol={depositedToken.symbol}
          />
          <span>
            <img src={wrap} />
          </span>
          <TokenBadge
            address={wrappedTokenAddress}
            networkType={network?.type}
            symbol={wrappedToken.symbol}
          />
        </h2>
        <div
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          You can wrap <strong>{depositedTokenSymbol}</strong> tokens and get{' '}
          <strong>{wrappedTokenSymbol}</strong> in exchange to use in this DAO
          for governance.
        </div>
        <div
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          You can unwrap <strong>{wrappedTokenSymbol}</strong> at any time and
          get your original tokens back.
        </div>
        <div
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          1 <strong>{depositedTokenSymbol}</strong> = 1{' '}
          <strong>{wrappedTokenSymbol}</strong>
        </div>
      </Box>
      <Box heading="Token Info">
        <ul>
          {[
            ['Wrapped supply', totalSupply],
            ['Transferable', <span css={'text-transform: uppercase'}>no</span>],
            [
              'Token',
              <TokenBadge
                address={wrappedTokenAddress}
                name={wrappedToken.name}
                networkType={network?.type}
                symbol={wrappedToken.symbol}
              />,
            ],
          ].map(([label, content], index) => (
            <li
              key={index}
              css={`
                display: flex;
                justify-content: space-between;
                list-style: none;
                color: ${theme.surfaceContent};

                & + & {
                  margin-top: ${2 * GU}px;
                }

                > span:nth-child(1) {
                  color: ${theme.surfaceContentSecondary};
                }
                > span:nth-child(2) {
                  // “:” is here for accessibility reasons, we can hide it
                  opacity: 0;
                  width: 10px;
                }
                > span:nth-child(3) {
                  flex-shrink: 1;
                }
              `}
            >
              <span>{label}</span>
              <span>:</span>
              {content}
            </li>
          ))}
        </ul>
      </Box>
    </React.Fragment>
  )
}

export default InfoBox
