import React from 'react'
import styled from 'styled-components'
import { Button, EmptyStateCard, GU } from '@aragon/ui'
import appNotFoundPng from './assets/app-not-found.png'
import { useHistory } from 'react-router-dom'

const App404 = () => {
  const history = useHistory()

  return (
    <Main>
      <EmptyStateCard
        actionText="Go back"
        illustration={
          <img width="140" height="140" src={appNotFoundPng} alt="" />
        }
        action={<Button label="Go back" onClick={() => history.push('')} />}
        text="Oops, we couldn't find an app installed here."
      />
    </Main>
  )
}

const Main = styled.div`
  display: flex;
  height: calc(100vh - ${8 * GU}px);
  align-items: center;
  justify-content: center;
`

export default App404
