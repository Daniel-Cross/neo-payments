import { createContext, useContext, useState } from "react";
import { THEME } from "../constants/colours";
import { ThemeMode } from "../constants/enums";

interface ThemeContextType {
  theme: typeof THEME;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(ThemeMode.DARK);

  const toggleTheme = () => {
    setThemeMode((prev) =>
      prev === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK
    );
  };

  // For now, we only have dark theme implemented
  // Later we can add light theme support
  const theme = THEME;

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
