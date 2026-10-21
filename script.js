document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const syncThemeLabel = () => {
    const dark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  if (themeToggle) {
    syncThemeLabel();
    themeToggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }

  const content = window.siteContent;
  const page = document.body.dataset.page || document.location.pathname.split('/').pop() || 'index.html';

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (!node || value === undefined || value === null) return;
    node.innerHTML = value;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const setupAudioPlayer = (audio) => {
    const player = document.createElement('div');
    const button = document.createElement('button');
    const seek = document.createElement('input');
    const time = document.createElement('span');
    let clipLength = 30;

    player.className = 'custom-audio';
    button.type = 'button';
    button.className = 'audio-toggle';
    button.setAttribute('aria-label', 'Play 30 second preview');
    button.textContent = '▶';
    seek.type = 'range';
    seek.className = 'audio-seek';
    seek.min = '0';
    seek.max = String(clipLength);
    seek.step = '0.1';
    seek.value = '0';
    seek.setAttribute('aria-label', 'Seek through 30 second preview');
    time.className = 'audio-time';
    time.textContent = `0:00 / ${formatTime(clipLength)}`;

    player.append(button, seek, time);
    audio.controls = false;
    audio.hidden = true;
    audio.parentNode.insertBefore(player, audio);

    button.addEventListener('click', () => {
      if (audio.paused) {
        if (audio.currentTime >= clipLength) audio.currentTime = 0;
        audio.play();
      } else {
        audio.pause();
      }
    });

    seek.addEventListener('input', () => {
      audio.currentTime = Number(seek.value);
    });

    audio.addEventListener('loadedmetadata', () => {
      clipLength = audio.duration;
      seek.max = String(clipLength);
      time.textContent = `0:00 / ${formatTime(clipLength)}`;
    });

    audio.addEventListener('timeupdate', () => {
      seek.value = String(audio.currentTime);
      time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(clipLength)}`;
    });

    audio.addEventListener('play', () => {
      button.textContent = '❚❚';
      button.setAttribute('aria-label', 'Pause 30 second preview');
    });
    audio.addEventListener('pause', () => {
      button.textContent = '▶';
      button.setAttribute('aria-label', 'Play 30 second preview');
    });
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

      const featuredWork = content.compositions.works[0];
      const featuredScore = document.querySelector('[data-featured-score]');
      const featuredAudio = document.querySelector('[data-featured-audio]');
      if (featuredScore && featuredWork) featuredScore.src = featuredWork.image;
      if (featuredAudio && featuredWork) {
        featuredAudio.src = featuredWork.audio;
        setupAudioPlayer(featuredAudio);
      }
    }

    if (page === 'about.html') {
      setText('[data-page-title]', content.about.pageTitle);
      setText('[data-about-eyebrow]', content.about.eyebrow);
      setText('[data-about-heading]', content.about.heading);
      setText('[data-about-roles]', content.about.roles);
      setText('[data-about-instruments]', content.about.instruments);
      setText('[data-about-reviews-heading]', content.about.reviewsHeading);
      setText('[data-about-bio]', content.about.bio.map((p) => `<p>${p}</p>`).join(''));
      setText('[data-about-reviews]', content.about.reviews.map((r) => `
        <blockquote class="review">
          <h3>${r.work}</h3>
          <p>${r.text}</p>
          <footer>${r.author}</footer>
          ${r.note ? `<p class="review-note">${r.note}</p>` : ''}
        </blockquote>
      `).join(''));
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
              <img src="${work.image}" alt="${work.alt}">
            </div>
            <div>
              <h2>${work.title}</h2>
              <p class="meta">${work.meta}</p>
              <p>${work.description}</p>
              <details class="listen">
                <summary>Listen</summary>
                <audio>
                  <source src="${work.audio}" type="audio/mpeg">
                </audio>
              </details>
            </div>
          </article>
        `).join('');

        worksContainer.querySelectorAll('audio').forEach(setupAudioPlayer);
      }
    }
  }
});
