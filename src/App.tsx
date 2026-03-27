import { useState, useEffect } from 'react';
import type { UserProfile, Pace, RunRecord } from './types';
import { PaceCalculator } from './components/PaceCalculator';
import { TrainingPlan } from './components/TrainingPlan';
import { RunningMode } from './components/RunningMode';
import { ProgressTracker } from './components/ProgressTracker';
import { loadProfile, loadRecords } from './utils/storage';

type Tab = 'pace' | 'plan' | 'run' | 'progress';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'pace', label: 'Pace', icon: '⚡' },
  { id: 'plan', label: 'Plano', icon: '📅' },
  { id: 'run', label: 'Correr', icon: '🏃' },
  { id: 'progress', label: 'Progresso', icon: '📊' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('pace');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<RunRecord[]>([]);

  useEffect(() => {
    setProfile(loadProfile());
    setRecords(loadRecords());
  }, []);

  const handleProfileSaved = (p: UserProfile, _pace: Pace) => {
    setProfile(p);
  };

  const handleRunComplete = (record: RunRecord) => {
    setRecords((prev) => [...prev, record]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-green-500 text-white p-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏅</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">RunPlan</h1>
            <p className="text-green-100 text-xs">Corrida Inteligente para Iniciantes</p>
          </div>
          {profile && (
            <span className="ml-auto text-sm text-green-100">Olá, {profile.name}!</span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'pace' && (
          <PaceCalculator
            initialProfile={profile}
            onProfileSaved={handleProfileSaved}
          />
        )}
        {activeTab === 'plan' && <TrainingPlan profile={profile} />}
        {activeTab === 'run' && (
          <RunningMode profile={profile} onRunComplete={handleRunComplete} />
        )}
        {activeTab === 'progress' && <ProgressTracker records={records} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === tab.id
                ? 'text-green-600 border-t-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
