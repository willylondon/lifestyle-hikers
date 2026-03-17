/* ============================================
   Decap CMS — Custom Preview Templates
   Lifestyle Hikers Theme
   ============================================ */

// --- Shared Preview Styles ---
const previewStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --clr-primary: #2d6a4f;
    --clr-primary-light: #40916c;
    --clr-primary-dark: #1b4332;
    --clr-accent: #d4a373;
    --clr-accent-light: #e9c46a;
    --clr-dark: #0f1a12;
    --clr-dark-card: #162119;
    --clr-dark-surface: #1c2e22;
    --clr-text: #e8ede9;
    --clr-text-muted: #9aaa9e;
    --clr-white: #ffffff;
    --clr-border: rgba(255, 255, 255, 0.08);
    --clr-easy: #52b788;
    --clr-moderate: #e9c46a;
    --clr-hard: #e76f51;
    --font-heading: 'Outfit', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  body {
    font-family: var(--font-body);
    background: var(--clr-dark);
    color: var(--clr-text);
    line-height: 1.6;
    margin: 0;
    padding: 2rem;
    -webkit-font-smoothing: antialiased;
  }

  * { box-sizing: border-box; }
  img { max-width: 100%; height: auto; border-radius: 12px; }
  a { color: var(--clr-primary-light); }

  /* Blog post preview */
  .post-preview {
    max-width: 800px;
    margin: 0 auto;
  }

  .post-preview .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: rgba(45, 106, 79, 0.12);
    border: 1px solid rgba(45, 106, 79, 0.25);
    border-radius: 24px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--clr-primary-light);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 1rem;
  }

  .post-preview h1 {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--clr-white);
    line-height: 1.15;
    margin: 0.5rem 0 1rem;
  }

  .post-preview .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: var(--clr-text-muted);
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--clr-border);
  }

  .post-preview .meta span::before {
    margin-right: 0.4rem;
    opacity: 0.6;
  }

  .post-preview .hero-image {
    width: 100%;
    height: 360px;
    object-fit: cover;
    border-radius: 16px;
    margin-bottom: 2rem;
  }

  .post-preview .content {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--clr-text);
  }

  .post-preview .content h2 {
    font-family: var(--font-heading);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--clr-white);
    margin: 2rem 0 0.75rem;
  }

  .post-preview .content h3 {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--clr-white);
    margin: 1.5rem 0 0.5rem;
  }

  .post-preview .content p {
    margin-bottom: 1rem;
  }

  .post-preview .content ul,
  .post-preview .content ol {
    margin: 0.5rem 0 1rem 1.5rem;
    color: var(--clr-text);
  }

  .post-preview .content li {
    margin-bottom: 0.4rem;
  }

  .post-preview .content strong {
    color: var(--clr-white);
  }

  .post-preview .content blockquote {
    border-left: 3px solid var(--clr-primary);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    background: var(--clr-dark-card);
    border-radius: 0 8px 8px 0;
    color: var(--clr-text-muted);
  }

  .post-preview .content code {
    background: var(--clr-dark-surface);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .post-preview .content pre {
    background: var(--clr-dark-card);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid var(--clr-border);
  }

  .post-preview .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--clr-border);
  }

  .post-preview .tag {
    padding: 0.3rem 0.8rem;
    background: var(--clr-dark-surface);
    border: 1px solid var(--clr-border);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--clr-text-muted);
  }

  /* Trail card preview */
  .trail-preview {
    max-width: 400px;
    background: var(--clr-dark-card);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--clr-border);
  }

  .trail-preview .card-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 0;
  }

  .trail-preview .card-body {
    padding: 1.25rem;
  }

  .trail-preview h3 {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--clr-white);
    margin: 0 0 0.25rem;
  }

  .trail-preview .location {
    font-size: 0.85rem;
    color: var(--clr-text-muted);
    margin-bottom: 0.75rem;
  }

  .trail-preview .trail-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: var(--clr-text-muted);
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid var(--clr-border);
  }

  .trail-preview .difficulty-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.75rem;
  }

  .trail-preview .difficulty-badge.easy {
    background: rgba(82, 183, 136, 0.15);
    color: var(--clr-easy);
  }
  .trail-preview .difficulty-badge.moderate {
    background: rgba(233, 196, 106, 0.15);
    color: var(--clr-moderate);
  }
  .trail-preview .difficulty-badge.hard {
    background: rgba(231, 111, 81, 0.15);
    color: var(--clr-hard);
  }

  .trail-preview .stars {
    color: var(--clr-accent);
    font-size: 0.85rem;
  }

  /* Event card preview */
  .event-preview {
    display: flex;
    max-width: 700px;
    background: var(--clr-dark-card);
    border: 1px solid var(--clr-border);
    border-radius: 16px;
    overflow: hidden;
  }

  .event-preview .date-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--clr-primary-dark), var(--clr-primary));
    text-align: center;
  }

  .event-preview .date-block .month {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--clr-accent-light);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .event-preview .date-block .day {
    font-family: var(--font-heading);
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--clr-white);
    line-height: 1;
    margin: 0.2rem 0;
  }

  .event-preview .date-block .weekday {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .event-preview .details {
    padding: 1.5rem;
    flex: 1;
  }

  .event-preview h3 {
    font-family: var(--font-heading);
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--clr-white);
    margin: 0.5rem 0 0.5rem;
  }

  .event-preview .event-info {
    font-size: 0.85rem;
    color: var(--clr-text-muted);
    margin-bottom: 0.5rem;
  }

  .event-preview .event-desc {
    font-size: 0.9rem;
    color: var(--clr-text);
    line-height: 1.6;
  }

  /* Gallery photo preview */
  .gallery-preview {
    max-width: 400px;
  }

  .gallery-preview img {
    width: 100%;
    border-radius: 12px;
    margin-bottom: 0.75rem;
  }

  .gallery-preview .caption {
    font-size: 0.9rem;
    color: var(--clr-text-muted);
    text-align: center;
  }

  .gallery-preview .size-label {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    background: var(--clr-dark-surface);
    border: 1px solid var(--clr-border);
    border-radius: 6px;
    font-size: 0.75rem;
    color: var(--clr-text-muted);
    margin-top: 0.5rem;
  }
`;

// ============================================
// Blog Post Preview Template
// ============================================
const PostPreview = createClass({
    render: function () {
        const entry = this.props.entry;
        const title = entry.getIn(['data', 'title']) || 'Untitled Post';
        const date = entry.getIn(['data', 'date']);
        const author = entry.getIn(['data', 'author']) || 'Lifestyle Hikers';
        const category = entry.getIn(['data', 'category']) || 'Trail Stories';
        const location = entry.getIn(['data', 'location']);
        const image = entry.getIn(['data', 'image']);
        const tags = entry.getIn(['data', 'tags']);
        const body = this.props.widgetFor('body');

        const imageUrl = image && this.props.getAsset(image);

        return h('div', { className: 'post-preview' },
            h('div', { className: 'badge' }, '🥾 ' + category),
            h('h1', {}, title),
            h('div', { className: 'meta' },
                date ? h('span', {}, '📅 ' + new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })) : null,
                h('span', {}, '✍️ ' + author),
                location ? h('span', {}, '📍 ' + location) : null
            ),
            imageUrl ? h('img', { className: 'hero-image', src: imageUrl.toString(), alt: title }) : null,
            h('div', { className: 'content' }, body),
            tags && tags.size > 0
                ? h('div', { className: 'tags' },
                    tags.map((tag) => h('span', { className: 'tag', key: tag }, '#' + tag))
                )
                : null
        );
    }
});

// ============================================
// Register Templates & Styles
// ============================================
CMS.registerPreviewStyle(previewStyles, { raw: true });
CMS.registerPreviewTemplate('posts', PostPreview);
