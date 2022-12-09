import React, { useCallback, useState } from 'react'
import { Button, Field, GU, Info, TextInput, textStyle } from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'

function CreateNewVote({ getTransactions }) {
  const [question, setQuestion] = useState()
  const { next } = useMultiModal()

  const handleQuestionChange = useCallback(event => {
    const updatedQuestion = event.target.value
    setQuestion(updatedQuestion)
  }, [])

  const handleOnCreateVote = useCallback(() => {
    getTransactions(() => {
      next()
    }, question)
  }, [getTransactions, question, next])

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        ${textStyle('body2')};
      `}
    >
      <Field
        css={`
          margin-top: ${3 * GU}px;
        `}
        label="Delegate account (must be a valid ethereum address)"
        required
      >
        <TextInput
          onChange={handleQuestionChange}
          value={question}
          wide
          required
          css={`
            margin-top: ${1 * GU}px;
          `}
        />
      </Field>

      <Info
        css={`
          margin-top: ${3 * GU}px;
        `}
      >
        These votes are informative and used for signaling. They don’t have any
        direct repercussions on the organization.
      </Info>
      <Button
        mode="strong"
        wide
        css={`
          margin-top: ${2 * GU}px;
        `}
        onClick={handleOnCreateVote}
      >
        Create new vote
      </Button>
    </div>
  )
}

export default CreateNewVote
