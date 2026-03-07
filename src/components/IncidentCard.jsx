import React from 'react';
import { supabase } from '../lib/supabase';

const severityStyles = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
};

const statusStyles = {
    resolved: 'bg-green-50 text-green-600 border-green-100',
    investigating: 'bg-amber-50 text-amber-600 border-amber-100',
    active: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function IncidentCard({ incident, onUpdate }) {
    const {
        id,
        title,
        category,
        severity,
        clean_summary,
        location,
        status,
        created_at,
        ai_used,
    } = incident;

    const handleStatusUpdate = async (newStatus) => {
        const { error } = await supabase
            .from('incidents')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        } else if (onUpdate) {
            onUpdate();
        }
    };

    return (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl transition-all card-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${severityStyles[severity]}`}>
                            {severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            {category}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 leading-tight">{title}</h3>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyles[status] || statusStyles.active}`}>
                        {status}
                    </span>
                </div>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed mb-8 flex-1">
                {clean_summary}
            </p>

            <div className="mt-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 mb-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</span>
                        <span className="text-base text-slate-700 font-medium">{location}</span>
                    </div>
                    <div className="flex flex-col sm:items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reported On</span>
                        <span className="text-base text-slate-700 font-medium">
                            {new Date(created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {status === 'active' && (
                            <button
                                onClick={() => handleStatusUpdate('investigating')}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                            >
                                Investigate
                            </button>
                        )}
                        {status === 'investigating' && (
                            <button
                                onClick={() => handleStatusUpdate('resolved')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                            >
                                Mark Resolved
                            </button>
                        )}
                    </div>

                    <div className="text-sm font-bold text-slate-400 italic flex items-center gap-1.5">
                        {ai_used ? (
                            <>
                                <span className="text-indigo-500">✓</span> AI Analyzed
                            </>
                        ) : (
                            <>
                                <span className="text-slate-400">⚙</span> Auto-Classified
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
