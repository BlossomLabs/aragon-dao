import React, { useCallback, useState } from 'react'
import { Button, Field, GU, Info, TextInput, textStyle } from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'
import RequiredTokensError from '@/components/RequiredTokensInfo'
import { useFee } from '@/providers/Fee'

function CreateNewVote({ getTransactions }) {
  const { hasFeeTokens } = useFee()
  const [question, setQuestion] = useState('')
  const { next } = useMultiModal()
  const disableButton = !question.length || !hasFeeTokens

  const handleQuestionChange = useCallback(event => {
    const updatedQuestion = event.target.value
    setQuestion(updatedQuestion)
  }, [])

  const handleOnCreateVote = useCallback(() => {
    next()

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
        label="Question"
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
          margin-top: ${1 * GU}px;
        `}
      >
        These proposals are informative and used for signaling. They don’t have
        any direct repercussions on the organization.
      </Info>

      <Button
        mode="strong"
        wide
        css={`
          margin-top: ${3 * GU}px;
        `}
        onClick={handleOnCreateVote}
        disabled={disableButton}
      >
        Create new Proposal
      </Button>
      <RequiredTokensError
        css={`
          margin-top: ${2 * GU}px;
        `}
      />
    </div>
  )
}

export default CreateNewVote
