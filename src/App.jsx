import React, { useState } from 'react';
import IncidentFeed from './components/IncidentFeed';
import SubmitIncident from './components/SubmitIncident';

function App() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="shield">🛡️</span>
            <span className="text-2xl font-bold tracking-tight">CivicShield</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2.5 rounded-full font-bold text-base transition-all border-2 ${activeTab === 'feed'
                  ? 'bg-white text-slate-800 border-white'
                  : 'text-white border-transparent hover:bg-slate-700'
                }`}
            >
              View Incidents
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-2.5 rounded-full font-bold text-base transition-all border-2 ${activeTab === 'submit'
                  ? 'bg-white text-slate-800 border-white'
                  : 'text-white border-transparent hover:bg-slate-700'
                }`}
            >
              Report Incident
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
            {activeTab === 'feed' ? 'Community Safety Feed' : 'Submit a Safety Report'}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {activeTab === 'feed'
              ? 'Stay informed about local safety incidents and digital wellness updates in your neighborhood.'
              : 'Provide context for our automated engine to analyze and provide safety recommendations.'}
          </p>
        </div>

        {activeTab === 'feed' && <IncidentFeed />}
        {activeTab === 'submit' && (
          <SubmitIncident onSuccess={() => setActiveTab('feed')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label="shield">🛡️</span>
              <span className="text-xl font-bold text-slate-800">CivicShield</span>
            </div>
            <p className="text-slate-500 text-sm">Building safer communities through digital wellness.</p>
          </div>

          <div className="flex gap-10 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Help Center</a>
          </div>

          <div className="text-slate-400 text-sm">
            © 2026 CivicShield Project
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
