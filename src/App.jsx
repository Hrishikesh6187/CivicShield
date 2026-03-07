import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="shield">🛡️</span>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">CivicShield</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</button>
          <button className="text-gray-600 hover:text-blue-600 font-medium">Incidents</button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to CivicShield</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your community safety and digital wellness platform. This is a placeholder area for your main content.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 italic text-blue-800">
              Community Reporting
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100 italic text-green-800">
              Digital Wellness
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100 italic text-purple-800">
              Incident Analysis
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        © 2026 CivicShield. All rights reserved.
      </footer>
    </div>
  )
}

export default App
