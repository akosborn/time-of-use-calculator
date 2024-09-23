'use client';

import {evalTimeOfUse} from '@/utils/eval-time-of-use';
import {RATES_2024, RATES_AS_OF_DATE} from '@/data/time-of-use';
import {useEffect, useState} from 'react';
import * as fs from 'node:fs/promises';

type RateTime = 'offPeak' | 'midPeak' | 'onPeak';

const SEASONS = ['summer', 'winter'] as const;
type Season = typeof SEASONS[number];

export default function Home() {
  const [season, setSeason] = useState<Season>(SEASONS[0]);

  const [usageByTimeInkWh, setUsageByTimeInkWh] = useState<Record<RateTime, number | undefined>>({
    offPeak: 1,
    midPeak: 1,
    onPeak: 1,
  });

  const rateSummary = RATES_2024.find((summary) => summary.season === season);

  if (!rateSummary) {
    return;
  }

  const usageByTimeOfUseRate = Object.keys(usageByTimeInkWh).reduce<{ kWh: number; rateInCents: number }[]>((acc, timeKey) => {
    const kWh = usageByTimeInkWh[timeKey as unknown as RateTime] as number;
    const rateInCents = rateSummary.timeOfUse[timeKey as unknown as RateTime];
    acc.push({ kWh, rateInCents: rateInCents });
    return acc;
  }, []);

  const timeOfUseResults = evalTimeOfUse(usageByTimeOfUseRate, rateSummary.optOut);
  const isTimeOfUseCheaper = timeOfUseResults.timeOfUseDeltaInCents < 0;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Time of Use vs Opt-Out</h2>
          <div className="mb-4">
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Determines which of either the Time of Use or Opt-Out Colorado Xcel rate plans is cheaper based on the season
              and usage across the three different Time of Use rates. The time-based usage can be found on Xcel bills if the
              account has a smart meter installed.
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Note that rates can change quarterly. This tool only calculates based on the latest rates.
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Rates as of {RATES_AS_OF_DATE}
            </p>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
              Season
            </label>
            <div className="mt-2">
              <select
                id="season"
                name="season"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                onChange={(event) => setSeason(event.currentTarget.value as Season)}
              >
                {SEASONS.map((season) => {
                  return (
                    <option value={season} key={season}>
                      {season}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-1">
              <label htmlFor="off-peak" className="block text-sm font-medium leading-6 text-gray-900">
                Off-Peak (kWh)
              </label>
              <div className="mt-2">
                <input
                  id="off-peak"
                  name="off-peak"
                  type="number"
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={usageByTimeInkWh.offPeak === 0 ? undefined : usageByTimeInkWh.offPeak}
                  onChange={(event) => setUsageByTimeInkWh((prev) => ({
                    ...prev,
                    offPeak: event.target.valueAsNumber || 0
                  }))}
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="mid-peak" className="block text-sm font-medium leading-6 text-gray-900">
                Mid-Peak (kWh)
              </label>
              <div className="mt-2">
                <input
                  id="mid-peak"
                  name="mid-peak"
                  type="number"
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={usageByTimeInkWh.midPeak === 0 ? undefined : usageByTimeInkWh.midPeak}
                  onChange={(event) => setUsageByTimeInkWh((prev) => ({
                    ...prev,
                    midPeak: event.target.valueAsNumber || 0
                  }))}
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="on-peak" className="block text-sm font-medium leading-6 text-gray-900">
                On-Peak (kWh)
              </label>
              <div className="mt-2">
                <input
                  id="on-peak"
                  name="on-peak"
                  type="number"
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={usageByTimeInkWh.onPeak === 0 ? undefined : usageByTimeInkWh.onPeak}
                  onChange={(event) => setUsageByTimeInkWh((prev) => ({
                    ...prev,
                    onPeak: event.target.valueAsNumber || 0
                  }))}
                />
              </div>
            </div>

            <div className="sm:col-span-full">
              <p className="mt-1 text-sm leading-6 text-gray-600 font-bold">
                {isTimeOfUseCheaper ?
                  <>
                    Time of Use is {Math.round(Math.abs(timeOfUseResults.timeOfUseDeltaPct) * 100)}%
                    (${centsToDollars(Math.abs(timeOfUseResults.timeOfUseDeltaInCents))}) cheaper
                  </>
                  :
                  <>
                    Opt-Out is {Math.round(Math.abs(timeOfUseResults.timeOfUseDeltaPct) * 100)}%
                    (${centsToDollars(Math.abs(timeOfUseResults.timeOfUseDeltaInCents))}) cheaper
                  </>
                }
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600 font-bold">
                Time of Use Total Cost: ${centsToDollars(timeOfUseResults.timeOfUsePriceInCents)}
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600 font-bold">
                Opt-Out Total Cost: ${centsToDollars(timeOfUseResults.optOutPriceInCents)}
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600 font-bold">
                Total kWh: {timeOfUseResults.totalkWh}
              </p>
            </div>

            <div className="sm:col-span-full">
              <p className="mt-1 text-sm leading-6 text-gray-600 font-bold">
                Rate Summary (per kWh)
              </p>
              <div>
                <div className="mt-2 text-sm leading-6 text-black">
                  Opt-Out: ${centsToDollars(rateSummary.optOut)}
                </div>
                <div className="mt-2 text-sm leading-6 text-black">
                  Off-Peak: ${centsToDollars(rateSummary.timeOfUse.offPeak)}
                </div>
                <div className="mt-2 text-sm leading-6 text-black">
                  Mid-Peak: ${centsToDollars(rateSummary.timeOfUse.midPeak)}
                </div>
                <div className="mt-2 text-sm leading-6 text-black">
                  On-Peak: ${centsToDollars(rateSummary.timeOfUse.onPeak)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const centsToDollars = (cents: number): string => {
  return (cents / 100).toFixed(2);
};
