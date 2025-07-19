
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount);
};
