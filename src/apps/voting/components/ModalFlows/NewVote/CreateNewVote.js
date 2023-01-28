import React, { useCallback, useState } from 'react'
import { Field, GU, Info, TextInput, textStyle } from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'
import LoadingButton from '@/components/LoadingButton'

function CreateNewVote({ getTransactions }) {
  const [question, setQuestion] = useState('')
  const { next } = useMultiModal()
  const disableButton = !question.length

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
          margin-top: ${3 * GU}px;
        `}
      >
        These proposals are informative and used for signaling. They don’t have
        any direct repercussions on the organization.
      </Info>
      <LoadingButton
        id="new-proposal"
        mode="strong"
        wide
        css={`
          margin-top: ${2 * GU}px;
        `}
        onClick={handleOnCreateVote}
        disabled={disableButton}
      >
        Create new proposal
      </LoadingButton>
    </div>
  )
}

export default CreateNewVote
