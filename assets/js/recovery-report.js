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

    function calculate(payload) {
        const metMap = {
            easy: 5,
            moderate: 6.5,
            hard: 8
        };

        const durationHours = payload.durationMinutes / 60;
        const inferredDistanceKm = payload.steps > 0 ? payload.steps * 0.000762 : 0;
        const distanceKm = payload.distanceKmInput > 0 ? payload.distanceKmInput : inferredDistanceKm;
        const distanceMiles = distanceKm * 0.621371;
        const distanceSource = payload.distanceKmInput > 0
            ? 'entered distance (' + payload.distanceUnit + ')'
            : 'estimated from steps';

        const met = metMap[payload.intensity] || metMap.moderate;
        const baseCalories = met * payload.weightKg * durationHours;
        const elevationCalories = payload.elevationGainM * (payload.weightKg / 100) * 0.12;
        const caloriesBurned = baseCalories + elevationCalories;

        const effortScore =
            caloriesBurned / 520 +
            durationHours * 1.25 +
            payload.elevationGainM / 320 +
            (payload.age >= 50 ? 0.8 : 0);

        const recoveryHours = clamp(14 + effortScore * 3.9, 12, 72);
        const hydrationLiters = clamp(durationHours * 0.8 + distanceKm * 0.085, 2, 6);
        const proteinGrams = clamp(payload.weightKg * 0.35, 22, 110);
        const carbsGrams = clamp(caloriesBurned * 0.55 / 4, 90, 450);
        const fatGrams = clamp(caloriesBurned * 0.2 / 9, 25, 140);

        return {
            caloriesBurned: round(caloriesBurned, 0),
            distanceKm: round(distanceKm, 2),
            distanceMiles: round(distanceMiles, 2),
            distanceSource: distanceSource,
            recoveryHours: round(recoveryHours, 0),
            recoveryDays: round(recoveryHours / 24, 1),
            hydrationLiters: round(hydrationLiters, 1),
            proteinGrams: round(proteinGrams, 0),
            carbsGrams: round(carbsGrams, 0),
            fatGrams: round(fatGrams, 0),
            sleepRange: recoveryHours > 48 ? '8-9 hours' : '7-8 hours'
        };
    }

    function renderReport(target, payload, result) {
        const foodItems = foodsForIntensity(payload.intensity)
            .map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; })
            .join('');
        const resumeDate = addHoursToDate(payload.hikeDate, result.recoveryHours);

        target.innerHTML =
            '<article class="rr-report-header rr-print-card">' +
            '  <p class="rr-kicker">Mountain Hike &amp; Recovery Guide</p>' +
            '  <h2>' + escapeHtml(formatDate(payload.hikeDate)) + '</h2>' +
            '  <p>Intensity: <strong>' + escapeHtml(payload.intensityLabel) + '</strong></p>' +
            (resumeDate ? ('  <p>Suggested next hard hike date: <strong>' + escapeHtml(resumeDate) + '</strong></p>') : '') +
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
            '    <h3>Recovery Requirements</h3>' +
            '    <ul>' +
            '      <li><strong>Rest Window:</strong> ' + result.recoveryHours + ' hours (~' + result.recoveryDays + ' days)</li>' +
            '      <li><strong>Hydration:</strong> ' + result.hydrationLiters + ' liters in next 24h</li>' +
            '      <li><strong>Sleep:</strong> ' + result.sleepRange + ' nightly</li>' +
            '      <li><strong>Protein:</strong> ' + result.proteinGrams + ' g</li>' +
            '      <li><strong>Carbs:</strong> ' + result.carbsGrams + ' g</li>' +
            '      <li><strong>Healthy fats:</strong> ' + result.fatGrams + ' g</li>' +
            '    </ul>' +
            '  </article>' +
            '  <article class="rr-panel rr-print-card">' +
            '    <h3>Profile Snapshot</h3>' +
            '    <ul>' +
            '      <li><strong>Age:</strong> ' + payload.age + ' years</li>' +
            '      <li><strong>Height:</strong> ' +
            (payload.heightUnit === 'ft'
                ? payload.heightInput + ' ft (' + round(payload.heightCm, 1) + ' cm)'
                : round(payload.heightCm, 1) + ' cm (' + round(payload.heightCm / 30.48, 2) + ' ft)') +
            '</li>' +
            '      <li><strong>Weight:</strong> ' + payload.weightKg + ' kg</li>' +
            '      <li><strong>Steps:</strong> ' + payload.steps.toLocaleString() + '</li>' +
            '      <li><strong>Elevation Gain:</strong> ' + payload.elevationGainM + ' m</li>' +
            '    </ul>' +
            '  </article>' +
            '</div>' +
            '<div class="rr-grid">' +
            '  <article class="rr-panel rr-print-card">' +
            '    <h3>Foods to Prioritize</h3>' +
            '    <ul>' + foodItems + '</ul>' +
            '  </article>' +
            '  <article class="rr-panel rr-print-card">' +
            '    <h3>Ready to Resume?</h3>' +
            '    <p>' + escapeHtml(readinessMessage(result.recoveryHours)) + '</p>' +
            (payload.notes ? ('<p class="rr-note"><strong>Notes:</strong> ' + escapeHtml(payload.notes) + '</p>') : '') +
            '  </article>' +
            '</div>' +
            '<article class="rr-disclaimer rr-print-card">' +
            '  <p>This report is educational and not medical advice.</p>' +
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
        }

        if (heightUnit) {
            heightUnit.addEventListener('change', syncUnitFields);
        }
        if (distanceUnit) {
            distanceUnit.addEventListener('change', syncUnitFields);
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
                weightKg: asNumber(form.weight_kg.value),
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
            payload.distanceKmInput = toKm(payload.distanceInput, payload.distanceUnit);

            if (!payload.hikeDate || !payload.age || !payload.heightInput || !payload.weightKg || !payload.durationMinutes) {
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
