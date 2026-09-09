import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/lib/storageKeys'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface AppSettings {
  hostName: string
  theme: ThemePreference
  desktopNotifications: boolean
}

interface SettingsState extends AppSettings {
  updateSettings: (patch: Partial<AppSettings>) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  hostName: '',
  theme: 'system',
  desktopNotifications: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (patch) => set(patch),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
