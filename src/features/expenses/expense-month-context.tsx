import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { currentMonthKey } from "@/features/expenses/lib/budget-utils";
import { monthIsoRange, parseMonthKey } from "@/features/expenses/lib/month-utils";

type ExpenseMonthValue = {
  month: string;
  setMonth: (month: string) => void;
  range: { from: string; to: string };
  isCurrentMonth: boolean;
};

const ExpenseMonthContext = createContext<ExpenseMonthValue | null>(null);

type ExpenseSearch = {
  month?: string;
};

export function ExpenseMonthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const searchMonth = useRouterState({
    select: (s) => (s.location.search as ExpenseSearch).month,
  });
  const month = parseMonthKey(searchMonth);

  const setMonth = useCallback(
    (next: string) => {
      navigate({
        search: (prev: ExpenseSearch) => ({ ...prev, month: next }),
        replace: true,
      });
    },
    [navigate],
  );

  const value = useMemo<ExpenseMonthValue>(
    () => ({
      month,
      setMonth,
      range: monthIsoRange(month),
      isCurrentMonth: month === currentMonthKey(),
    }),
    [month, setMonth],
  );

  return <ExpenseMonthContext.Provider value={value}>{children}</ExpenseMonthContext.Provider>;
}

export function useExpenseMonth(): ExpenseMonthValue {
  const ctx = useContext(ExpenseMonthContext);
  if (!ctx) throw new Error("useExpenseMonth must be used inside ExpenseMonthProvider");
  return ctx;
}
