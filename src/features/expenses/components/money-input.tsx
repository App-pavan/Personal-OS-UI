import { useEffect, useRef, useState } from "react";
import { inputToMinor, minorToInput } from "@/lib/money";
import { GlassInput } from "./glass";

export function MoneyInput({
  valueMinor,
  currency = "INR",
  onChangeMinor,
  placeholder = "₹0.00",
  className,
}: {
  valueMinor: number | null;
  currency?: string;
  onChangeMinor: (minor: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState("");
  const focused = useRef(false);

  useEffect(() => {
    if (focused.current) return;
    if (valueMinor == null || valueMinor === 0) {
      setText("");
    } else {
      setText(minorToInput(valueMinor, currency));
    }
  }, [valueMinor, currency]);

  return (
    <GlassInput
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        const parsed = inputToMinor(text, currency);
        if (parsed == null || parsed === 0) {
          setText("");
          onChangeMinor(null);
        } else {
          setText(minorToInput(parsed, currency));
          onChangeMinor(parsed);
        }
      }}
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d.]/g, "");
        // Prevent multiple decimal points
        const parts = next.split(".");
        const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : next;
        setText(sanitized);
        if (!sanitized || sanitized === ".") {
          onChangeMinor(null);
          return;
        }
        const parsed = inputToMinor(sanitized, currency);
        onChangeMinor(parsed);
      }}
    />
  );
}
