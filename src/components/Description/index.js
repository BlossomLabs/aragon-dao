import React from 'react'
import { PropTypes } from 'prop-types'
import { GU, Tag, useTheme } from '@aragon/ui'
import AppBadgeWithSkeleton from '@/components/AppBadgeWithSkeleton'
import {
  getAppPresentation,
  getAppPresentationByAddress,
} from '@/utils/app-utils'
import { useOrganizationState } from '@/providers/OrganizationProvider'
import LocalIdentityBadge from '../LocalIdentityBadge/LocalIdentityBadge'

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
  const { apps, loading } = useOrganizationState()

  const description = []

  const appPresentation = apps ? getAppPresentationByAddress(apps, step.to) : {}

  const targetApp = {
    name: appPresentation.humanName,
    address: step.to,
    icon: appPresentation.iconSrc,
  }

  // Add app
  description.push(
    <React.Fragment key={0}>
      <span
        css={`
          display: inline-block;
          transform: translateY(7px);
        `}
      >
        <AppBadgeWithSkeleton targetApp={targetApp} loading={loading} />
      </span>
      <span>:</span>
    </React.Fragment>
  )

  if (step.annotatedDescription) {
    description.push(
      step.annotatedDescription.map(({ type, value }, index) => {
        const key = index + 1

        if (type === 'address') {
          return (
            <span key={key}>
              <LocalIdentityBadge
                badgeOnly={disableBadgeInteraction}
                compact
                entity={value}
              />
            </span>
          )
        }

        if (type === 'any-account') {
          return <Tag key={key}>{'Any account'}</Tag>
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
                margin: 0 ${0.25 * GU}px;
                display: inline-block;
                transform: translateY(7px);
              `}
            >
              <AppBadgeWithSkeleton targetApp={targetApp} loading={false} />
            </span>
          )
        }

        if (type === 'role' || type === 'kernelNamespace') {
          return <Tag key={key}>{value.name}</Tag>
        }

        if (type === 'apmPackage') {
          return <Tag key={key}> “{value.artifact.appName}”</Tag>
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
            text-indent: ${1 * GU}px;
          `}
        >
          <li
            css={`
              padding-left: ${1 * GU}px;
              &:before {
                content: '';
                width: ${0.75 * GU}px;
                height: ${0.75 * GU}px;
                background: ${theme.accent};
                display: inline-block;
              }
              span {
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
