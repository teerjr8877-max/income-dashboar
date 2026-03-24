import { useEffect, useRef, useState } from '../lib/react.js'
import { createAppDataRepository } from '../data/appStore.js'

export function usePersistentAppData(repository) {
  const [repo] = useState(() => repository ?? createAppDataRepository())
  const [appData, setAppData] = useState(() => {
    try {
      return repo.load()
    } catch (error) {
      console.error('Failed to load app data, falling back to defaults.', error)
      return createAppDataRepository().load()
    }
  })
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
      try {
        repo.save(appData)
        setSaveState('saved')
        setLastSavedAt(new Date())
      } catch (error) {
        console.error('Failed to persist app data.', error)
        setSaveState('error')
      }
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [appData, repo])

  const resetToDemoData = () => {
    try {
      const demoSnapshot = repo.resetToDemoData()
      setAppData(demoSnapshot)
      setSaveState('saved')
      setLastSavedAt(new Date())
    } catch (error) {
      console.error('Failed to reset demo data.', error)
      setSaveState('error')
    }
  }

  return { appData, setAppData, saveState, lastSavedAt, resetToDemoData }
}
