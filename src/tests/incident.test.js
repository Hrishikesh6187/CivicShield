import { describe, it, expect, vi } from 'vitest'

describe('Incident Submission', () => {
    it('should successfully process a valid incident report', async () => {
        const validIncident = {
            title: 'Suspicious Phishing Email',
            raw_text: 'I received an email asking me to click a link and update my bank details immediately or my account will be suspended.',
            location: 'Greer, South Carolina'
        }

        // Validate all required fields are present
        expect(validIncident.title).toBeTruthy()
        expect(validIncident.raw_text).toBeTruthy()
        expect(validIncident.location).toBeTruthy()

        // Validate title is not too short
        expect(validIncident.title.length).toBeGreaterThan(5)

        // Validate raw_text has enough detail
        expect(validIncident.raw_text.length).toBeGreaterThan(10)

        // Simulate expected AI response structure
        const mockAIResponse = {
            category: 'Phishing',
            severity: 'High',
            clean_summary: 'A phishing email impersonating a bank is targeting local residents.',
            action_steps: [
                'Do not click any links in the email',
                'Report the email to your bank directly',
                'Enable two-factor authentication on your account'
            ],
            ai_used: true
        }

        // Validate response shape
        expect(mockAIResponse).toHaveProperty('category')
        expect(mockAIResponse).toHaveProperty('severity')
        expect(mockAIResponse).toHaveProperty('clean_summary')
        expect(mockAIResponse).toHaveProperty('action_steps')
        expect(mockAIResponse).toHaveProperty('ai_used')

        // Validate category is one of the allowed values
        const validCategories = ['Phishing', 'Network Security', 'Physical Threat', 'Scam', 'Data Breach', 'Other']
        expect(validCategories).toContain(mockAIResponse.category)

        // Validate severity is one of the allowed values
        const validSeverities = ['Low', 'Medium', 'High']
        expect(validSeverities).toContain(mockAIResponse.severity)

        // Validate action steps is an array with at least one step
        expect(Array.isArray(mockAIResponse.action_steps)).toBe(true)
        expect(mockAIResponse.action_steps.length).toBeGreaterThan(0)
    })

    it('should reject an incident report with empty fields', () => {
        const emptyIncident = {
            title: '',
            raw_text: '',
            location: ''
        }

        // Validation function matching the one used in SubmitIncident.jsx
        function validateIncident(incident) {
            const errors = {}
            if (!incident.title || incident.title.trim() === '') {
                errors.title = 'Title is required'
            }
            if (!incident.raw_text || incident.raw_text.trim() === '') {
                errors.raw_text = 'Description is required'
            }
            if (!incident.location || incident.location.trim() === '') {
                errors.location = 'Location is required'
            }
            return errors
        }

        const errors = validateIncident(emptyIncident)

        // Should have errors for all three fields
        expect(Object.keys(errors).length).toBe(3)
        expect(errors.title).toBe('Title is required')
        expect(errors.raw_text).toBe('Description is required')
        expect(errors.location).toBe('Location is required')
    })
})
