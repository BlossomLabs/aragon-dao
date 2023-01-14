import React from 'react'
import { Header, Tag } from '@aragon/ui'
import Title from './Title'
import { useANDelaySettings } from '../providers/ANDelaySettingsProvider'
import { formatTime } from '@/utils/time-utils'

export default function DelayHeader() {
  const { executionDelay } = useANDelaySettings()

  return (
    <Header
      primary={
        <Title
          text="Delay"
          after={
            executionDelay && (
              <Tag mode="identifier" uppercase={false}>
                {formatTime(executionDelay)}
              </Tag>
            )
          }
        />
      }
    />
  )
}
