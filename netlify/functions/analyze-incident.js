// netlify/functions/analyze-incident.js

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { title, raw_text, location } = JSON.parse(event.body);

        // This is a placeholder for real AI analysis (e.g., using OpenAI or Anthropic)
        // For now, we return mock analysis data based on keywords

        let category = 'Digital Wellness';
        let severity = 'Medium';
        let ai_used = true;

        if (raw_text.toLowerCase().includes('phishing') || raw_text.toLowerCase().includes('password')) {
            category = 'Cybersecurity';
            severity = 'High';
        } else if (raw_text.toLowerCase().includes('van') || raw_text.toLowerCase().includes('park')) {
            category = 'Physical Safety';
            severity = 'Low';
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category,
                severity,
                clean_summary: `Analyzed incident: ${title}. Based on the description, this relates to ${category.toLowerCase()}.`,
                action_steps: [
                    "Secure your immediate accounts.",
                    "Document any further suspicious activity.",
                    "Notify the relevant local authorities if necessary."
                ],
                ai_used
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to analyze incident' })
        };
    }
};
