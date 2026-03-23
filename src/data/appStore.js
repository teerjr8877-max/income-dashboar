import { createDemoAppData, normalizeAppData } from './appData'

export const LOCAL_STORAGE_KEY = 'wealthos.app-data.v1'

function createMemoryAdapter() {
  let snapshot = createDemoAppData()

  return {
    load() {
      return snapshot
    },
    save(nextSnapshot) {
      snapshot = normalizeAppData(nextSnapshot)
      return snapshot
    },
    reset() {
      snapshot = createDemoAppData()
      return snapshot
    },
  }
}

export function createLocalStorageAdapter(storageKey = LOCAL_STORAGE_KEY) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createMemoryAdapter()
  }

  return {
    load() {
      const savedValue = window.localStorage.getItem(storageKey)
      if (!savedValue) {
        return createDemoAppData()
      }

      try {
        return normalizeAppData(JSON.parse(savedValue))
      } catch {
        return createDemoAppData()
      }
    },
    save(nextSnapshot) {
      const normalizedSnapshot = normalizeAppData(nextSnapshot)
      window.localStorage.setItem(storageKey, JSON.stringify(normalizedSnapshot))
      return normalizedSnapshot
    },
    reset() {
      const demoSnapshot = createDemoAppData()
      window.localStorage.setItem(storageKey, JSON.stringify(demoSnapshot))
      return demoSnapshot
    },
  }
}

export function createAppDataRepository(adapter = createLocalStorageAdapter()) {
  return {
    load() {
      return adapter.load()
    },
    save(snapshot) {
      return adapter.save(snapshot)
    },
    resetToDemoData() {
      return adapter.reset()
    },
  }
}
