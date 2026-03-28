import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserProfile, RunRecord } from '../types';
import { calculateIdealPace, calculateCalories, paceFromDuration, formatPace } from '../utils/paceCalculator';
import { saveRecord } from '../utils/storage';

interface Props {
  profile: UserProfile | null;
  onRunComplete: (record: RunRecord) => void;
}

type RunState = 'idle' | 'running' | 'paused' | 'finished';

const GUIDANCE_MESSAGES = [
  'Ótimo ritmo! Mantenha a respiração regular.',
  'Você está indo bem! Relaxe os ombros.',
  'Continue assim! Olhe para frente, não para o chão.',
  'Metade do caminho! Você consegue!',
  'Quase lá! Cada passo conta.',
  'Mantenha o pace – não acelere ainda.',
  'Respire fundo. Você está no controle.',
];

export function RunningMode({ profile, onRunComplete }: Props) {
  const [runState, setRunState] = useState<RunState>('idle');
  const [targetDistance, setTargetDistance] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentGuidance, setCurrentGuidance] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guidanceRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const idealPace = profile ? calculateIdealPace(profile) : { minutesPerKm: 8, formattedPace: '8:00 /km' };

  const estimatedDurationSeconds = Math.round(idealPace.minutesPerKm * targetDistance * 60);
  const progressPercent = Math.min((elapsedSeconds / estimatedDurationSeconds) * 100, 100);

  const currentPace = elapsedSeconds > 0
    ? paceFromDuration(Math.max(targetDistance * (progressPercent / 100), 0.01), elapsedSeconds)
    : idealPace.minutesPerKm;

  const startRun = useCallback(() => {
    setRunState('running');
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    guidanceRef.current = setInterval(() => {
      setCurrentGuidance((g) => (g + 1) % GUIDANCE_MESSAGES.length);
    }, 30000);
  }, []);

  const pauseRun = useCallback(() => {
    setRunState('paused');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (guidanceRef.current) clearInterval(guidanceRef.current);
  }, []);

  const resumeRun = useCallback(() => {
    setRunState('running');
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const finishRun = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (guidanceRef.current) clearInterval(guidanceRef.current);
    setRunState('finished');

    const completedDistance = targetDistance * (progressPercent / 100);
    const record: RunRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      distanceKm: Math.round(completedDistance * 10) / 10,
      durationSeconds: elapsedSeconds,
      avgPaceMinPerKm: currentPace,
      calories: calculateCalories(completedDistance, elapsedSeconds / 60, profile?.weight),
    };
    saveRecord(record);
    onRunComplete(record);
  }, [targetDistance, progressPercent, elapsedSeconds, currentPace, profile, onRunComplete]);

  const resetRun = useCallback(() => {
    setRunState('idle');
    setElapsedSeconds(0);
    setCurrentGuidance(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (guidanceRef.current) clearInterval(guidanceRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (runState === 'finished') {
    const completedDistance = Math.round(targetDistance * (progressPercent / 100) * 10) / 10;
    const calories = calculateCalories(completedDistance, elapsedSeconds / 60, profile?.weight);
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Corrida concluída!</h2>
        <p className="text-gray-500 mb-6">Ótimo trabalho, {profile?.name || 'Corredor'}!</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">{completedDistance}</p>
            <p className="text-xs text-gray-500">km</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">{formatTime(elapsedSeconds)}</p>
            <p className="text-xs text-gray-500">tempo</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-orange-600">{calories}</p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
        </div>
        <button
          onClick={resetRun}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Nova corrida
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🏃 Modo Corrida</h2>
      <p className="text-gray-500 mb-6 text-sm">Orientação em tempo real para sua corrida.</p>

      {runState === 'idle' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Distância alvo</label>
          <div className="flex gap-2">
            {[2, 3, 5, 10].map((d) => (
              <button
                key={d}
                onClick={() => setTargetDistance(d)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  targetDistance === d
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="bg-gray-900 rounded-2xl p-8 text-center mb-6">
        <p className="text-7xl font-mono font-bold text-white mb-2">{formatTime(elapsedSeconds)}</p>
        <p className="text-gray-400 text-sm">tempo decorrido</p>

        {runState !== 'idle' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-green-400">{formatPace(currentPace)}</p>
              <p className="text-gray-500 text-xs">pace atual</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {Math.round(targetDistance * (progressPercent / 100) * 10) / 10} km
              </p>
              <p className="text-gray-500 text-xs">distância</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {runState !== 'idle' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-500 mt-1">Meta: {targetDistance} km</p>
        </div>
      )}

      {/* Guidance Message */}
      {runState === 'running' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm font-medium text-green-700">💬 {GUIDANCE_MESSAGES[currentGuidance]}</p>
        </div>
      )}

      {/* Ideal Pace Info */}
      {runState === 'idle' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            Seu pace recomendado: <strong>{idealPace.formattedPace}</strong>
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Tempo estimado: {formatTime(estimatedDurationSeconds)}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {runState === 'idle' && (
          <button
            onClick={startRun}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            ▶ Iniciar corrida
          </button>
        )}
        {runState === 'running' && (
          <>
            <button
              onClick={pauseRun}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              ⏸ Pausar
            </button>
            <button
              onClick={finishRun}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              ⏹ Finalizar
            </button>
          </>
        )}
        {runState === 'paused' && (
          <>
            <button
              onClick={resumeRun}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              ▶ Retomar
            </button>
            <button
              onClick={finishRun}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              ⏹ Finalizar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
