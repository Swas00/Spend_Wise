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

  const [rememberTheme, setRememberTheme] = useState(() => {
    return localStorage.getItem("spendwise-remember-theme") === "true";
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
    if (rememberTheme) {
      localStorage.setItem("spendwise-color-theme", colorTheme);
      localStorage.setItem("spendwise-remember-theme", "true");
    }
  }, [colorTheme, rememberTheme]);

  const updateThemePreference = (newColor, remember = true) => {
    setColorTheme(newColor);
    setRememberTheme(remember);
    if (remember) {
      localStorage.setItem("spendwise-remember-theme", "true");
      localStorage.setItem("spendwise-color-theme", newColor);
    } else {
      localStorage.removeItem("spendwise-remember-theme");
      localStorage.removeItem("spendwise-color-theme");
    }
  };

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
        rememberTheme,
        setRememberTheme,
        updateThemePreference,
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
