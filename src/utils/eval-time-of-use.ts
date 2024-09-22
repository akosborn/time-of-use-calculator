export const evalTimeOfUse = (timeBasedUsage: { kWh: number; rateInCents: number }[], optOutRateInCents: number) => {
  const totalkWh = timeBasedUsage.reduce<number>((acc, currentValue) => {
    return acc + currentValue.kWh;
  }, 0);
  const optOutPriceInCents = optOutRateInCents * totalkWh;

  const timeOfUsePriceInCents = timeBasedUsage.reduce<number>((acc, currentValue) => {
    return acc + currentValue.kWh * currentValue.rateInCents;
  }, 0);

  const timeOfUseDeltaInCents = timeOfUsePriceInCents - optOutPriceInCents;
  const timeOfUseDeltaPct = timeOfUseDeltaInCents / optOutPriceInCents;

  return {
    optOutPriceInCents,
    timeOfUsePriceInCents,
    timeOfUseDeltaInCents,
    timeOfUseDeltaPct,
    totalkWh,
  };
};

// const toDecimalPlaces = (val: number, places: number) => {
//   return Number.parseFloat(val.toFixed(places));
// };
