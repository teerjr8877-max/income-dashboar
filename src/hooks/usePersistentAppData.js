import { useEffect, useRef, useState } from 'react'
import { createAppDataRepository } from '../data/appStore'

export function usePersistentAppData(repository) {
  const [repo] = useState(() => repository ?? createAppDataRepository())
  const [appData, setAppData] = useState(() => repo.load())
  const [saveState, setSaveState] = useState('saved')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const skipInitialSave = useRef(true)

  useEffect(() => {
    if (skipInitialSave.current) {
      skipInitialSave.current = false
      return undefined
    }

    setSaveState('saving')

    const timeoutId = window.setTimeout(() => {
      repo.save(appData)
      setSaveState('saved')
      setLastSavedAt(new Date())
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [appData, repo])

  const resetToDemoData = () => {
    const demoSnapshot = repo.resetToDemoData()
    setAppData(demoSnapshot)
    setSaveState('saved')
    setLastSavedAt(new Date())
  }

  return {
    appData,
    setAppData,
    saveState,
    lastSavedAt,
    resetToDemoData,
  }
}
