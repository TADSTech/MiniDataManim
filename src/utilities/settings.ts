export const themeSetting = {
  get: () => {
    if (localStorage.theme) return localStorage.theme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },
  set: (theme: string) => {
    localStorage.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
};

export interface AppSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  maxUndoSteps: number;
  confirmDelete: boolean;
  showGridLines: boolean;
  highlightSelectedCell: boolean;
  dateFormat: string;
  numberFormat: string;
  csvDelimiter: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoSave: false,
  autoSaveInterval: 5,
  maxUndoSteps: 50,
  confirmDelete: true,
  showGridLines: true,
  highlightSelectedCell: true,
  dateFormat: 'YYYY-MM-DD',
  numberFormat: '#,##0.00',
  csvDelimiter: ',',
};

class AppSettingsManager {
  private key = 'minidatamanim-settings';

  get(): AppSettings {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) } satisfies AppSettings;
      }
    } catch (error) {
      console.error('Failed to load app settings', error);
    }
    return DEFAULT_APP_SETTINGS;
  }

  set(settings: Partial<AppSettings> | AppSettings): AppSettings {
    try {
      const current = this.get();
      const updated = { ...current, ...settings } as AppSettings;
      localStorage.setItem(this.key, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to save app settings', error);
      return this.get();
    }
  }

  reset(): AppSettings {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('Failed to reset app settings', error);
    }
    return DEFAULT_APP_SETTINGS;
  }
}

export const appSettingsManager = new AppSettingsManager();
