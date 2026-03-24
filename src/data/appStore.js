import { createDemoAppData, normalizeAppData } from './appData.js'

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
      try {
        const savedValue = window.localStorage.getItem(storageKey)
        if (!savedValue) {
          return createDemoAppData()
        }

        return normalizeAppData(JSON.parse(savedValue))
      } catch (error) {
        console.error('Failed to read app data from localStorage.', error)
        return createDemoAppData()
      }
    },
    save(nextSnapshot) {
      const normalizedSnapshot = normalizeAppData(nextSnapshot)

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(normalizedSnapshot))
      } catch (error) {
        console.error('Failed to save app data to localStorage.', error)
      }

      return normalizedSnapshot
    },
    reset() {
      const demoSnapshot = createDemoAppData()

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(demoSnapshot))
      } catch (error) {
        console.error('Failed to reset app data in localStorage.', error)
      }

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
