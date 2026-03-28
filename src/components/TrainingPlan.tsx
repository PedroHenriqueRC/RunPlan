import { useState } from 'react';
import type { UserProfile, TrainingSession } from '../types';
import { generateTrainingPlan } from '../utils/trainingPlan';

interface Props {
  profile: UserProfile | null;
}

const DAY_NAMES = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const TYPE_COLORS: Record<TrainingSession['type'], string> = {
  easy: 'bg-blue-100 text-blue-800',
  moderate: 'bg-orange-100 text-orange-800',
  rest: 'bg-gray-100 text-gray-500',
};
const TYPE_LABELS: Record<TrainingSession['type'], string> = {
  easy: 'Leve',
  moderate: 'Moderado',
  rest: 'Descanso',
};

export function TrainingPlan({ profile }: Props) {
  const [goalDistance, setGoalDistance] = useState<number>(5);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [plan, setPlan] = useState<ReturnType<typeof generateTrainingPlan> | null>(null);

  const handleGenerate = () => {
    const p = profile || {
      name: 'Corredor',
      fitnessLevel: 'beginner' as const,
    };
    const generated = generateTrainingPlan(p, goalDistance);
    setPlan(generated);
    setActiveWeek(1);
  };

  const weekSessions = plan?.sessions.filter((s) => s.week === activeWeek) || [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">📅 Plano de Treino</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Um plano progressivo de 10% por semana para você evoluir sem se machucar.
      </p>

      <div className="flex gap-4 items-end mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta de distância</label>
          <select
            value={goalDistance}
            onChange={(e) => setGoalDistance(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={3}>3 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={21}>Meia maratona (21 km)</option>
          </select>
        </div>
        <button
          onClick={handleGenerate}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Gerar plano
        </button>
      </div>

      {plan && (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            {Array.from({ length: plan.totalWeeks }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  week === activeWeek
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semana {week}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {weekSessions.map((session, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{DAY_NAMES[session.day]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[session.type]}`}>
                        {TYPE_LABELS[session.type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{session.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-green-600">{session.distanceKm} km</p>
                    <p className="text-xs text-gray-500">{session.targetPace.formattedPace}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Descanse nos dias sem treino. Hidrate-se bem e durma 7–8 horas.
          </p>
        </>
      )}
    </div>
  );
}
