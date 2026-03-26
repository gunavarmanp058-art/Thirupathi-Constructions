/**
 * AI Service logic for predictions
 * Tries to call Python Microservice first; falls back to internal rule-based logic if unavailable.
 */
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const predictMachineHealth = async (working_hours, fuel_used, last_maintenance_date, breakdown_count) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/predict/machine`, {
            working_hours,
            fuel_used,
            breakdown_count,
            last_maintenance_date: last_maintenance_date instanceof Date
                ? last_maintenance_date.toISOString().split('T')[0]
                : last_maintenance_date
        }, { timeout: 2000 }); // Fast timeout for fallback

        if (response.data) {
            return {
                condition: response.data.condition,
                estimated_remaining_usable_time_hours: response.data.estimated_remaining_hours,
                recommendation: response.data.recommendation,
                source: 'AI-Microservice'
            };
        }
    } catch (err) {
        // Fallback silently if AI service is down
        // console.warn('AI Service unavailable, using local rules:', err.message);
    }

    // Local Fallback Logic
    let score = 0;

    // Scoring rules
    if (working_hours > 1500) score += 2;
    else if (working_hours > 800) score += 1;

    if (breakdown_count > 3) score += 3;
    else if (breakdown_count > 1) score += 1;

    const lastDate = new Date(last_maintenance_date);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 180) score += 2; // 6 months
    if (diffDays > 365) score += 4; // 1 year

    let condition = 'Good';
    let recommendation = 'Continue regular operations.';
    let remainingTime = 2000 - (working_hours % 2000); // Simple heuristic

    if (score >= 6) {
        condition = 'Critical';
        recommendation = 'Shut down immediately for overhaul.';
    } else if (score >= 3) {
        condition = 'Needs Maintenance';
        recommendation = 'Schedule service within the next week.';
    }

    return {
        condition,
        estimated_remaining_usable_time_hours: Math.max(0, remainingTime),
        recommendation,
        source: 'Local-Rules'
    };
};

const analyzeProjectProgress = async (progressTimeline) => {
    try {
        if (progressTimeline && progressTimeline.length > 0) {
            const formattedProgress = progressTimeline.map(p => ({
                planned_percent: parseFloat(p.planned_percent) || 0,
                actual_percent: parseFloat(p.actual_percent) || 0
            }));

            const response = await axios.post(`${AI_SERVICE_URL}/predict/project`, {
                progress: formattedProgress
            }, { timeout: 2000 });

            if (response.data && !response.data.error) {
                return {
                    health: response.data.health || 'On Track',
                    risk: response.data.delay_risk || 'Low',
                    shift_days: response.data.estimated_delay_days || 0,
                    source: 'AI-Microservice'
                };
            }
        }
    } catch (err) {
        console.warn('AI Project analysis failed, using local rules:', err.message);
    }

    // Local Fallback Logic
    if (!progressTimeline || progressTimeline.length === 0) {
        return { health: 'On Track', risk: 'Low', shift_days: 0, source: 'Local-Rules' };
    }

    const latest = progressTimeline[progressTimeline.length - 1];
    const planned = parseFloat(latest.planned_percent) || 0;
    const actual = parseFloat(latest.actual_percent) || 0;
    const diff = planned - actual;

    let health = 'On Track';
    let risk = 'Low';
    let shift_days = 0;

    if (diff > 15) {
        health = 'High Risk';
        risk = 'High';
        shift_days = Math.round(diff * 1.5);
    } else if (diff > 5) {
        health = 'Slight Delay';
        risk = 'Medium';
        shift_days = Math.round(diff * 1.2);
    }

    return {
        health,
        risk,
        shift_days: Math.max(0, shift_days),
        source: 'Local-Rules'
    };
};

const analyzeImageProgress = async (imagePath) => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath));

        const response = await axios.post(`${AI_SERVICE_URL}/predict/image`, form, {
            headers: {
                ...form.getHeaders()
            },
            timeout: 5000
        });

        return response.data;
    } catch (err) {
        console.error('AI image progress analysis failed:', err.message);
        return null;
    }
};

const analyzeInfrastructure = async (imagePath) => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath));

        const response = await axios.post(`${AI_SERVICE_URL}/predict/infrastructure`, form, {
            headers: {
                ...form.getHeaders()
            },
            timeout: 5000
        });

        return {
            ...response.data,
            source: 'AI-Microservice'
        };
    } catch (err) {
        // Fallback or skip if service is down
        return {
            detected: "Unknown",
            analysis: "AI Service currently unavailable. Manual verification recommended.",
            progress: null,
            issues: [],
            detection_confidence: 0.0,
            progress_confidence: 0.0,
            source: 'Local-Fallback'
        };
    }
};


module.exports = {
    predictMachineHealth,
    analyzeProjectProgress,
    analyzeImageProgress,
    analyzeInfrastructure
};

