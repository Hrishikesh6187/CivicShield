function ruleFallback(title, raw_text) {
    const text = (title + ' ' + raw_text).toLowerCase();

    let category = 'Other';
    if (text.match(/phish|email|link|click|password|login/)) category = 'Phishing';
    else if (text.match(/wifi|network|router|hotspot|connection/)) category = 'Network Security';
    else if (text.match(/scam|fraud|cash|payment|door|impersonat/)) category = 'Scam';
    else if (text.match(/breach|hack|data|leak|exposed|compromised/)) category = 'Data Breach';
    else if (text.match(/suspicious|threat|follow|weapon|unsafe/)) category = 'Physical Threat';

    let severity = 'Medium';
    if (text.match(/urgent|immediate|critical|emergency|high/)) severity = 'High';
    else if (text.match(/minor|low|small|possible|might/)) severity = 'Low';

    return {
        category,
        severity,
        clean_summary: `A ${category.toLowerCase()} incident has been reported and is under review.`,
        action_steps: [
            'Stay alert and inform trusted neighbors',
            'Document any relevant details',
            'Contact local authorities if the situation escalates'
        ]
    };
}

export const handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { title, raw_text, location } = JSON.parse(event.body);
        let result;
        let geminiSucceeded = false;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `You are a community safety analyst for CivicShield. Analyze this incident report and return ONLY a valid JSON object with no extra text, no markdown, no backticks.
      
      Incident Title: ${title}
      Incident Description: ${raw_text}
      Location: ${location}
      
      Return this exact JSON structure:
      {
        "category": "one of: Phishing, Network Security, Physical Threat, Scam, Data Breach, Other",
        "severity": "one of: Low, Medium, High",
        "clean_summary": "one calm, neutral sentence summarizing the incident without emotional language",
        "action_steps": ["step 1", "step 2", "step 3"]
      }`
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.2
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Gemini API Error: ${response.status} ${response.statusText}`, errorBody);
                throw new Error(`Gemini API returned an error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Gemini API returned no candidates");
            }

            const text = data.candidates[0].content.parts[0].text;
            const cleaned = text.replace(/```json|```/g, "").trim();
            result = JSON.parse(cleaned);
            geminiSucceeded = true;
        } catch (error) {
            console.error("Gemini API failed, using fallback:", error);
            result = ruleFallback(title, raw_text);
            geminiSucceeded = false;
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...result,
                ai_used: geminiSucceeded
            })
        };
    } catch (err) {
        console.error("Internal Server Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request" })
        };
    }
};
