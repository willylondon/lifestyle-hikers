(function () {
    const grid = document.getElementById('explorerGrid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.explorer-card'));
    const controls = {
        search: document.getElementById('explorerSearch'),
        parish: document.getElementById('parishFilter'),
        difficulty: document.getElementById('difficultyFilter'),
        distance: document.getElementById('distanceFilter'),
        duration: document.getElementById('durationFilter'),
        river: document.getElementById('riverFilter'),
        guide: document.getElementById('guideFilter'),
        sort: document.getElementById('trailSort')
    };
    const count = document.getElementById('trailResultCount');
    const empty = document.getElementById('trailExplorerEmpty');
    const clear = document.getElementById('clearTrailFilters');

    const normalize = (value) => String(value || '').toLowerCase().trim();
    const number = (value) => Number.parseFloat(value) || 0;

    function matchesRange(value, range, mediumMax) {
        if (!range) return true;
        if (range === 'short') return value > 0 && value < 5;
        if (range === 'medium') return value >= 5 && value <= mediumMax;
        return value > mediumMax;
    }

    function matchesDuration(value, range) {
        if (!range) return true;
        if (range === 'short') return value > 0 && value <= 120;
        if (range === 'medium') return value > 120 && value <= 240;
        return value > 240;
    }

    function update() {
        const query = normalize(controls.search.value);
        const visible = cards.filter((card) => {
            const textMatch = !query || `${card.dataset.name} ${card.dataset.parish}`.includes(query);
            return textMatch
                && (!controls.parish.value || card.dataset.parish === controls.parish.value)
                && (!controls.difficulty.value || card.dataset.difficulty === controls.difficulty.value)
                && matchesRange(number(card.dataset.distance), controls.distance.value, 10)
                && matchesDuration(number(card.dataset.duration), controls.duration.value)
                && (!controls.river.value || card.dataset.river === controls.river.value)
                && (!controls.guide.value || card.dataset.guide === controls.guide.value);
        });

        const difficultyOrder = { easy: 1, moderate: 2, hard: 3 };
        const sort = controls.sort.value;
        cards.sort((a, b) => {
            if (sort === 'name') return a.dataset.name.localeCompare(b.dataset.name);
            if (sort === 'difficulty') return (difficultyOrder[a.dataset.difficulty] || 9) - (difficultyOrder[b.dataset.difficulty] || 9);
            if (sort === 'distance') return number(a.dataset.distance) - number(b.dataset.distance);
            if (sort === 'duration') return number(a.dataset.duration) - number(b.dataset.duration);
            return (b.dataset.verified || '').localeCompare(a.dataset.verified || '') || a.dataset.name.localeCompare(b.dataset.name);
        }).forEach(card => grid.appendChild(card));

        cards.forEach(card => {
            card.hidden = !visible.includes(card);
        });
        count.textContent = `${visible.length} ${visible.length === 1 ? 'trail' : 'trails'} found`;
        empty.hidden = visible.length !== 0;
    }

    Object.values(controls).forEach(control => control?.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', update));
    clear?.addEventListener('click', () => {
        Object.entries(controls).forEach(([key, control]) => {
            if (key !== 'sort' && control) control.value = '';
        });
        controls.sort.value = 'verified';
        update();
        controls.search.focus();
    });

    update();
})();

