(function () {
    function byId(id) {
        return document.getElementById(id);
    }

    function asNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function round(value, precision) {
        const factor = Math.pow(10, precision || 0);
        return Math.round(value * factor) / factor;
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function toCm(heightValue, heightUnit) {
        if (heightUnit === 'ft') {
            return heightValue * 30.48;
        }
        return heightValue;
    }

    function toKm(distanceValue, distanceUnit) {
        if (distanceUnit === 'miles') {
            return distanceValue * 1.60934;
        }
        return distanceValue;
    }

    function toKg(weightValue, weightUnit) {
        if (weightUnit === 'lbs') {
            return weightValue * 0.45359237;
        }
        return weightValue;
    }

    function strideLengthMeters(heightCm) {
        // Approximate walking stride length for mixed populations.
        return 0.414 * (heightCm / 100);
    }

    function formatDate(inputDate) {
        const parsed = new Date(inputDate + 'T12:00:00');
        if (Number.isNaN(parsed.getTime())) {
            return inputDate;
        }
        return parsed.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function addHoursToDate(inputDate, hoursToAdd) {
        const parsed = new Date(inputDate + 'T12:00:00');
        if (Number.isNaN(parsed.getTime())) {
            return '';
        }
        const result = new Date(parsed.getTime() + hoursToAdd * 60 * 60 * 1000);
        return result.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function foodsForIntensity(intensity) {
        if (intensity === 'hard') {
            return [
                'Salmon with roasted sweet potato',
                'Greek yogurt with berries and chia seeds',
                'Brown rice, chicken, and steamed vegetables',
                'Turmeric tea with walnuts'
            ];
        }

        if (intensity === 'easy') {
            return [
                'Eggs with whole-grain toast',
                'Banana with peanut butter',
                'Bean and quinoa salad',
                'Electrolyte water with citrus'
            ];
        }

        return [
            'Chicken rice bowl with greens',
            'Protein smoothie with oats',
            'Avocado toast with boiled eggs',
            'Fresh fruit and mixed nuts'
        ];
    }

    function readinessMessage(recoveryHours) {
        if (recoveryHours <= 24) {
            return 'You can likely resume moderate activity tomorrow if soreness is minimal and sleep quality is good.';
        }
        if (recoveryHours <= 48) {
            return 'Plan one focused recovery day before your next hard effort.';
        }
        return 'Prioritize sleep, hydration, and gentle mobility for at least 2 days before hard activity.';
    }

    function recoveryActivities(recoveryHours, intensity) {
        if (recoveryHours > 48 || intensity === 'hard') {
            return [
                'Light walk: 20-30 minutes at easy pace',
                'Stretching or mobility: 15 minutes morning and evening',
                'Massage or foam rolling: 10-15 minutes',
                'Easy bike ride: 20-30 minutes on day 2 if soreness is low'
            ];
        }

        if (recoveryHours > 24) {
            return [
                'Light walk: 20 minutes',
                'Stretching: 10-15 minutes',
                'Massage or foam rolling: 8-10 minutes',
                'Easy bike ride: 15-20 minutes if energy feels normal'
            ];
        }

        return [
            'Light walk: 15-20 minutes',
            'Stretching: 10 minutes',
            'Massage or foam rolling: 5-8 minutes',
            'Optional easy ride: 10-15 minutes'
        ];
    }

    function calculate(payload) {
        // Compendium of Physical Activities MET anchors for hiking categories.
        const baseMetMap = {
            easy: 3.8,
            moderate: 5.3,
            hard: 7.8
        };

        const durationHours = payload.durationMinutes / 60;
        const inferredDistanceKm = payload.steps > 0
            ? (payload.steps * strideLengthMeters(payload.heightCm)) / 1000
            : 0;
        const distanceKm = payload.distanceKmInput > 0 ? payload.distanceKmInput : inferredDistanceKm;
        const distanceMiles = distanceKm * 0.621371;
        const distanceSource = payload.distanceKmInput > 0
            ? 'entered distance (' + payload.distanceUnit + ')'
            : 'estimated from steps';

        const speedMMin = distanceKm > 0 ? (distanceKm * 1000) / payload.durationMinutes : 0;
        const grade = distanceKm > 0 ? clamp(payload.elevationGainM / (distanceKm * 1000), 0, 0.25) : 0;
        const baseMet = baseMetMap[payload.intensity] || baseMetMap.moderate;

        // ACSM walking equation approximation (valid at walking/hiking speeds).
        let acsmMet = 0;
        if (speedMMin > 0) {
            const vo2 = (0.1 * speedMMin) + (1.8 * speedMMin * grade) + 3.5;
            acsmMet = vo2 / 3.5;
        }

        let effectiveMet = acsmMet > 0 ? (baseMet * 0.6) + (acsmMet * 0.4) : baseMet;
        if (grade > 0.08) effectiveMet += 0.4;
        if (grade > 0.12) effectiveMet += 0.6;
        effectiveMet = clamp(effectiveMet, 2.5, 12);

        const caloriesBurned = effectiveMet * payload.weightKg * durationHours;
        const trainingLoad = (effectiveMet * durationHours) + (payload.elevationGainM / 450);
        const recoveryHours = clamp(10 + (trainingLoad * 2.4) + (payload.age >= 50 ? 4 : 0), 12, 72);

        let hydrationLiters = 0;
        let hydrationMethod = '';
        let bodyMassLossKg = 0;

        // Hydration follows sports medicine guidance:
        // replace ~150% of body-mass loss when pre/post mass is available.
        if (payload.preHikeWeightInput > 0 && payload.postHikeWeightInput > 0 && payload.preHikeWeightInput > payload.postHikeWeightInput) {
            bodyMassLossKg = toKg(payload.preHikeWeightInput - payload.postHikeWeightInput, payload.weightUnit);
            hydrationLiters = clamp(bodyMassLossKg * 1.5, 1, 8);
            hydrationMethod = 'based on 150% of body-mass loss';
        } else {
            const sweatRateMap = { easy: 0.45, moderate: 0.65, hard: 0.85 };
            const estimatedSweatLoss = (sweatRateMap[payload.intensity] || sweatRateMap.moderate) * durationHours;
            hydrationLiters = clamp((estimatedSweatLoss * 1.25) + 0.5, 1.5, 6.5);
            hydrationMethod = 'estimated from duration and intensity';
        }

        const sodiumLowMg = round(hydrationLiters * 500, 0);
        const sodiumHighMg = round(hydrationLiters * 700, 0);

        // Carbohydrate and protein ranges align with sports nutrition position stands.
        let carbLowPerKg = 0.8;
        let carbHighPerKg = 1.0;
        if (payload.intensity === 'hard' || payload.durationMinutes >= 90) {
            carbLowPerKg = 1.0;
            carbHighPerKg = 1.2;
        } else if (payload.intensity === 'easy') {
            carbLowPerKg = 0.6;
            carbHighPerKg = 0.8;
        }

        let proteinLowPerKg = 1.4;
        let proteinHighPerKg = 1.8;
        if (payload.intensity === 'easy') {
            proteinLowPerKg = 1.2;
            proteinHighPerKg = 1.6;
        } else if (payload.intensity === 'hard') {
            proteinLowPerKg = 1.6;
            proteinHighPerKg = 2.0;
        }

        const carbLowPerHour = round(carbLowPerKg * payload.weightKg, 0);
        const carbHighPerHour = round(carbHighPerKg * payload.weightKg, 0);
        const carbLow4h = round(carbLowPerHour * 4, 0);
        const carbHigh4h = round(carbHighPerHour * 4, 0);
        const proteinPostDose = round(clamp(payload.weightKg * 0.3, 20, 40), 0);
        const proteinLowDaily = round(proteinLowPerKg * payload.weightKg, 0);
        const proteinHighDaily = round(proteinHighPerKg * payload.weightKg, 0);

        const sleepHours = recoveryHours > 48 ? 9 : recoveryHours > 24 ? 8 : 7;
        const sleepDays = Math.max(1, Math.ceil(recoveryHours / 24));
        const totalSleepHours = sleepHours * sleepDays;

        return {
            caloriesBurned: round(caloriesBurned, 0),
            distanceKm: round(distanceKm, 2),
            distanceMiles: round(distanceMiles, 2),
            distanceSource: distanceSource,
            metUsed: round(effectiveMet, 1),
            recoveryHours: round(recoveryHours, 0),
            recoveryDays: round(recoveryHours / 24, 1),
            hydrationLiters: round(hydrationLiters, 1),
            hydrationMethod: hydrationMethod,
            bodyMassLossKg: round(bodyMassLossKg, 2),
            sodiumLowMg: sodiumLowMg,
            sodiumHighMg: sodiumHighMg,
            carbLowPerHour: carbLowPerHour,
            carbHighPerHour: carbHighPerHour,
            carbLow4h: carbLow4h,
            carbHigh4h: carbHigh4h,
            proteinPostDose: proteinPostDose,
            proteinLowDaily: proteinLowDaily,
            proteinHighDaily: proteinHighDaily,
            sleepRange: recoveryHours > 48 ? '8-9 hours' : '7-8 hours',
            sleepHours: sleepHours,
            totalSleepHours: totalSleepHours
        };
    }

    function renderReport(target, payload, result) {
        const foodItems = foodsForIntensity(payload.intensity)
            .map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; })
            .join('');
        const activityItems = recoveryActivities(result.recoveryHours, payload.intensity)
            .map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; })
            .join('');
        const resumeDate = addHoursToDate(payload.hikeDate, result.recoveryHours);

        target.innerHTML =
            '<article class="rr-report-header rr-print-card">' +
            '  <p class="rr-kicker">Mountain Hike &amp; Recovery Guide</p>' +
            '  <h2>' + escapeHtml(formatDate(payload.hikeDate)) + '</h2>' +
            '  <p>Intensity: <strong>' + escapeHtml(payload.intensityLabel) + '</strong></p>' +
            (resumeDate ? ('  <p>Suggested next hard hike date: <strong>' + escapeHtml(resumeDate) + '</strong></p>') : '') +
            '  <p>Estimated MET level used: <strong>' + result.metUsed + '</strong></p>' +
            '</article>' +
            '<div class="rr-metrics">' +
            '  <article class="rr-metric rr-metric-hot rr-print-card"><h3>Total Calories</h3><p>' + result.caloriesBurned + ' <span>kcal</span></p></article>' +
            '  <article class="rr-metric rr-metric-cool rr-print-card"><h3>Total Distance</h3><p>' +
            (payload.distanceUnit === 'miles'
                ? result.distanceMiles + ' <span>mi</span>'
                : result.distanceKm + ' <span>km</span>') +
            '</p><small>' +
            (payload.distanceUnit === 'miles'
                ? result.distanceKm + ' km'
                : result.distanceMiles + ' mi') +
            ' (' + escapeHtml(result.distanceSource) + ')</small></article>' +
            '  <article class="rr-metric rr-print-card"><h3>Duration</h3><p>' + payload.durationMinutes + ' <span>min</span></p></article>' +
            '  <article class="rr-metric rr-print-card"><h3>Recovery Needed</h3><p>' + result.recoveryHours + ' <span>hours</span></p></article>' +
            '</div>' +
            '<div class="rr-grid">' +
            '  <article class="rr-panel rr-print-card">' +
            '    <h3>Recovery Prescription</h3>' +
            '    <ul>' +
            '      <li><strong>Rest Window:</strong> ' + result.recoveryHours + ' hours (~' + result.recoveryDays + ' days)</li>' +
            '      <li><strong>Sleep tonight:</strong> ' + result.sleepHours + ' hours</li>' +
            '      <li><strong>Total sleep target:</strong> ' + result.totalSleepHours + ' hours across recovery window</li>' +
            '      <li><strong>Hydration:</strong> ' + result.hydrationLiters + ' L over next 24h (' + escapeHtml(result.hydrationMethod) + ')</li>' +
            '      <li><strong>Electrolytes:</strong> ' + result.sodiumLowMg + '-' + result.sodiumHighMg + ' mg sodium across that fluid</li>' +
            '      <li><strong>Post-hike protein:</strong> ~' + result.proteinPostDose + ' g within 2 hours</li>' +
            '      <li><strong>Daily protein:</strong> ' + result.proteinLowDaily + '-' + result.proteinHighDaily + ' g/day</li>' +
            '      <li><strong>Carbs (first 4h):</strong> ' + result.carbLow4h + '-' + result.carbHigh4h + ' g total (' + result.carbLowPerHour + '-' + result.carbHighPerHour + ' g/h)</li>' +
            '    </ul>' +
            '  </article>' +
            '  <article class="rr-panel rr-panel-activities rr-print-card">' +
            '    <h3>Recovery Activity Recommendations</h3>' +
            '    <ul>' +
            activityItems +
            '    </ul>' +
            (result.bodyMassLossKg > 0 ? ('<p class="rr-mini-note"><strong>Observed body-mass loss:</strong> ' + result.bodyMassLossKg + ' kg.</p>') : '') +
            '  </article>' +
            '</div>' +
            '<div class="rr-grid">' +
            '  <article class="rr-panel rr-panel-food rr-print-card">' +
            '    <h3>Foods to Prioritize</h3>' +
            '    <ul>' + foodItems + '</ul>' +
            '  </article>' +
            '  <article class="rr-panel rr-print-card">' +
            '    <h3>Ready to Resume?</h3>' +
            '    <p>' + escapeHtml(readinessMessage(result.recoveryHours)) + '</p>' +
            '    <ul>' +
            '      <li><strong>Age:</strong> ' + payload.age + ' years</li>' +
            '      <li><strong>Height:</strong> ' +
            (payload.heightUnit === 'ft'
                ? payload.heightInput + ' ft (' + round(payload.heightCm, 1) + ' cm)'
                : round(payload.heightCm, 1) + ' cm (' + round(payload.heightCm / 30.48, 2) + ' ft)') +
            '</li>' +
            '      <li><strong>Weight:</strong> ' +
            (payload.weightUnit === 'lbs'
                ? payload.weightInput + ' lbs (' + round(payload.weightKg, 1) + ' kg)'
                : round(payload.weightKg, 1) + ' kg (' + round(payload.weightKg * 2.20462, 1) + ' lbs)') +
            '</li>' +
            '      <li><strong>Steps:</strong> ' + payload.steps.toLocaleString() + '</li>' +
            '      <li><strong>Elevation Gain:</strong> ' + payload.elevationGainM + ' m</li>' +
            '    </ul>' +
            (payload.notes ? ('<p class="rr-note"><strong>Notes:</strong> ' + escapeHtml(payload.notes) + '</p>') : '') +
            '  </article>' +
            '</div>' +
            '<article class="rr-disclaimer rr-print-card">' +
            '  <p>This report uses evidence-based estimation and is not medical advice.</p>' +
            '  <p>Method basis: Compendium MET values, ACSM walking equation, sports hydration guidance, ISSN nutrition ranges, and adult sleep guidance.</p>' +
            '</article>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        const form = byId('recoveryForm');
        const output = byId('reportOutput');
        const errorEl = byId('recoveryError');
        const savePdfBtn = byId('savePdfBtn');

        if (!form || !output || !errorEl || !savePdfBtn) {
            return;
        }

        const dateInput = byId('hikeDate');
        const heightUnit = byId('heightUnit');
        const heightValue = byId('heightValue');
        const heightValueLabel = byId('heightValueLabel');
        const weightUnit = byId('weightUnit');
        const weightValue = byId('weightValue');
        const weightValueLabel = byId('weightValueLabel');
        const preHikeWeight = byId('preHikeWeight');
        const postHikeWeight = byId('postHikeWeight');
        const distanceUnit = byId('distanceUnit');
        const distanceValue = byId('distanceValue');
        const distanceValueLabel = byId('distanceValueLabel');
        if (dateInput) {
            dateInput.value = new Date().toISOString().slice(0, 10);
        }

        function syncUnitFields() {
            if (heightUnit && heightValue && heightValueLabel) {
                if (heightUnit.value === 'ft') {
                    heightValueLabel.textContent = 'Height (ft)';
                    heightValue.min = '3';
                    heightValue.max = '8';
                    heightValue.step = '0.01';
                    heightValue.placeholder = 'e.g. 5.9';
                } else {
                    heightValueLabel.textContent = 'Height (cm)';
                    heightValue.min = '100';
                    heightValue.max = '230';
                    heightValue.step = '0.1';
                    heightValue.placeholder = '';
                }
            }

            if (distanceUnit && distanceValue && distanceValueLabel) {
                if (distanceUnit.value === 'miles') {
                    distanceValueLabel.textContent = 'Distance (miles)';
                    distanceValue.max = '155';
                    distanceValue.step = '0.01';
                } else {
                    distanceValueLabel.textContent = 'Distance (km)';
                    distanceValue.max = '250';
                    distanceValue.step = '0.01';
                }
            }

            if (weightUnit && weightValue && weightValueLabel) {
                if (weightUnit.value === 'lbs') {
                    weightValueLabel.textContent = 'Weight (lbs)';
                    weightValue.min = '66';
                    weightValue.max = '551';
                    weightValue.step = '0.1';
                    weightValue.placeholder = 'e.g. 180';
                    if (preHikeWeight && postHikeWeight) {
                        preHikeWeight.step = '0.1';
                        postHikeWeight.step = '0.1';
                        preHikeWeight.placeholder = 'e.g. 180';
                        postHikeWeight.placeholder = 'e.g. 178.5';
                    }
                } else {
                    weightValueLabel.textContent = 'Weight (kg)';
                    weightValue.min = '30';
                    weightValue.max = '250';
                    weightValue.step = '0.1';
                    weightValue.placeholder = '';
                    if (preHikeWeight && postHikeWeight) {
                        preHikeWeight.step = '0.1';
                        postHikeWeight.step = '0.1';
                        preHikeWeight.placeholder = 'e.g. 82';
                        postHikeWeight.placeholder = 'e.g. 81.4';
                    }
                }
            }
        }

        if (heightUnit) {
            heightUnit.addEventListener('change', syncUnitFields);
        }
        if (distanceUnit) {
            distanceUnit.addEventListener('change', syncUnitFields);
        }
        if (weightUnit) {
            weightUnit.addEventListener('change', syncUnitFields);
        }
        syncUnitFields();

        function showError(message) {
            errorEl.textContent = message;
            errorEl.hidden = false;
        }

        function clearError() {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            clearError();

            const payload = {
                hikeDate: form.hike_date.value,
                age: asNumber(form.age.value),
                heightUnit: form.height_unit.value,
                heightInput: asNumber(form.height_value.value),
                weightUnit: form.weight_unit.value,
                weightInput: asNumber(form.weight_value.value),
                preHikeWeightInput: asNumber(form.pre_hike_weight.value),
                postHikeWeightInput: asNumber(form.post_hike_weight.value),
                durationMinutes: asNumber(form.duration_minutes.value),
                distanceUnit: form.distance_unit.value,
                distanceInput: asNumber(form.distance_value.value),
                steps: Math.round(asNumber(form.steps.value)),
                elevationGainM: asNumber(form.elevation_gain_m.value),
                intensity: form.intensity.value,
                intensityLabel: form.intensity.value.charAt(0).toUpperCase() + form.intensity.value.slice(1),
                notes: form.notes.value.trim()
            };
            payload.heightCm = toCm(payload.heightInput, payload.heightUnit);
            payload.weightKg = toKg(payload.weightInput, payload.weightUnit);
            payload.distanceKmInput = toKm(payload.distanceInput, payload.distanceUnit);

            if (!payload.hikeDate || !payload.age || !payload.heightInput || !payload.weightInput || !payload.durationMinutes) {
                showError('Please complete all required fields.');
                return;
            }

            if (!payload.distanceInput && !payload.steps) {
                showError('Please provide either distance or steps.');
                return;
            }

            const result = calculate(payload);
            renderReport(output, payload, result);
            output.hidden = false;
            savePdfBtn.disabled = false;
            output.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        savePdfBtn.addEventListener('click', function () {
            if (output.hidden) {
                return;
            }
            window.print();
        });
    });
})();
