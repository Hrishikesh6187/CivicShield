import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import IncidentCard from './IncidentCard';

const categories = ['All', 'Phishing', 'Network Security', 'Scam', 'Data Breach'];
const severities = ['All', 'High', 'Medium', 'Low'];
const statuses = ['All', 'active', 'investigating', 'resolved'];

export default function IncidentFeed() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterSeverity, setFilterSeverity] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterLocation, setFilterLocation] = useState('All');

    const [summary, setSummary] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [showSummaryCard, setShowSummaryCard] = useState(false);
    const [lastGenerated, setLastGenerated] = useState(null);

    const [topAlerts, setTopAlerts] = useState([]);
    const [isFilteringAlerts, setIsFilteringAlerts] = useState(false);
    const [alertSource, setAlertSource] = useState('AI'); // 'AI' or 'Auto'

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('incidents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setIncidents(data || []);
        } catch (err) {
            console.error('Error fetching incidents:', err);
            setError('System connection interrupted. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchTopAlerts = async (currentIncidents) => {
        if (!currentIncidents || currentIncidents.length === 0) return;

        const activeIncidents = currentIncidents.filter(i =>
            i.status === 'active' || i.status === 'investigating'
        );

        setIsFilteringAlerts(true);
        try {
            const response = await fetch('/.netlify/functions/filter-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ incidents: activeIncidents })
            });

            if (!response.ok) throw new Error('Alert filtering failed');

            const alerts = await response.json();
            setTopAlerts(alerts);
            setAlertSource('AI');
        } catch (err) {
            console.error('Error filtering alerts with AI:', err);
            // Fallback: Top 3 by severity and date
            const fallbackAlerts = [...currentIncidents]
                .sort((a, b) => {
                    const severityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    if (severityMap[b.severity] !== severityMap[a.severity]) {
                        return severityMap[b.severity] - severityMap[a.severity];
                    }
                    return new Date(b.created_at) - new Date(a.created_at);
                })
                .slice(0, 3)
                .map(i => ({
                    id: i.id,
                    title: i.title,
                    category: i.category,
                    severity: i.severity,
                    location: i.location,
                    why_it_matters: `This ${i.category.toLowerCase()} incident in ${i.location} is a high priority for community awareness.`,
                    immediate_action: `Check the details below and stay alert in the ${i.location} area.`
                }));
            setTopAlerts(fallbackAlerts);
            setAlertSource('Auto');
        } finally {
            setIsFilteringAlerts(false);
        }
    };

    useEffect(() => {
        if (incidents.length > 0 && topAlerts.length === 0) {
            fetchTopAlerts(incidents);
        }
    }, [incidents]);

    const generateDailySummary = async () => {
        setIsGeneratingSummary(true);
        setSummary(null);
        try {
            const summaryPayload = {
                total: incidents.length,
                active: incidents.filter(i => i.status === 'active').length,
                resolved: incidents.filter(i => i.status === 'resolved').length,
                investigating: incidents.filter(i => i.status === 'investigating').length,
                highCount: incidents.filter(i => i.severity === 'High' && i.status === 'active').length,
                mediumCount: incidents.filter(i => i.severity === 'Medium' && i.status === 'active').length,
                lowCount: incidents.filter(i => i.severity === 'Low' && i.status === 'active').length,
                locations: [...new Set(incidents.map(i => i.location))],
                categories: incidents.reduce((acc, i) => {
                    acc[i.category] = (acc[i.category] || 0) + 1;
                    return acc;
                }, {}),
                topIncidents: incidents
                    .filter(i => i.severity === 'High' && i.status === 'active')
                    .slice(0, 3)
                    .map(i => ({ title: i.title, location: i.location, category: i.category }))
            };

            const response = await fetch('/.netlify/functions/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(summaryPayload)
            });

            if (!response.ok) throw new Error('Summary generation failed');

            const result = await response.json();
            setSummary(result.summary);
            setLastGenerated(new Date().toLocaleTimeString());
            setShowSummaryCard(true);
        } catch (err) {
            console.error('Error generating summary:', err);
            setSummary("Your community safety team is actively monitoring local incidents. \nPlease review the feed below for the latest updates in your area. \nRemember: staying informed is the best way to stay safe.");
            setShowSummaryCard(true);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // Dynamically derive location suggestions based on frequency
    const locationSuggestions = React.useMemo(() => {
        const counts = {};
        incidents.forEach(inc => {
            if (inc.location) {
                counts[inc.location] = (counts[inc.location] || 0) + 1;
            }
        });

        const sortedLocations = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        return ['All', ...sortedLocations];
    }, [incidents]);

    const filteredIncidents = incidents.filter((incident) => {
        const matchesSearch =
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.clean_summary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'All' || incident.category === filterCategory;
        const matchesSeverity = filterSeverity === 'All' || incident.severity === filterSeverity;
        const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
        const matchesLocation = filterLocation === 'All' || incident.location === filterLocation;

        return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesLocation;
    });

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Daily Summary Button */}
            <div className="flex justify-center">
                <button
                    onClick={generateDailySummary}
                    disabled={isGeneratingSummary}
                    className={`w-full lg:w-auto px-12 py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-4 active:scale-95 ${isGeneratingSummary
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-slate-200/50'
                        }`}
                >
                    {isGeneratingSummary ? (
                        <>
                            <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                            Generating your community summary...
                        </>
                    ) : (
                        <>{summary ? '🔄 Refresh Summary' : '📋 Generate Daily Summary'}</>
                    )}
                </button>
            </div>

            {/* Daily Summary Brief Card */}
            {showSummaryCard && summary && (
                <div className="bg-sky-50 border-2 border-sky-100 p-8 rounded-[2.5rem] shadow-sm relative animate-in zoom-in-95 duration-300">
                    <button
                        onClick={() => setShowSummaryCard(false)}
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white border border-sky-100 text-sky-400 hover:text-sky-600 rounded-full transition-colors shadow-sm"
                    >
                        ✕
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">🛡️</span>
                        <div>
                            <h3 className="text-xl font-black text-[#1e293b] leading-none uppercase tracking-tight">CivicShield Daily Brief</h3>
                            <p className="text-sky-600 font-bold text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                            {summary}
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-sky-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-sky-400">
                        <span>AI-generated based on community reports. Always verify critical information with local authorities.</span>
                        {lastGenerated && <span className="text-sky-300">Last generated: {lastGenerated}</span>}
                    </div>
                </div>
            )}

            {/* Top Alerts Banner */}
            {topAlerts.length > 0 && (
                <div className="overflow-hidden rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-[#1e293b] p-6 flex items-center justify-between relative overflow-hidden">
                        {/* Pulse animation effect */}
                        <div className="absolute inset-0 bg-sky-400/10 animate-pulse pointer-events-none"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <h2 className="text-white font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                                <span>🚨</span> Top Alerts — {alertSource === 'AI' ? 'AI Filtered' : 'System Filtered'}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${alertSource === 'AI' ? 'bg-sky-500 text-white' : 'bg-slate-600 text-slate-300'
                                }`}>
                                {alertSource === 'AI' ? 'AI Powered' : '⚙️ Auto-Filtered'}
                            </span>
                        </div>

                        <button
                            onClick={() => fetchTopAlerts(incidents)}
                            disabled={isFilteringAlerts}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 relative z-10"
                        >
                            {isFilteringAlerts ? 'Filtering...' : '🔄 Refresh Alerts'}
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {topAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`relative p-6 rounded-3xl border-l-8 transition-all hover:shadow-lg ${alert.severity === 'High' ? 'border-red-500 bg-red-50/30' :
                                        alert.severity === 'Medium' ? 'border-amber-400 bg-amber-50/30' :
                                            'border-emerald-400 bg-emerald-50/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${alert.severity === 'High' ? 'bg-red-100 text-red-600' :
                                            alert.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {alert.category}
                                        </span>
                                    </div>
                                    <h4 className="text-slate-900 font-black text-lg leading-tight mb-1">{alert.title}</h4>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-tight mb-4">{alert.location}</p>

                                    <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium italic">
                                        "{alert.why_it_matters}"
                                    </p>

                                    <div className={`p-4 rounded-2xl flex items-start gap-3 border shadow-sm ${alert.severity === 'High' ? 'bg-white border-red-100' :
                                        alert.severity === 'Medium' ? 'bg-white border-amber-100' :
                                            'bg-white border-emerald-100'
                                        }`}>
                                        <span className="text-xl">⚡</span>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Act Now</p>
                                            <p className="text-slate-800 text-xs font-bold leading-tight">{alert.immediate_action}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {alertSource === 'AI'
                                    ? `AI has filtered ${incidents.filter(i => i.status === 'active' || i.status === 'investigating').length} active incidents to show you what matters most`
                                    : `System has automatically prioritized the top ${topAlerts.length} reported incidents`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                        <label htmlFor="search" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                            <span role="img" aria-label="search">🔍</span> Search Incidents
                        </label>
                        <div className="relative">
                            <input
                                id="search"
                                type="text"
                                placeholder="Search by title, keywords or summary..."
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all placeholder:text-slate-400 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:w-2/3">
                        <div className="space-y-3">
                            <label htmlFor="location" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Location</label>
                            <select
                                id="location"
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-4 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all text-sm font-bold cursor-pointer"
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                            >
                                {locationSuggestions.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="category" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                            <select
                                id="category"
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-4 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all text-sm font-bold cursor-pointer"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="severity" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Severity</label>
                            <select
                                id="severity"
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-4 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all text-sm font-bold cursor-pointer"
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                            >
                                {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label htmlFor="status" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                            <select
                                id="status"
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-4 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all text-sm font-bold cursor-pointer capitalize"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-xl font-bold">Scanning neighborhood records...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-2 border-red-100 p-10 rounded-3xl text-center max-w-xl mx-auto shadow-sm">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-red-700 text-xl font-bold mb-6">{error}</p>
                    <button
                        onClick={fetchIncidents}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all shadow-md active:scale-95"
                    >
                        Reconnect to System
                    </button>
                </div>
            ) : filteredIncidents.length === 0 ? (
                <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] shadow-inner">
                    <div className="text-6xl mb-6">🌟</div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No incidents found.</h3>
                    <p className="text-slate-500 text-xl font-medium">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    {filteredIncidents.map((incident) => (
                        <IncidentCard
                            key={incident.id}
                            incident={incident}
                            onUpdate={fetchIncidents}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
