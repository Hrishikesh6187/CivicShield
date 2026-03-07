import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SubmitIncident({ onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        raw_text: '',
        location: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccess(false);
        setError(null);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.title) errors.title = 'Please provide a clear title for the incident.';
        if (!formData.location) errors.location = 'Please tell us where this happened.';
        if (!formData.raw_text) errors.raw_text = 'Please describe the incident so we can help.';
        return errors;
    };

    const currentErrors = validate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setTouched({ title: true, raw_text: true, location: true });
            setError('Please fill in all requested fields correctly.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Call Netlify Function for AI Analysis
            const response = await fetch('/.netlify/functions/analyze-incident', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const analysis = await response.json();

            // 2. Save enriched data to Supabase
            const { error: dbError } = await supabase
                .from('incidents')
                .insert([
                    {
                        ...formData,
                        ...analysis,
                        status: 'active', // Set initial status to active
                    },
                ]);

            if (dbError) throw dbError;

            // 3. Success Feedback
            setSuccess(true);
            setFormData({ title: '', raw_text: '', location: '' });
            setTouched({});

            // Notify parent after delay
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 2500);

        } catch (err) {
            console.error('Submission error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-12 duration-500">
            <div className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] shadow-xl">
                <header className="mb-10 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                        <span className="text-4xl" role="img" aria-label="pen">🖊️</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">Incident Details</h2>
                    <p className="text-slate-500 text-lg">Your report helps keep the whole neighborhood safe.</p>
                </header>

                {success && (
                    <div className="mb-8 p-6 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                        <span className="text-3xl">✅</span>
                        <div>
                            <p className="text-green-800 font-bold text-lg">Your report has been submitted and analyzed successfully!</p>
                            <p className="text-green-600">Returning you to the feed...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-2xl flex items-start gap-4 animate-in shake duration-500">
                        <span className="text-3xl">⚠️</span>
                        <p className="text-red-700 font-bold text-lg leading-snug">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label htmlFor="title" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">What happened?</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g., Suspicious text message from Amazon"
                            className={`w-full bg-slate-50 border-2 px-5 py-4 rounded-2xl outline-none transition-all text-lg font-medium placeholder:text-slate-300 ${touched.title && currentErrors.title
                                    ? 'border-red-300 focus:ring-4 focus:ring-red-100'
                                    : 'border-slate-100 focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300'
                                }`}
                            value={formData.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                        />
                        {touched.title && currentErrors.title && <p className="text-red-600 text-sm font-bold pl-1">{currentErrors.title}</p>}
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="location" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Where did it happen?</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g., Oak Avenue Park"
                            className={`w-full bg-slate-50 border-2 px-5 py-4 rounded-2xl outline-none transition-all text-lg font-medium placeholder:text-slate-300 ${touched.location && currentErrors.location
                                    ? 'border-red-300 focus:ring-4 focus:ring-red-100'
                                    : 'border-slate-100 focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300'
                                }`}
                            value={formData.location}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                        />
                        {touched.location && currentErrors.location && <p className="text-red-600 text-sm font-bold pl-1">{currentErrors.location}</p>}
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="raw_text" className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Describe the incident</label>
                        <textarea
                            id="raw_text"
                            name="raw_text"
                            rows="6"
                            placeholder="Please provide as much detail as possible. This information is kept private and used only for safety analysis."
                            className={`w-full bg-slate-50 border-2 px-5 py-4 rounded-2xl outline-none transition-all text-lg font-medium placeholder:text-slate-300 resize-none ${touched.raw_text && currentErrors.raw_text
                                    ? 'border-red-300 focus:ring-4 focus:ring-red-100'
                                    : 'border-slate-100 focus:ring-4 focus:ring-slate-200/50 focus:border-slate-300'
                                }`}
                            value={formData.raw_text}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                        />
                        {touched.raw_text && currentErrors.raw_text && <p className="text-red-600 text-sm font-bold pl-1">{currentErrors.raw_text}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-4 shadow-xl active:scale-98 ${isSubmitting
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-200/50'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                                Analyzing your report...
                            </>
                        ) : (
                            'Submit Report'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
