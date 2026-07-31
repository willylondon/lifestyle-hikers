(function () {
    const list = document.getElementById('hikeList');
    if (!list) return;

    const cards = Array.from(list.querySelectorAll('.hike-directory-card'));
    const tabs = Array.from(document.querySelectorAll('[data-hike-filter]'));
    const count = document.getElementById('hikeResultCount');
    const empty = document.getElementById('hikesEmpty');

    function applyFilter(status) {
        let visible = 0;
        cards.forEach(card => {
            const show = card.dataset.hikeStatus === status;
            card.hidden = !show;
            if (show) visible += 1;
        });
        tabs.forEach(tab => {
            const active = tab.dataset.hikeFilter === status;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-pressed', String(active));
        });
        count.textContent = `${visible} ${visible === 1 ? 'hike' : 'hikes'}`;
        empty.hidden = visible !== 0;
    }

    tabs.forEach(tab => tab.addEventListener('click', () => applyFilter(tab.dataset.hikeFilter)));
    applyFilter('upcoming');
})();

