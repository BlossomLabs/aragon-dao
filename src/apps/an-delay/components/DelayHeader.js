import React from 'react'
import { Tag } from '@aragon/ui'
import Title from './Title'
import { useANDelaySettings } from '../providers/ANDelaySettingsProvider'
import { formatTime } from '@/utils/time-utils'
import AppHeader from '@/components/AppHeader'

export default function DelayHeader() {
  const { executionDelay } = useANDelaySettings()

  return (
    <AppHeader
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
