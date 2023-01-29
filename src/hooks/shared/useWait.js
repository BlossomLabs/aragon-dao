import { useEffect, useState } from 'react'

export function useWait(waitTime = 200) {
  const [isWaiting, setIsWaiting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsWaiting(false), waitTime)

    return () => {
      clearTimeout(timer)
    }
  }, [waitTime])

  return isWaiting
}
