import React, { useCallback, useState } from 'react'
import { Button, Field, GU, Info, TextInput, textStyle } from '@aragon/ui'
import { useMultiModal } from '@/components/MultiModal/MultiModalProvider'
import RequiredTokensError from '@/components/RequiredTokensInfo'
import { useFee } from '@/providers/Fee'
import { TermsOfUseDisclaimer } from '@/components/Disclaimers'
import { URL_REGEX } from '@/utils/text-utils'
import { buildContext } from '@/utils/evmscript'
import { ValidationError } from '@/components/ValidationError'

function CreateNewVote({ getTransactions }) {
  const { hasFeeTokens } = useFee()
  const [title, setTitle] = useState('')
  const [reference, setReference] = useState('')
  const [errorMessage, setErrorMessage] = useState()
  const { next } = useMultiModal()
  const disableButton =
    !title.length || !hasFeeTokens || !URL_REGEX.test(reference)

  const handleTitleChange = useCallback(event => {
    const updatedTitle = event.target.value
    setTitle(updatedTitle)
  }, [])

  const handleReferenceChange = useCallback(event => {
    const updatedReference = event.target.value
    if (updatedReference && !URL_REGEX.test(updatedReference)) {
      setErrorMessage('Invalid reference. Must be a valid URL.')
    } else {
      setErrorMessage()
    }

    setReference(updatedReference)
  }, [])

  const handleOnCreateVote = useCallback(() => {
    next()

    getTransactions(() => {
      next()
    }, buildContext(title, reference))
  }, [getTransactions, title, reference, next])

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
        label="Title"
        required
      >
        <TextInput
          onChange={handleTitleChange}
          value={title}
          wide
          required
          css={`
            margin-top: ${1 * GU}px;
          `}
        />
      </Field>

      <Field
        css={`
          margin-top: ${1 * GU}px;
        `}
        label="Reference (IPFS of proposal text)"
        required
      >
        <TextInput
          onChange={handleReferenceChange}
          value={reference}
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
          margin-bottom: ${3 * GU}px;
        `}
      >
        These proposals are informative and used for signaling. They don’t have
        any direct repercussions on the organization.
      </Info>

      <TermsOfUseDisclaimer>
        <Button
          mode="strong"
          wide
          onClick={handleOnCreateVote}
          disabled={disableButton}
          css={`
            margin-top: ${1 * GU}px;
          `}
        >
          Create new Proposal
        </Button>
      </TermsOfUseDisclaimer>
      <RequiredTokensError
        css={`
          margin-top: ${2 * GU}px;
        `}
      />
      {errorMessage && <ValidationError message={errorMessage} />}
    </div>
  )
}

export default CreateNewVote
