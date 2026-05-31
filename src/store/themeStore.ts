import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// Ensure the class is appended on initial load
if (typeof window !== "undefined") {
  document.documentElement.classList.add("dark");
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true, // Default to dark mode for the gamified feel
  toggleTheme: () =>
    set((state) => {
      const newDark = !state.isDark;
      if (newDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { isDark: newDark };
    }),
}));