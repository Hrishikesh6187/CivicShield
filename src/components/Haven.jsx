import React, { useState } from 'react';

const Haven = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I'm Haven, your CivicShield community safety assistant 👋 

I'm here to help you stay informed and safe. You can ask me about:
- How to spot scams and phishing attempts
- What to do if you think your network has been compromised
- How to protect yourself and your family online
- General community safety tips

How can I help you today?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSend = async (text) => {
        const messageText = text || input;
        if (!messageText.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: messageText }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/.netlify/functions/haven-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!response.ok) throw new Error('Haven is temporarily unavailable.');

            const data = await response.json();
            setMessages([...newMessages, { role: 'assistant', content: data.message }]);
        } catch (err) {
            console.error('Haven error:', err);
            setError('Haven is temporarily unavailable. Please try again in a moment.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: `Hello! I'm Haven, your CivicShield community safety assistant 👋 

I'm here to help you stay informed and safe. You can ask me about:
- How to spot scams and phishing attempts
- What to do if you think your network has been compromised
- How to protect yourself and your family online
- General community safety tips

How can I help you today?`
            }
        ]);
        setError(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const suggestions = [
        "How do I spot a phishing email?",
        "What should I do if I think I've been scammed?",
        "How can I secure my home WiFi?"
    ];

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-[700px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-[#1e293b] p-6 text-white flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <span>🤝</span> Haven — Your Community Safety Assistant
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                        Ask me anything about staying safe in your community
                    </p>
                </div>
                <button
                    onClick={clearChat}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                    Clear Chat
                </button>
            </div>

            {/* Chat Window */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                    >
                        <div className={`max-w-[80%] p-5 rounded-3xl text-base leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-[#1e293b] text-white rounded-tr-none'
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none font-medium'
                            }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white border border-slate-100 text-slate-400 p-5 rounded-3xl rounded-tl-none text-sm font-bold flex items-center gap-3 italic">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                            </div>
                            Haven is thinking...
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center p-4">
                        <p className="text-red-500 font-bold bg-red-50 rounded-2xl py-3 px-6 inline-block border border-red-100 text-sm">
                            ⚠️ {error}
                        </p>
                    </div>
                )}

                {messages.length === 1 && !isLoading && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="bg-white border-2 border-slate-200 hover:border-sky-500 hover:text-sky-600 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-8 border-t border-slate-100 bg-white shrink-0">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your question here..."
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all text-base font-medium"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="bg-[#1e293b] hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        Send
                    </button>
                </div>
                <p className="mt-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Haven provides general safety guidance only. Always contact local authorities for emergencies. Call 911 if you are in immediate danger.
                </p>
            </div>
        </div>
    );
};

export default Haven;
