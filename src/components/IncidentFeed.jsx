import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import IncidentCard from './IncidentCard';

const categories = ['All', 'Cybersecurity', 'Physical Safety', 'Digital Wellness', 'Information Leak'];
const severities = ['All', 'High', 'Medium', 'Low'];

export default function IncidentFeed() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterSeverity, setFilterSeverity] = useState('All');

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

    const filteredIncidents = incidents.filter((incident) => {
        const matchesSearch =
            incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            incident.clean_summary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'All' || incident.category === filterCategory;
        const matchesSeverity = filterSeverity === 'All' || incident.severity === filterSeverity;

        return matchesSearch && matchesCategory && matchesSeverity;
    });

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:w-1/3">
                        <div className="space-y-3">
                            <label htmlFor="category" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                            <select
                                id="category"
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-4 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all text-lg font-medium cursor-pointer"
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
                                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 px-4 py-4 rounded-2xl focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300 outline-none transition-all text-lg font-medium cursor-pointer"
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                            >
                                {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
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
                    <p className="text-slate-500 text-xl font-medium">Your community is safe!</p>
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
