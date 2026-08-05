(function () {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('[data-blog-card]'));
    const search = document.getElementById('blog-search');
    const category = document.getElementById('blog-category');
    const resultCount = document.getElementById('blog-result-count');
    const clear = document.getElementById('blog-clear');
    const empty = document.getElementById('blog-no-results');
    const loadMore = document.getElementById('blog-load-more');
    const loadMoreWrap = document.getElementById('blog-load-more-wrap');
    const pageSize = 12;
    let visibleLimit = pageSize;

    const normalize = value => (value || '').toLowerCase().replace(/\s+/g, ' ').trim();

    function matchingCards() {
        const query = normalize(search.value);
        const selectedCategory = category.value;

        return cards.filter(card => {
            const matchesQuery = !query || normalize(card.dataset.blogSearch).includes(query);
            const matchesCategory = selectedCategory === 'all' || card.dataset.blogCategory === selectedCategory;
            return matchesQuery && matchesCategory;
        });
    }

    function render() {
        const matches = matchingCards();
        const shown = matches.slice(0, visibleLimit);
        const shownSet = new Set(shown);

        cards.forEach(card => {
            card.hidden = !shownSet.has(card);
        });

        resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'story' : 'stories'} found`;
        empty.hidden = matches.length !== 0;
        clear.hidden = !search.value && category.value === 'all';
        loadMoreWrap.hidden = matches.length <= visibleLimit;
    }

    function resetAndRender() {
        visibleLimit = pageSize;
        render();
    }

    search.addEventListener('input', resetAndRender);
    category.addEventListener('change', resetAndRender);
    clear.addEventListener('click', () => {
        search.value = '';
        category.value = 'all';
        resetAndRender();
        search.focus();
    });
    loadMore.addEventListener('click', () => {
        visibleLimit += pageSize;
        render();
        const firstNewCard = matchingCards()[visibleLimit - pageSize];
        firstNewCard?.querySelector('a')?.focus();
    });

    render();
})();
