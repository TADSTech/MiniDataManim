// Preferences management
export interface Preferences {
  inPlaceMode: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  dataManipulationDefaultToNewSheet: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  inPlaceMode: false,
  theme: 'system',
  fontSize: 'medium',
  dataManipulationDefaultToNewSheet: true,
};

class PreferencesManager {
  private key = 'minidatamanim-preferences';

  get(): Preferences {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load preferences', e);
    }
    return DEFAULT_PREFERENCES;
  }

  set(preferences: Partial<Preferences>) {
    try {
      const current = this.get();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.key, JSON.stringify(updated));
      
      // Apply theme
      if (updated.theme) {
        document.documentElement.setAttribute('data-theme', updated.theme);
      }
      
      // Apply font size
      if (updated.fontSize) {
        document.documentElement.setAttribute('data-font-size', updated.fontSize);
      }
      
      return updated;
    } catch (e) {
      console.error('Failed to save preferences', e);
      return this.get();
    }
  }

  getInPlace(): boolean {
    return this.get().inPlaceMode;
  }

  setInPlace(value: boolean) {
    this.set({ inPlaceMode: value });
  }

  getFontSize(): 'small' | 'medium' | 'large' {
    return this.get().fontSize;
  }

  setFontSize(size: 'small' | 'medium' | 'large') {
    this.set({ fontSize: size });
  }
}

export const preferencesManager = new PreferencesManager();
