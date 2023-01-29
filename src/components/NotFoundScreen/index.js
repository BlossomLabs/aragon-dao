import React from 'react'
import styled from 'styled-components'
import { Button, EmptyStateCard, GU } from '@aragon/ui'
import appNotFoundPng from './assets/app-not-found.png'
import { useHistory } from 'react-router-dom'
import { MAIN_HEADER_HEIGHT } from '@/constants'

const NotFoundScreen = ({ text, actionText = 'Go back', onAction }) => {
  const history = useHistory()
  const defaultOnAction = () => history.push('')

  return (
    <Main>
      <EmptyStateCard
        actionText={actionText}
        illustration={
          <img width="140" height="140" src={appNotFoundPng} alt="" />
        }
        action={
          <Button label={actionText} onClick={onAction ?? defaultOnAction} />
        }
        text={text}
      />
    </Main>
  )
}

const Main = styled.div`
  display: flex;
  height: calc(100vh - ${MAIN_HEADER_HEIGHT - GU}px);
  align-items: center;
  justify-content: center;
`

export default NotFoundScreen
