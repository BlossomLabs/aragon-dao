import { useNetwork } from '@/hooks/shared'
import { useWallet } from '@/providers/Wallet'
import { Checkbox, GU, Link } from '@aragon/ui'
import React, { useEffect, useState } from 'react'

const PARTICIPATION_DISCLAIMER = 'ARAGON_DAO_PARTICIPATION_TERMS'
const TERMS_OF_USE_DISCLAIMER = 'ARAGON_DAO_TERMS_OF_USE'

const DISCLAIMERS = {
  [PARTICIPATION_DISCLAIMER]: {
    link:
      'https://bafybeifenxcrhkcitglsdttvkfzhrqenzjq2abqndq4eekhby4ngnj4eta.ipfs.nftstorage.link/participation.html',
    label: 'Aragon DAO Participation Agreement',
  },
  [TERMS_OF_USE_DISCLAIMER]: {
    link:
      'https://bafybeifenxcrhkcitglsdttvkfzhrqenzjq2abqndq4eekhby4ngnj4eta.ipfs.nftstorage.link/proposal.html',
    label: 'Aragon DAO Terms of Use',
  },
}

function buildLocalStorageId(type, account, chainId) {
  return `${type}_${chainId}_${account.toLowerCase()}`
}

function getLocalStorageValue(key) {
  const value = localStorage.getItem(key)

  if (value === 'false') {
    return false
  } else if (value === 'true') {
    return true
  } else {
    return false
  }
}

function DisclaimerLayout({ children, type }) {
  const { chainId } = useNetwork()
  const { account } = useWallet()

  const { link, label } = DISCLAIMERS[type]
  const localStorageId = buildLocalStorageId(type, account, chainId)
  const [isChecked, setIsChecked] = useState(
    getLocalStorageValue(localStorageId)
  )
  const childrenWithDisabled = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        disabled: child.props.disabled || !isChecked,
      })
    }
  })

  useEffect(() => {
    if (account) {
      setIsChecked(getLocalStorageValue(localStorageId))
    }
  }, [account, localStorageId])

  const toggleDisclaimer = checked => {
    localStorage.setItem(localStorageId, checked)
    setIsChecked(checked)
  }

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        gap: ${0.5 * GU}px;
      `}
    >
      {childrenWithDisabled}
      <div
        css={`
          display: flex;
          gap: ${1 * GU}px;
          align-items: center;
        `}
      >
        <Checkbox
          checked={isChecked}
          disabled={!account}
          onChange={toggleDisclaimer}
        />{' '}
        <div>
          I have read and accept the <Link href={link}>{label}</Link>.
        </div>
      </div>
    </div>
  )
}

export function ParticipationDisclaimer({ children }) {
  return (
    <DisclaimerLayout type={PARTICIPATION_DISCLAIMER}>
      {children}
    </DisclaimerLayout>
  )
}

export function TermsOfUseDisclaimer({ children }) {
  return (
    <DisclaimerLayout type={TERMS_OF_USE_DISCLAIMER}>
      {children}
    </DisclaimerLayout>
  )
}
