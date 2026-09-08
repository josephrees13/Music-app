document.addEventListener('DOMContentLoaded', () => {
  const content = window.siteContent;
  const page = document.body.dataset.page || document.location.pathname.split('/').pop() || 'index.html';

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (!node || value === undefined || value === null) return;
    node.innerHTML = value;
  };

  if (content && content.siteName) {
    document.title = content.home.pageTitle;

    if (page === 'index.html') {
      setText('[data-page-title]', content.home.pageTitle);
      setText('[data-home-eyebrow]', content.home.eyebrow);
      setText('[data-home-title]', content.home.heroTitle);
      setText('[data-home-intro]', content.home.intro);
      setText('[data-home-button]', content.home.button);
      setText('[data-featured-eyebrow]', content.home.featuredEyebrow);
      setText('[data-featured-title]', content.home.featuredTitle);
      setText('[data-featured-meta]', content.home.featuredMeta);
      setText('[data-featured-description]', content.home.featuredDescription);
      setText('[data-view-all]', content.home.viewAll);
      setText('[data-footer]', content.footer);
    }

    if (page === 'about.html') {
      setText('[data-page-title]', content.about.pageTitle);
      setText('[data-about-eyebrow]', content.about.eyebrow);
      setText('[data-about-heading]', content.about.heading);
      setText('[data-about-intro]', content.about.intro);
      setText('[data-about-bio]', content.about.bio);
      setText('[data-about-contact-label]', content.about.contactLabel);
      setText('[data-about-email]', content.about.email);
      setText('[data-footer]', content.footer);
    }

    if (page === 'compositions.html') {
      setText('[data-page-title]', content.compositions.pageTitle);
      setText('[data-compositions-eyebrow]', content.compositions.eyebrow);
      setText('[data-compositions-heading]', content.compositions.heading);
      setText('[data-footer]', content.footer);

      const worksContainer = document.querySelector('[data-works]');
      if (worksContainer) {
        worksContainer.innerHTML = content.compositions.works.map((work) => `
          <article class="work">
            <div class="score-preview">
              <img src="${work.image}" alt="${work.alt}" onerror="this.remove()">
              <span class="score-lines" aria-hidden="true"></span>
              <span class="score-notes" aria-hidden="true">♪ ♫</span>
            </div>
            <div>
              <h2>${work.title}</h2>
              <p class="meta">${work.meta}</p>
              <details class="listen">
                <summary>Listen</summary>
                <audio controls>
                  <source src="${work.audio}" type="audio/mpeg">
                </audio>
              </details>
            </div>
          </article>
        `).join('');
      }
    }
  }
});
