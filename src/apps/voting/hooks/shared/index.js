import useApi from './useApi'
import useAppState from '../../providers/VotingProvider'
import useConnectedAccount from './useConnectedAccount'
import useCurrentApp from './useCurrentApp'
import useGuiStyle from './useGuiStyle'
import useInstalledApps from './useInstalledApps'
import useNetwork from './useNetwork'
import usePath from './usePath'

const useAragonApi = () => ({
  api: useApi(),
  appState: useAppState(),
  connectedAccount: useConnectedAccount(),
  currentApp: useCurrentApp(),
  guiStyle: useGuiStyle(),
  installedApps: useInstalledApps(),
  network: useNetwork(),
  path: usePath(),
})

export {
  useApi,
  useAppState,
  useConnectedAccount,
  useCurrentApp,
  useGuiStyle,
  useInstalledApps,
  useNetwork,
  usePath,
  useAragonApi,
}
