import { createContext, useContext, useEffect, useState } from "react";
import { AVAILABLE_THEMES } from "../utils/themePresets";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("spendwise-theme");
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    return "dark"; // Default to dark mode
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const savedColor = localStorage.getItem("spendwise-color-theme");
    const valid = AVAILABLE_THEMES.some((t) => t.id === savedColor);
    return valid ? savedColor : "emerald"; // Default to emerald modern fintech
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("spendwise-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-color-theme", colorTheme);
    localStorage.setItem("spendwise-color-theme", colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colorTheme,
        setColorTheme,
        availableThemes: AVAILABLE_THEMES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
