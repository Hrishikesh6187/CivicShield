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

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { title, raw_text, location } = JSON.parse(event.body);
        let result;
        let claudeSucceeded = false;

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-20241022", // Corrected model name based on Anthropic docs
                    max_tokens: 1000,
                    messages: [
                        {
                            role: "user",
                            content: `You are a community safety analyst for CivicShield. Analyze this incident report and return ONLY a valid JSON object with no extra text, no markdown, no backticks. 

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
                })
            });

            if (!response.ok) throw new Error("Claude API returned an error");

            const data = await response.json();
            const text = data.content[0].text;
            result = JSON.parse(text);
            claudeSucceeded = true;
        } catch (error) {
            console.error("Claude API failed, using fallback:", error);
            result = ruleFallback(title, raw_text);
            claudeSucceeded = false;
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...result,
                ai_used: claudeSucceeded
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
