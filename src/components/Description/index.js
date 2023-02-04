import React from 'react'
import { PropTypes } from 'prop-types'
import { GU, IdentityBadge, Tag, useTheme } from '@aragon/ui'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'
import { getAppPresentation } from '@/utils/app-utils'

function Description({ disableBadgeInteraction, path }) {
  return (
    <span
      css={`
        // overflow-wrap:anywhere and hyphens:auto are not supported yet by
        // the latest versions of Safari (as of June 2020), which
        // is why word-break:break-word has been added here.
        hyphens: auto;
        overflow-wrap: anywhere;
        word-break: break-word;
      `}
    >
      {path?.length
        ? path.map((step, index) => (
            <DescriptionStep
              disableBadgeInteraction={disableBadgeInteraction}
              key={index}
              step={step}
            />
          ))
        : 'No description available.'}
    </span>
  )
}

/* eslint-disable react/prop-types */
function DescriptionStep({ step, disableBadgeInteraction }) {
  const theme = useTheme()

  const description = []

  if (step.annotatedDescription) {
    description.push(
      step.annotatedDescription.map(({ type, value }, index) => {
        const key = index + 1

        if (type === 'address' || type === 'any-account') {
          return (
            <span key={key}>
              {' '}
              <IdentityBadge
                badgeOnly={disableBadgeInteraction}
                compact
                entity={type === 'any-account' ? 'Any account' : value}
              />
            </span>
          )
        }

        if (type === 'app') {
          const appPresentation = getAppPresentation(value)

          const targetApp = {
            name: appPresentation.humanName,
            address: value.address,
            icon: appPresentation.iconSrc,
          }

          return (
            <span
              key={key}
              css={`
                margin: 0 ${0.5 * GU}px;
              `}
            >
              <AppBadgeWithSkeleton targetApp={targetApp} loading={false} />
            </span>
          )
        }

        if (type === 'role' || type === 'kernelNamespace') {
          return (
            <Tag key={key} color="#000">
              {value.name}
            </Tag>
          )
        }

        if (type === 'role' || type === 'kernelNamespace' || type === 'app') {
          return <span key={key}> “{value.name}”</span>
        }

        if (type === 'apmPackage') {
          return <span key={key}> “{value.artifact.appName}”</span>
        }

        return (
          <span
            key={key}
            css={`
              margin-right: ${0.5 * GU}px;
            `}
          >
            {' '}
            {value.description || value}
          </span>
        )
      })
    )
  } else {
    description.push(
      <span key={description.length + 1}>
        {step.description || 'No description'}
      </span>
    )
  }

  description.push(<br key={description.length + 1} />)

  const childrenDescriptions = (step.children || []).map((child, index) => {
    return <DescriptionStep step={child} key={index} />
  })

  return (
    <>
      <span>{description}</span>
      {childrenDescriptions.length > 0 && (
        <ul
          css={`
            list-style-type: none;
            margin-left: 0;
            padding-left: ${0.5 * GU}px;
            text-indent: -${0.5 * GU}px;
          `}
        >
          <li
            css={`
              padding-left: ${2 * GU}px;
              &:before {
                content: '';
                width: ${0.5 * GU}px;
                height: ${0.5 * GU}px;
                background: ${theme.accent};
                border-radius: 50%;
                display: inline-block;
              }
              span {
                display: inline;
                color: ${theme.surfaceContentSecondary};
              }
            `}
          >
            {childrenDescriptions}
          </li>
        </ul>
      )}
    </>
  )
}
/* eslint-enable react/prop-types */

Description.propTypes = {
  disableBadgeInteraction: PropTypes.bool,
  path: PropTypes.array,
}

Description.defaultProps = {
  disableBadgeInteraction: false,
}

export default Description
