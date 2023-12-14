import { useNetwork } from '@/hooks/shared'
import { useWallet } from '@/providers/Wallet'
import { Checkbox, GU, Link } from '@aragon/ui'
import React, { useEffect, useState } from 'react'

const COVENANT_DISCLAIMER = 'COVENANT_DISCLAIMER'

const PLACEHOLDER = '%s'

const DISCLAIMERS = {
  [COVENANT_DISCLAIMER]: {
    text: `I have read and accept the ${PLACEHOLDER}.`,
    link: 'https://ipfs.io/ipfs/QmUtprKHxscpcDV5W6YMz4Bu3oMzvqzgS7Bx6YyVfZt6ps',
    label: "Common's DAO Covenant",
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

export function CovenantDisclaimer({ children }) {
  return (
    <DisclaimerLayout types={[COVENANT_DISCLAIMER]}>
      {children}
    </DisclaimerLayout>
  )
}
