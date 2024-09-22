export const evalTimeOfUse = (timeBasedUsage: { kWh: number; rate: number }[], optOutRate: number) => {
  const totalkWh = Math.round(timeBasedUsage.reduce<number>((acc, currentValue) => {
    return acc + currentValue.kWh;
  }, 0));
  const optOutPriceInCents = toDecimalPlaces(optOutRate * totalkWh, 2);

  const timeOfUsePriceInCents = toDecimalPlaces(timeBasedUsage.reduce<number>((acc, currentValue) => {
    return acc + currentValue.kWh * currentValue.rate;
  }, 0), 2);

  const timeOfUseDeltaInCents = toDecimalPlaces(timeOfUsePriceInCents - optOutPriceInCents, 2);
  const timeOfUseDeltaPct = toDecimalPlaces(timeOfUseDeltaInCents / optOutPriceInCents, 2);

  return {
    optOutPriceInCents,
    timeOfUsePriceInCents,
    timeOfUseDeltaInCents,
    timeOfUseDeltaPct,
    totalkWh,
  };
};

const toDecimalPlaces = (val: number, places: number) => {
  return Number.parseFloat(val.toFixed(places));
};
