(function () {
    const list = document.getElementById('hikeList');
    if (!list) return;

    const cards = Array.from(list.querySelectorAll('.hike-directory-card'));
    const tabs = Array.from(document.querySelectorAll('[data-hike-filter]'));
    const tabList = document.querySelector('.status-tabs');
    const count = document.getElementById('hikeResultCount');
    const summary = document.getElementById('hikeStatusSummary');
    const empty = document.getElementById('hikesEmpty');
    const hasUpcomingHikes = cards.some(card => card.dataset.hikeStatus === 'upcoming');

    const statusLabels = {
        upcoming: 'upcoming',
        sold_out: 'sold-out',
        members_only: 'members-only',
        cancelled: 'cancelled',
        completed: 'completed'
    };

    function applyFilter(status) {
        let visible = 0;
        cards.forEach(card => {
            const show = card.dataset.hikeStatus === status;
            card.hidden = !show;
            if (show) visible += 1;
        });
        let activeTab = null;
        tabs.forEach(tab => {
            const active = tab.dataset.hikeFilter === status;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-pressed', String(active));
            if (active) activeTab = tab;
        });
        count.textContent = `${visible} ${visible === 1 ? 'hike' : 'hikes'}`;
        if (summary) {
            const visibleLabel = statusLabels[status] || status.replaceAll('_', ' ');
            summary.textContent = !hasUpcomingHikes && status === 'completed'
                ? `No upcoming hikes are open right now — showing ${visible} completed ${visible === 1 ? 'hike' : 'hikes'}.`
                : `Showing ${visible} ${visibleLabel} ${visible === 1 ? 'hike' : 'hikes'}.`;
        }
        empty.hidden = visible !== 0;
        list.dataset.activeStatus = status;

        if (activeTab && tabList && tabList.scrollWidth > tabList.clientWidth) {
            requestAnimationFrame(() => {
                const targetLeft = activeTab.offsetLeft - ((tabList.clientWidth - activeTab.offsetWidth) / 2);
                tabList.scrollTo({ left: Math.max(0, targetLeft), behavior: 'auto' });
            });
        }
    }

    function firstAvailableStatus() {
        const statuses = tabs.map(tab => tab.dataset.hikeFilter);
        return statuses.find(status => cards.some(card => card.dataset.hikeStatus === status)) || 'upcoming';
    }

    tabs.forEach(tab => tab.addEventListener('click', () => applyFilter(tab.dataset.hikeFilter)));
    applyFilter(firstAvailableStatus());
})();
