import React from 'react'
import { DropDown, Field, isAddress, TextInput } from '@aragon/ui'
import { useNetwork } from '@/hooks/shared'
import { ETHER_TOKEN_VERIFIED_BY_SYMBOL } from '../lib/verified-tokens'
import TokenSelectorInstance from './TokenSelectorInstance'
import { constants } from 'ethers'

const INITIAL_STATE = {
  customToken: {
    address: '',
    value: '',
  },
}

function NativeTokenInstance() {
  const { nativeToken } = useNetwork()

  return (
    <TokenSelectorInstance
      address={constants.AddressZero}
      name={nativeToken}
      symbol={nativeToken}
      showIcon
    />
  )
}

class TokenSelector extends React.Component {
  static defaultProps = {
    onChange: () => {},
    tokens: [],
    label: 'Token',
    labelCustomToken: 'Token address',
    selectedIndex: -1,
  }
  state = {
    ...INITIAL_STATE,
  }
  handleChange = index => {
    this.setState({ ...INITIAL_STATE }, () => {
      const address = this.getAddressFromTokens(index)
      this.props.onChange({
        address,
        index,
        value: address,
      })
    })
  }
  handleCustomTokenChange = event => {
    const { value } = event.target
    const { network } = this.props

    // Use the verified token address if provided a symbol and it matches
    // The symbols in the verified map are all capitalized
    const resolvedAddress =
      !isAddress(value) && network && network.type === 'main'
        ? ETHER_TOKEN_VERIFIED_BY_SYMBOL.get(value.toUpperCase()) || ''
        : value

    this.setState(
      {
        customToken: {
          value,
          address: resolvedAddress,
        },
      },
      () => {
        this.props.onChange({
          value,
          index: 0,
          address: resolvedAddress,
        })
      }
    )
  }
  getAddressFromTokens(index) {
    if (index === 0) {
      return this.state.customToken.address
    }

    const tokensAlreadyHaveNative = !!this.props.tokens.find(
      ({ address }) => address === constants.AddressZero
    )
    /**
     * We only add the native token when is not included
     * in the received tokens
     */
    if (index === 1 && !tokensAlreadyHaveNative) {
      return constants.AddressZero
    }

    // Adjust from custom address and possibly native token
    const adjustedIndex = tokensAlreadyHaveNative ? index - 1 : index - 2

    const token = this.props.tokens[adjustedIndex]

    return token.address
  }
  getItems() {
    return ['Other…', ...this.getTokenItems()]
  }
  getTokenItems() {
    const tokenItems = this.props.tokens.map(
      ({ address, name, symbol, logoUrl }) => (
        <TokenSelectorInstance
          address={address}
          name={name}
          logoUrl={logoUrl}
          symbol={symbol}
        />
      )
    )
    if (
      !this.props.tokens.find(
        ({ address }) => address === constants.AddressZero
      )
    ) {
      tokenItems.unshift(<NativeTokenInstance />)
    }

    return tokenItems
  }
  render() {
    const { customToken } = this.state
    const { label, labelCustomToken, selectedIndex } = this.props
    const items = this.getItems()
    const showCustomToken = selectedIndex === 0
    return (
      <React.Fragment>
        <Field label={label}>
          <DropDown
            header="Token"
            placeholder="Select a token"
            items={items}
            selected={selectedIndex}
            onChange={this.handleChange}
            required
            wide
          />
        </Field>

        {showCustomToken && (
          <Field label={labelCustomToken}>
            <TextInput
              placeholder="0x…"
              value={customToken.value}
              onChange={this.handleCustomTokenChange}
              required
              wide
            />
          </Field>
        )}
      </React.Fragment>
    )
  }
}

export default props => {
  const network = useNetwork()
  return <TokenSelector network={network} {...props} />
}
