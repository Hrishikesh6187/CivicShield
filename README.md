# 🛡️ CivicShield — Community Safety & Digital Wellness Platform

A community-driven safety platform that uses AI to filter noise, surface 
actionable alerts, and empower residents to stay informed and safe.

---

## Candidate Name
Hrishikesh Prahalad

## Scenario Chosen
Scenario 3 — Community Safety & Digital Wellness

## Estimated Time Spent
4 hours

---

## Quick Start

### Prerequisites
- Node.js v18+
- Netlify CLI (`npm install -g netlify-cli`)
- A Supabase account and project
- A Groq API key (free at console.groq.com)

### Environment Variables
Create a `.env` file at the root with the following:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### Run Commands
```bash
npm install
netlify dev
```
App runs at https://civicshieldpan.netlify.app/ 

### Test Commands
```bash
npm test
```

---

## Live Demo
🌐 https://civicshieldpan.netlify.app

---

## AI Disclosure

**Did you use an AI assistant (Copilot, ChatGPT, etc.)?**
Yes. Claude (Anthropic) was used as a development assistant to help 
scaffold components, debug issues, and refine prompts.

**How did you verify the suggestions?**
Every suggestion was reviewed, tested manually in the browser, and 
verified against Supabase to confirm data was being read and written 
correctly. AI generated code that did not behave as expected was 
debugged and rewritten.

**Give one example of a suggestion you rejected or changed:**
The initial Netlify function used the Anthropic Claude API for AI 
analysis. After encountering authentication issues I evaluated 
alternatives and switched to Groq (Llama 3.3) which offered a 
genuinely free tier with no credit card required and faster response 
times. This was a deliberate architectural decision, not just a 
copy-paste swap — the prompt and response parsing were rewritten 
to match Groq's API shape.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Serverless Functions | Netlify Functions |
| AI Engine | Groq API (Llama 3.3 70B) |
| Hosting | Netlify |

---

## Core Features

### 1. Community Incident Feed
- Real-time incident feed fetched from Supabase
- Filter by category, severity, location, and status
- Full text search across titles and summaries
- Each card displays AI generated summary and action steps checklist

### 2. AI Noise Filtering — Top Alerts Banner
The most critical feature. Groq scans all active incidents and 
surfaces the top 3 most actionable alerts — filtering out noise, 
duplicate reports, and low-impact incidents. Each alert includes 
a "why it matters" explanation and one immediate action step.
Fallback: if Groq is unavailable, incidents are sorted by severity 
and recency automatically.

### 3. AI Daily Community Summary
A "Generate Daily Summary" button triggers Groq to analyze all 
active incidents across all locations and produce a warm, calm, 
encouraging summary written for a general audience including 
elderly residents. Even high severity situations are communicated 
with dignity and empowerment rather than panic.
Fallback: a pre-written community message is displayed if Groq 
is unavailable.

### 4. Community Safety Score
A dynamic banner that calculates a weighted risk score based on 
active incident severity. Displays green (Safe), amber (Moderate), 
or red (Elevated) with counts of High, Medium, and Low severity 
active incidents. Updates automatically when incidents are resolved.

### 5. Submit Incident Report
Users submit incidents in plain language. Groq automatically:
- Categorizes the incident (Phishing, Network Security, Scam, etc.)
- Assigns a severity level (Low, Medium, High)
- Generates a calm, neutral summary
- Produces a 3-step action checklist
Fallback: a rule-based keyword matcher handles categorization 
if Groq is unavailable. The ai_used boolean field tracks which 
path ran and is displayed on every card.

### 6. Haven — AI Safety Chatbot
A conversational AI assistant powered by Groq with a hardened 
system prompt. Haven answers community safety questions in a 
warm, calm tone with strict guardrails:
- Scope limited to community safety topics only
- Never recommends confrontation or illegal actions
- Resistant to jailbreak and prompt injection attempts
- Always defers to official authorities for serious situations
- Maintains full conversation history for contextual responses

### 7. Incident Status Management
Users can update any incident status to Resolved or Investigating 
directly from the feed. Changes write back to Supabase in real time.

---

## Database Schema
```sql
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('Phishing', 'Network Security', 
    'Physical Threat', 'Scam', 'Data Breach', 'Other')),
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
  clean_summary TEXT,
  action_steps JSONB,
  ai_used BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN 
    ('active', 'resolved', 'investigating')),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Synthetic Dataset
A sample dataset of 30 incidents is included at 
`/data/sample_incidents.json`. All data is entirely synthetic. 
No real personal data was used at any point in this project. 
No live sites were scraped.

---

## Responsible AI Considerations

**Privacy:** No personally identifiable information is stored. 
Incidents are anonymous community reports only.

**Transparency:** Every incident card displays whether it was 
analyzed by AI or the rule-based fallback via the ai_used field.

**Security:** The Groq API key is stored server-side in Netlify 
environment variables and accessed only within serverless functions. 
It is never exposed to the browser.

**Limitations:** AI classifications are suggestions, not verdicts. 
The severity and category assigned by Groq should be treated as 
a starting point for community awareness, not an authoritative 
determination.

**Fallbacks:** Every AI feature has a manual fallback. The app 
remains fully functional even if Groq is completely unavailable.

**Haven Guardrails:** The Haven chatbot system prompt includes 
explicit identity lock instructions that resist jailbreak attempts, 
prompt injection, and character reassignment. This was tested 
against multiple adversarial prompts before deployment.

---

## Tradeoffs & Prioritization

**What did you cut to stay within the 4–6 hour limit?**
- User authentication — incidents are anonymous by design for 
  this demo. A production version would add Supabase Auth.
- Geolocation — location is text based rather than GPS coordinates. 
  A production version would integrate a maps API.
- Real-time subscriptions — the feed refreshes on load rather than 
  using Supabase real-time. Easy to add with supabase.channel().
- Comment threads on incidents — users cannot add follow-up notes 
  to existing incidents in this version.

**What would you build next if you had more time?**
- Supabase Auth for verified community members
- Real-time incident feed using Supabase subscriptions
- Map view showing incident density by neighborhood
- Push notifications for High severity incidents in your area
- Conversational onboarding flow for elderly users via Haven
- Incident upvoting so the community can verify reports

**Known Limitations:**
- SQLite was not used — Supabase PostgreSQL was chosen instead 
  for a more production-realistic architecture
- The AI safety score is weighted but not geographically scoped — 
  all locations are weighted equally in the current calculation
- Haven has no persistent memory between sessions — conversation 
  history resets on page refresh
- Groq free tier has rate limits — under sustained load the 
  fallback would activate more frequently

---

## Project Structure
```
civicshield/
├── netlify/
│   └── functions/
│       ├── analyze-incident.js
│       ├── generate-summary.js
│       ├── filter-alerts.js
│       └── haven-chat.js
├── src/
│   ├── components/
│   │   ├── IncidentFeed.jsx
│   │   ├── IncidentCard.jsx
│   │   ├── SubmitIncident.jsx
│   │   └── Haven.jsx
│   ├── lib/
│   │   └── supabase.js
│   └── App.jsx
├── data/
│   └── sample_incidents.json
├── .env.example
├── netlify.toml
└── README.md
```

---

*CivicShield — Building safer communities through digital wellness.*
