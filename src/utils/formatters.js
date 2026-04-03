export function formatAmount(value, options = {}) {
  const { signed = false, decimals } = options;
  const absoluteValue = Math.abs(value);
  const minimumFractionDigits =
    typeof decimals === "number" ? decimals : Number.isInteger(absoluteValue) ? 0 : 2;

  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(absoluteValue);

  if (!signed) {
    return `Rs ${formatted}`;
  }

  return `${value >= 0 ? "+" : "-"}Rs ${formatted}`;
}

export function formatAmountByType(amount, type) {
  const signedValue = type === "income" ? amount : -amount;
  return formatAmount(signedValue, { signed: true });
}

export function formatDisplayDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMonthLabel(value) {
  const [year, month] = value.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));
}
