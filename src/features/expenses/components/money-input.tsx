import { useEffect, useState } from "react";
import { inputToMinor, minorToInput } from "@/lib/money";
import { GlassInput } from "./glass";

export function MoneyInput({
  valueMinor,
  currency = "INR",
  onChangeMinor,
  placeholder = "0.00",
  className,
}: {
  valueMinor: number | null;
  currency?: string;
  onChangeMinor: (minor: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(valueMinor != null ? minorToInput(valueMinor, currency) : "");

  useEffect(() => {
    if (valueMinor != null) setText(minorToInput(valueMinor, currency));
    else if (valueMinor === null) setText("");
  }, [valueMinor, currency]);

  return (
    <GlassInput
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={text}
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d.]/g, "");
        setText(next);
        onChangeMinor(inputToMinor(next, currency));
      }}
    />
  );
}
