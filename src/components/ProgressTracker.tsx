
import type { RunRecord } from '../types';
import { formatPace } from '../utils/paceCalculator';

interface Props {
  records: RunRecord[];
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProgressTracker({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu progresso</h2>
        <p className="text-gray-500">
          Você ainda não tem corridas registradas. Complete sua primeira corrida para ver seu progresso aqui!
        </p>
      </div>
    );
  }

  const totalDistance = records.reduce((sum, r) => sum + r.distanceKm, 0);
  const totalCalories = records.reduce((sum, r) => sum + r.calories, 0);
  const avgPace = records.reduce((sum, r) => sum + r.avgPaceMinPerKm, 0) / records.length;

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Seu progresso</h2>
      <p className="text-gray-500 mb-6 text-sm">Acompanhe sua evolução e comemore cada corrida!</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{totalDistance.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">km totais</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{records.length}</p>
          <p className="text-xs text-gray-500 mt-1">corridas</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{totalCalories}</p>
          <p className="text-xs text-gray-500 mt-1">kcal queimadas</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{formatPace(avgPace)}</p>
          <p className="text-xs text-gray-500 mt-1">pace médio</p>
        </div>
      </div>

      {/* Records List */}
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Histórico de corridas</h3>
      <div className="space-y-3">
        {sortedRecords.map((record) => (
          <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{formatDate(record.date)}</p>
                <p className="text-xs text-gray-500">{formatPace(record.avgPaceMinPerKm)} • {record.calories} kcal</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{record.distanceKm} km</p>
                <p className="text-xs text-gray-500">{formatTime(record.durationSeconds)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivation */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
        <p className="text-sm text-yellow-800 font-medium">
          🌟 Continue assim! A consistência é a chave para evoluir sem se machucar.
        </p>
      </div>
    </div>
  );
}
