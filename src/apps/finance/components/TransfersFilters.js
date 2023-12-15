import React, { useMemo } from 'react'
import { DropDown, GU, DateRangePicker } from '@aragon/ui'
import TokenSelectorInstance from './TokenSelectorInstance'

const TransfersFilters = ({
  dateRangeFilter,
  onDateRangeChange,
  onTokenChange,
  tokens,
  tokenFilter,
  transferTypes,
  transferTypeFilter,
  onTransferTypeChange,
}) => {
  const tokenInstances = useMemo(() => {
    return tokens.map(({ address, name, logoUrl, symbol }) => (
      <TokenSelectorInstance
        address={address}
        name={name}
        logoUrl={logoUrl}
        symbol={symbol}
      />
    ))
  }, [tokens])

  return (
    <div
      css={`
        margin-bottom: ${1 * GU}px;
        display: inline-grid;
        grid-gap: ${1.5 * GU}px;
        grid-template-columns: auto auto auto;
      `}
    >
      <DropDown
        placeholder="Type"
        header="Type"
        items={transferTypes}
        selected={transferTypeFilter}
        onChange={onTransferTypeChange}
        width="128px"
      />
      <DropDown
        placeholder="Token"
        header="Token"
        items={tokenInstances}
        selected={tokenFilter}
        onChange={onTokenChange}
        width="128px"
      />
      <DateRangePicker
        startDate={dateRangeFilter.start}
        endDate={dateRangeFilter.end}
        onChange={onDateRangeChange}
        format={'YYYY-MM-DD'}
      />
    </div>
  )
}

export default TransfersFilters
