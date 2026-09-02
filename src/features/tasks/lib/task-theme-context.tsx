import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  resolveTaskThemeId,
  TASK_THEME_STORAGE_KEY,
  TASK_THEMES,
  themeToCssVars,
  type TaskThemeId,
  type TaskThemeTokens,
} from "./task-theme";

type TaskThemeContextValue = {
  theme: TaskThemeTokens;
  themeId: TaskThemeId;
  setThemeId: (id: TaskThemeId) => void;
};

const TaskThemeContext = createContext<TaskThemeContextValue | null>(null);

export function TaskThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<TaskThemeId>("personal-os-dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(TASK_THEME_STORAGE_KEY);
    setThemeIdState(resolveTaskThemeId(stored));
  }, []);

  const setThemeId = useCallback((id: TaskThemeId) => {
    setThemeIdState(id);
    window.localStorage.setItem(TASK_THEME_STORAGE_KEY, id);
  }, []);

  const theme = TASK_THEMES[themeId];
  const value = useMemo(() => ({ theme, themeId, setThemeId }), [theme, themeId, setThemeId]);

  return (
    <TaskThemeContext.Provider value={value}>
      <div
        className="tasks-workspace relative -mx-4 -mt-6 min-h-[calc(100dvh-6rem)] bg-[var(--task-bg)] text-[var(--task-text)] transition-[background-color,color] duration-200 md:-mx-8 md:-mt-9"
        style={themeToCssVars(theme) as CSSProperties}
      >
        <div className="pointer-events-none absolute inset-0 bg-[var(--task-bg)]/88" aria-hidden />
        <div className="relative">{children}</div>
      </div>
    </TaskThemeContext.Provider>
  );
}

export function useTaskTheme() {
  const ctx = useContext(TaskThemeContext);
  if (!ctx) throw new Error("useTaskTheme must be used within TaskThemeProvider");
  return ctx;
}
