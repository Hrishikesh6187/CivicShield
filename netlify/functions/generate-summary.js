export const handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);

        const prompt = `You are CivicShield's community safety advisor. Your job is to write a warm, calm, and encouraging daily safety summary for a neighborhood community app. Your audience includes elderly residents, families, and remote workers. Even when threats are serious, your tone must remain dignified, empowering, and reassuring — never alarming or panic-inducing.

Here is today's community safety data:
- Total incidents on record: ${data.total}
- Currently active: ${data.active}
- Under investigation: ${data.investigating}  
- Successfully resolved: ${data.resolved}
- Active high severity: ${data.highCount}
- Active medium severity: ${data.mediumCount}
- Active low severity: ${data.lowCount}
- Locations covered: ${data.locations.join(', ')}
- Incident breakdown by category: ${JSON.stringify(data.categories)}
- Top active alerts: ${JSON.stringify(data.topIncidents)}

Write a daily community summary with these exact sections:

1. A warm greeting opening (1 sentence, mention today's date)
2. Overall community status (2-3 sentences, honest but calm)
3. Key areas to be aware of (mention specific locations and categories without causing panic, 2-3 sentences)
4. Top 2-3 actionable tips residents can do TODAY to stay safe (specific and practical)
5. A closing encouraging sentence that builds community trust

Keep the total response under 200 words. Use plain language that an elderly person can easily understand. Do not use technical jargon. End on a positive, empowering note.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a community safety advisor. You write warm, reassuring summaries."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Groq API Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Groq API returned an error: ${response.status}`);
        }

        const groqData = await response.json();
        const summary = groqData.choices[0].message.content;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary })
        };
    } catch (err) {
        console.error("Internal Server Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate summary" })
        };
    }
};
