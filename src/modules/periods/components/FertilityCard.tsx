import { Heart, Leaf, Sparkles } from 'lucide-react';
import { useFertilityPrediction } from '@/modules/periods/hooks/useFertilityPrediction';
import { differenceInDays, isSameDay } from '@/utils/datetime';

type FertilityStatus = 'low' | 'fertile' | 'peak';

function getFertilityStatus(
  prediction: ReturnType<typeof useFertilityPrediction>,
): {
  status: FertilityStatus;
  title: string;
  Icon: React.ElementType;
  description: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    hasSufficientData,
    fertileWindowEndDate,
    fertileWindowStartDate,
    ovulationDate,
  } = prediction;

  if (!hasSufficientData || !fertileWindowStartDate || !fertileWindowEndDate) {
    return {
      status: 'low',
      title: 'Awaiting Data',
      Icon: Leaf,
      description: 'Once you log a few cycles, we can predict your fertile window.',
    };
  }

  const isFertile = today >= fertileWindowStartDate && today <= fertileWindowEndDate;
  const isPeak = ovulationDate ? isSameDay(today, ovulationDate) : false;

  if (isPeak) {
    return {
      status: 'peak',
      title: 'Estimated Peak Fertility',
      Icon: Sparkles,
      description: 'Today matches your estimated ovulation day.',
    };
  }

  if (isFertile) {
    const daysUntilOvulation = ovulationDate
      ? differenceInDays(ovulationDate, today)
      : null;
    return {
      status: 'fertile',
      title: 'Estimated Fertile Window',
      Icon: Heart,
      description:
        daysUntilOvulation !== null
          ? `Estimated ovulation in ${daysUntilOvulation} day${daysUntilOvulation === 1 ? '' : 's'}.`
          : 'Today falls in your estimated fertile window.',
    };
  }

  if (today > fertileWindowEndDate) {
    return {
      status: 'low',
      title: 'Previous Window Passed',
      Icon: Leaf,
      description: 'Your estimated fertile window already passed. Log your next period for a fresh estimate.',
    };
  }

  // Not fertile yet, calculate time until next window
  const daysUntilFertile = differenceInDays(fertileWindowStartDate, today);
  return {
    status: 'low',
    title: 'Low Fertility',
    Icon: Leaf,
    description: `Next estimated fertile window in ${daysUntilFertile} day${daysUntilFertile === 1 ? '' : 's'}.`,
  };
}

export function FertilityCard() {
  const prediction = useFertilityPrediction();

  if (prediction.isLoading) {
    return (
      <div className="skeleton card w-full bg-base-100 shadow-xl h-36"></div>
    );
  }

  const { status, title, Icon, description } = getFertilityStatus(prediction);

  const statusColors = {
    low: 'text-success',
    fertile: 'text-warning',
    peak: 'text-error',
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <h2 className="card-title text-base font-medium text-base-content/70">
            Fertility Estimate
          </h2>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div
            className={`grid h-12 w-12 flex-shrink-0 place-content-center rounded-full ${statusColors[status]}/10`}
          >
            <Icon size={24} className={statusColors[status]} />
          </div>
          <div>
            <p className={`font-bold text-lg ${statusColors[status]}`}>
              {title}
            </p>
            <p className="text-sm text-base-content/80">{description}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-base-content/70">
          Estimates only. Do not use for contraception, pregnancy planning, or medical decisions.
        </p>
      </div>
    </div>
  );
}
