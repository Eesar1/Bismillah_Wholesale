const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export const formatPkr = (amount: number) => {
  return pkrFormatter.format(amount);
};
