import { useOrganizationState } from '@/providers/OrganizationProvider'
import usePath from './usePath'
import { useEffect, useState } from 'react'

export function useCurrentApp() {
  const [currentApp, setCurrentApp] = useState()
  const [path] = usePath()
  const { apps } = useOrganizationState()

  useEffect(() => {
    if (!apps || !path) {
      return
    }

    const [, , currentAppAddress] = path.split('/')
    const app = apps.find(app => app.address === currentAppAddress)

    setCurrentApp(app)
  }, [apps, path])

  return currentApp
}
