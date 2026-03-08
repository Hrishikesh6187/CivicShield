export const handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { incidents } = JSON.parse(event.body);

        const filteredIncidents = incidents.filter(i =>
            i.status === 'active' || i.status === 'investigating'
        );

        const prompt = `You are a community safety analyst for CivicShield. Your job is to filter a list of community incident reports and identify only the ones that are genuinely actionable and worth alerting residents about. Ignore duplicate reports, vague complaints, or low-impact incidents.

Here are the current active incidents:
${JSON.stringify(filteredIncidents.map(i => ({
            id: i.id,
            title: i.title,
            category: i.category,
            severity: i.severity,
            location: i.location,
            clean_summary: i.clean_summary
        })))}

Return ONLY a valid JSON array of the top 3 most critical incidents residents should know about right now. For each one return:
{
  "id": "the incident id",
  "title": "the incident title",
  "category": "the category",
  "severity": "the severity",
  "location": "the location",
  "why_it_matters": "one short sentence explaining why this specific incident is important right now",
  "immediate_action": "one single most important thing a resident should do right now"
}

Only return the JSON array. No markdown. No extra text. No backticks.`;

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
                        content: "You are a community safety analyst. You only respond with raw JSON arrays."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Groq API Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Groq API returned an error: ${response.status}`);
        }

        const groqData = await response.json();
        const text = groqData.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const alerts = JSON.parse(cleaned);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alerts)
        };
    } catch (err) {
        console.error("Internal Server Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to filter alerts" })
        };
    }
};
