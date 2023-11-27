import React from 'react'
import PropTypes from 'prop-types'
import { Transition, animated } from 'react-spring/renderprops'
import LoadingFullscreen from './Loading/LoadingFullscreen'
import { useOrganizationState } from '../providers/OrganizationProvider'

const AnimatedDiv = animated.div

const MainView = React.memo(function MainView({ children }) {
  const { loading: appsLoading } = useOrganizationState()

  console.log(appsLoading)
  return (
    <div>
      {!appsLoading && <>{children}</>}

      <Transition
        items={appsLoading}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0 }}
      >
        {loading =>
          loading &&
          (props => (
            <AnimatedDiv
              style={props}
              css={`
                display: flex;
                position: absolute;

                top: 0;
                left: 0;
                bottom: 0;
                right: 0;

                z-index: 2;
              `}
            >
              <LoadingFullscreen
                css={`
                  flex: 1;
                `}
              />
            </AnimatedDiv>
          ))
        }
      </Transition>
    </div>
  )
})

MainView.propTypes = {
  children: PropTypes.node,
}

export default MainView
