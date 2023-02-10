import { useNetwork } from '@/hooks/shared'
import { useWallet } from '@/providers/Wallet'
import { Checkbox, GU, Link } from '@aragon/ui'
import React, { useEffect, useState } from 'react'

const PARTICIPATION_DISCLAIMER = 'ARAGON_DAO_PARTICIPATION_TERMS'
const TERMS_OF_USE_DISCLAIMER = 'ARAGON_DAO_TERMS_OF_USE'
const FINANCIAL_COMPLIANCE_FORM = 'ARAGON_DAO_FINANCIAL_COMPLIANCE_FORM'

const PLACEHOLDER = '%s'

const DISCLAIMERS = {
  [PARTICIPATION_DISCLAIMER]: {
    text: `I have read and accept the ${PLACEHOLDER}.`,
    link:
      'https://bafybeidgxjx5v3cka5uhz3k7hqx43xprtjxlpccbn3ud2jixalqvz52hla.ipfs.nftstorage.link/AragonDAOpaprticipationagreementpublicversion.html',
    label: 'Aragon DAO Participation Agreement',
  },
  [TERMS_OF_USE_DISCLAIMER]: {
    text: `I have read and accept the ${PLACEHOLDER}.`,
    link:
      'https://bafybeidgxjx5v3cka5uhz3k7hqx43xprtjxlpccbn3ud2jixalqvz52hla.ipfs.nftstorage.link/AragonDAOproposaltermspublicversion.docx.html',
    label: 'Aragon DAO Terms of Use',
  },
  [FINANCIAL_COMPLIANCE_FORM]: {
    text: `I have completed a ${PLACEHOLDER} for this Withdraw Request.`,
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
  const [pre, post] = text.split(PLACEHOLDER)

  return (
    <label>
      <div
        css={`
          display: flex;
          gap: ${0.5 * GU}px;
          align-items: center;
        `}
      >
        <Checkbox
          checked={isChecked}
          disabled={!account}
          onChange={toggleCheckbox}
        />
        <div
          css={`
            position: relative;
            top: 2px;
            cursor: pointer;
          `}
        >
          {pre}
          <Link href={link}>{label}</Link>
          {post}
        </div>
      </div>
    </label>
  )
}

export function DisclaimerLayout({ children, types, ...props }) {
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
        justify-content: center;
      `}
      {...props}
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

export function ParticipationDisclaimer({ children, ...props }) {
  return (
    <DisclaimerLayout types={[PARTICIPATION_DISCLAIMER]} {...props}>
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
