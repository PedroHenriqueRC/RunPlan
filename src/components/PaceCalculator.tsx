import { useState } from 'react';
import type { UserProfile, Pace } from '../types';
import { calculateIdealPace } from '../utils/paceCalculator';
import { saveProfile } from '../utils/storage';

interface Props {
  initialProfile?: UserProfile | null;
  onProfileSaved: (profile: UserProfile, pace: Pace) => void;
}

const FITNESS_LABELS: Record<UserProfile['fitnessLevel'], string> = {
  beginner: 'Iniciante – raramente pratico exercícios',
  intermediate: 'Intermediário – pratico exercícios 2-3x por semana',
  advanced: 'Avançado – pratico exercícios regularmente',
};

export function PaceCalculator({ initialProfile, onProfileSaved }: Props) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [fitnessLevel, setFitnessLevel] = useState<UserProfile['fitnessLevel']>(
    initialProfile?.fitnessLevel || 'beginner'
  );
  const [age, setAge] = useState<string>(initialProfile?.age?.toString() || '');
  const [weight, setWeight] = useState<string>(initialProfile?.weight?.toString() || '');
  const [result, setResult] = useState<Pace | null>(null);

  const handleCalculate = () => {
    const profile: UserProfile = {
      name: name || 'Corredor',
      fitnessLevel,
      age: age ? parseInt(age, 10) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
    };
    const pace = calculateIdealPace(profile);
    setResult(pace);
    saveProfile(profile);
    onProfileSaved(profile, pace);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🏃 Calculadora de Pace</h2>
      <p className="text-gray-500 mb-6 text-sm">Descubra seu ritmo ideal para começar a correr sem se machucar.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nível de condicionamento físico</label>
          <div className="space-y-2">
            {(Object.keys(FITNESS_LABELS) as UserProfile['fitnessLevel'][]).map((level) => (
              <label key={level} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="fitnessLevel"
                  value={level}
                  checked={fitnessLevel === level}
                  onChange={() => setFitnessLevel(level)}
                  className="mt-1 accent-green-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-green-700">{FITNESS_LABELS[level]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade (opcional)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex: 30"
              min={10}
              max={100}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso em kg (opcional)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 70"
              min={30}
              max={200}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Calcular meu pace ideal
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm text-green-700 font-medium mb-1">Seu pace ideal é:</p>
          <p className="text-4xl font-bold text-green-600">{result.formattedPace}</p>
          <p className="text-sm text-gray-600 mt-2">
            Esse é o ritmo recomendado para suas corridas. Comece devagar e aumente gradualmente!
          </p>
        </div>
      )}
    </div>
  );
}
