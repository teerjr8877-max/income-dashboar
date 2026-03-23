import { useCallback, useEffect, useMemo, useState } from 'react'
import { persistLocalWorkspace } from '../data/householdModel'

export function usePersistentAppData(initialState, createDemoFactory) {
  const [appData, setAppData] = useState(initialState)
  const [lastSavedAt, setLastSavedAt] = useState(initialState?.metadata?.lastLocalSaveAt ?? null)

  useEffect(() => {
    persistLocalWorkspace(appData)
    setLastSavedAt(new Date().toISOString())
  }, [appData])

  const saveState = useCallback((nextValue) => {
    setAppData((current) => (typeof nextValue === 'function' ? nextValue(current) : nextValue))
  }, [])

  const resetToDemoData = useCallback((factoryOverride) => {
    const nextFactory = factoryOverride ?? createDemoFactory
    setAppData(nextFactory())
  }, [createDemoFactory])

  return useMemo(() => ({
    appData,
    setAppData,
    saveState,
    lastSavedAt,
    resetToDemoData,
  }), [appData, lastSavedAt, resetToDemoData, saveState])
}
