import React from 'react'
import LoadingSkeleton from '@/components/Loading/LoadingSkeleton'
import Description from './index'

export const DescriptionWithSkeleton = ({ path, itemNumber, loading }) => {
  if (loading) {
    return (
      <>
        <LoadingSkeleton
          css={`
            width: 95%;
          `}
        />
        <LoadingSkeleton
          css={`
            width: 70%;
          `}
        />
        <LoadingSkeleton
          css={`
            width: 35%;
          `}
        />
      </>
    )
  }

  return (
    <>
      <strong css="font-weight: bold">#{itemNumber}: </strong>{' '}
      <Description disableBadgeInteraction path={path} />
    </>
  )
}

export default DescriptionWithSkeleton
