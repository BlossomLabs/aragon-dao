import { useNetwork } from '@/hooks/shared'
import { useWallet } from '@/providers/Wallet'
import { Checkbox, GU, Link } from '@aragon/ui'
import React, { useEffect, useState } from 'react'

const PARTICIPATION_DISCLAIMER = 'ARAGON_DAO_PARTICIPATION_TERMS'
const TERMS_OF_USE_DISCLAIMER = 'ARAGON_DAO_TERMS_OF_USE'
const FINANCIAL_COMPLIANCE_FORM = 'ARAGON_DAO_FINANCIAL_COMPLIANCE_FORM'

const DISCLAIMERS = {
  [PARTICIPATION_DISCLAIMER]: {
    text: 'I have read and accept the %s.',
    link:
      'https://bafybeifenxcrhkcitglsdttvkfzhrqenzjq2abqndq4eekhby4ngnj4eta.ipfs.nftstorage.link/participation.html',
    label: 'Aragon DAO Participation Agreement',
  },
  [TERMS_OF_USE_DISCLAIMER]: {
    text: 'I have read and accept the %s.',
    link:
      'https://bafybeifenxcrhkcitglsdttvkfzhrqenzjq2abqndq4eekhby4ngnj4eta.ipfs.nftstorage.link/proposal.html',
    label: 'Aragon DAO Terms of Use',
  },
  [FINANCIAL_COMPLIANCE_FORM]: {
    text: 'I have completed a %s for this Withdraw Request.',
    link: 'https://aragonassociation.typeform.com/to/OzRifY1N',
    label: 'Financial Compliance Form',
    startUnchecked: true,
  },
}

function buildLocalStorageId(type, account, chainId) {
  // We do not save on localStorage if we always start unchecked
  if (DISCLAIMERS[type].startUnchecked) {
    return null
  }
  return `${type}_${chainId}_${account.toLowerCase()}`
}

function getLocalStorageValue(key) {
  if (key === null) {
    return false
  }

  const value = localStorage.getItem(key)

  if (value === 'false') {
    return false
  } else if (value === 'true') {
    return true
  } else {
    return false
  }
}

function DisclaimerCheckbox({ type, isChecked, toggleCheckbox }) {
  const { account } = useWallet()
  const { link, label, text } = DISCLAIMERS[type]
  const [pre, post] = text.split('%s')

  return (
    <div
      css={`
        display: flex;
        gap: ${1 * GU}px;
        align-items: center;
      `}
    >
      <label>
        <Checkbox
          checked={isChecked}
          disabled={!account}
          onChange={toggleCheckbox}
        />{' '}
        {pre}
        <Link href={link}>{label}</Link>
        {post}
      </label>
    </div>
  )
}

export function DisclaimerLayout({ children, types }) {
  const { chainId } = useNetwork()
  const { account } = useWallet()
  const localStorageIds = types.map(type =>
    buildLocalStorageId(type, account, chainId)
  )
  const [areChecked, setAreChecked] = useState(
    localStorageIds.map(getLocalStorageValue)
  )

  // Check if all members of array are true
  const allChecked = areChecked.every(isTrue => isTrue)

  // Save in localStorage and update state
  const toggleCheckbox = i => checked => {
    localStorage.setItem(localStorageIds[i], checked)
    const newAreChecked = [...areChecked]
    newAreChecked[i] = checked
    setAreChecked(newAreChecked)
  }

  useEffect(() => {
    // If we change the account, we need to update the localStorageIds and the state
    if (account) {
      const newLocalStorageIds = types.map(type =>
        buildLocalStorageId(type, account, chainId)
      )
      const newAreChecked = newLocalStorageIds.map(getLocalStorageValue)
      setAreChecked(newAreChecked)
    }
  }, [account, chainId, types])

  const childrenWithDisabled = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        disabled: child.props.disabled || !allChecked,
      })
    }
  })

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        gap: ${0.5 * GU}px;
        margin-top: ${2 * GU}px;
      `}
    >
      {types.map((type, i) => (
        <DisclaimerCheckbox
          key={i}
          type={type}
          isChecked={areChecked[i]}
          toggleCheckbox={toggleCheckbox(i)}
        />
      ))}
      {childrenWithDisabled}
    </div>
  )
}

export function ParticipationDisclaimer({ children }) {
  return (
    <DisclaimerLayout types={[PARTICIPATION_DISCLAIMER]}>
      {children}
    </DisclaimerLayout>
  )
}

export function TermsOfUseDisclaimer({ children }) {
  return (
    <DisclaimerLayout types={[TERMS_OF_USE_DISCLAIMER]}>
      {children}
    </DisclaimerLayout>
  )
}

export function FinancialComplianceFormDisclaimer({ children }) {
  return (
    <DisclaimerLayout
      types={[TERMS_OF_USE_DISCLAIMER, FINANCIAL_COMPLIANCE_FORM]}
    >
      {children}
    </DisclaimerLayout>
  )
}
