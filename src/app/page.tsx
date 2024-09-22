import {evalTimeOfUse} from '@/utils/eval-time-of-use';
import {RATES_2024} from '@/data/time-of-use';

type RateTime = 'offPeak' | 'midPeak' | 'onPeak';

export default function Home() {
  const season: 'summer' | 'winter' = 'summer';
  const rateSummary = RATES_2024.find((summary) => summary.season === season);

  if (!rateSummary) {
    return;
  }

  const usageInkWh: Record<RateTime, number> = {
    offPeak: 631,
    midPeak: 45,
    onPeak: 91,
  };

  const usageByTimeOfUseRate = Object.keys(usageInkWh).reduce<{ kWh: number; rate: number }[]>((acc, timeKey) => {
    const kWh = usageInkWh[timeKey as unknown as RateTime] as number;
    const rate = rateSummary.timeOfUse[timeKey as unknown as RateTime];
    acc.push({ kWh, rate });
    return acc;
  }, []);

  const timeOfUseResults = evalTimeOfUse(usageByTimeOfUseRate, rateSummary.optOut);
  const isTimeOfUseCheaper = timeOfUseResults.timeOfUseDeltaInCents < 0;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          {JSON.stringify(usageByTimeOfUseRate)}
        </div>
        <div>
          Total kWh: {timeOfUseResults.totalkWh}
        </div>
        <div>
          <b>Rate Summary</b>
          <div>{JSON.stringify(rateSummary)}</div>
        </div>
        <div>
          {isTimeOfUseCheaper &&
              <>Time of Use is {Math.abs(timeOfUseResults.timeOfUseDeltaPct) * 100}% (${Math.abs(timeOfUseResults.timeOfUseDeltaInCents).toFixed(2)}) cheaper</>
          }
        </div>
        <div>
          {JSON.stringify(timeOfUseResults)}
        </div>
      </main>
    </div>
  );
}
