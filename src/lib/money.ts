/* ---------------------------------------------------------------
 * Money — integer minor units only.
 *
 * Every amount in the expense module travels as `amountMinor`
 * (an integer) plus an ISO currency code. No float arithmetic is
 * ever performed on money: sums, splits and remainders are all
 * computed on integers.
 * ------------------------------------------------------------- */

export type Money = { amountMinor: number; currency: string };

const FRACTION_DIGITS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  VND: 0,
  CLP: 0,
  ISK: 0,
};

export function fractionDigits(currency: string): number {
  return FRACTION_DIGITS[currency.toUpperCase()] ?? 2;
}

function minorFactor(currency: string): number {
  return 10 ** fractionDigits(currency);
}

/** 5000, "INR" -> "₹50.00" */
export function formatMoney(
  amountMinor: number,
  currency = "INR",
  options: { compact?: boolean; signed?: boolean; hideDecimals?: boolean } = {},
): string {
  const digits = fractionDigits(currency);
  const negative = amountMinor < 0;
  const abs = Math.abs(Math.trunc(amountMinor));
  const value = abs / minorFactor(currency);

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    ...(options.compact ? { notation: "compact", maximumFractionDigits: 1 } : {}),
    ...(options.compact
      ? {}
      : {
          minimumFractionDigits: options.hideDecimals ? 0 : digits,
          maximumFractionDigits: options.hideDecimals ? 0 : digits,
        }),
  });

  const body = formatter.format(value);
  if (negative) return `-${body}`;
  if (options.signed) return `+${body}`;
  return body;
}

/** Digits-only editing value: 5000 -> "50.00" */
export function minorToInput(amountMinor: number, currency = "INR"): string {
  const digits = fractionDigits(currency);
  if (!Number.isFinite(amountMinor)) return "";
  const abs = Math.abs(Math.trunc(amountMinor));
  if (digits === 0) return String(abs);
  const whole = Math.floor(abs / minorFactor(currency));
  const frac = abs % minorFactor(currency);
  return `${whole}.${String(frac).padStart(digits, "0")}`;
}

/**
 * "1,250.5" -> 125050. Parsed by string surgery, not by
 * multiplying a float (which would give 125049.99999).
 */
export function inputToMinor(input: string, currency = "INR"): number | null {
  const digits = fractionDigits(currency);
  const cleaned = input.replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return null;
  const [wholeRaw = "0", fracRaw = ""] = cleaned.split(".");
  const whole = wholeRaw === "" ? "0" : wholeRaw;
  if (digits === 0) return Number(whole);
  const frac = fracRaw.slice(0, digits).padEnd(digits, "0");
  const minor = Number(whole) * minorFactor(currency) + Number(frac || "0");
  return Number.isFinite(minor) ? minor : null;
}

export function sumMinor(values: number[]): number {
  return values.reduce((total, value) => total + Math.trunc(value), 0);
}

/**
 * Split an integer amount across n shares so the parts always sum
 * back to exactly the original. Remainder pennies go to the last
 * shares, so 100000 / 3 -> [33333, 33333, 33334].
 */
export function splitEqualMinor(amountMinor: number, shares: number): number[] {
  if (shares <= 0) return [];
  const total = Math.trunc(amountMinor);
  const base = Math.floor(total / shares);
  const remainder = total - base * shares;
  return Array.from({ length: shares }, (_, index) =>
    index >= shares - remainder ? base + 1 : base,
  );
}

export function percentOf(part: number, total: number): number {
  if (!total) return 0;
  return (Math.trunc(part) / Math.trunc(total)) * 100;
}

/** Human delta between two integer amounts, e.g. "12.4". */
export function deltaPercent(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
