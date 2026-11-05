// Video for lessons and drills. Videos are streamed from a managed host,
// never from this site:
//   youtube / vimeo  ref = the video id. Captions and speed live in their player.
//   hls              ref = an https .m3u8 URL (Mux, Cloudflare Stream, ...).
//   file             ref = an https MP4 URL.
// For hls and file the page draws its own controls on top of the browser's
// player: playback speed, frame-by-frame steps and chapters.
// Nothing loads until the rider presses play, so pages stay fast.

const HLS_JS = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FRAME = 1 / 30;

export const KIND_LABEL = {
  instruction: 'Instruction', demonstration: 'Pro demonstration', 'slow-motion': 'Slow motion', angle: 'Alternate angle',
  mistake: 'Common mistake', drill: 'Drill demo', physics: 'Physics animation', analysis: 'Annotated analysis', commentary: 'Coach commentary'
};

export function fmtTime(s) {
  s = Math.max(0, Math.round(Number(s) || 0));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

const okRef = m => m && m.ref && (m.provider === 'youtube' ? /^[\w-]{6,20}$/.test(m.ref)
  : m.provider === 'vimeo' ? /^\d{4,15}$/.test(m.ref) : /^https:\/\//.test(m.ref));

export function mediaCard(m, { compact = false } = {}) {
  if (!okRef(m)) return '';
  const chapters = Array.isArray(m.chapters) ? m.chapters.filter(c => c && c.label != null) : [];
  return `<figure class="video${compact ? ' video--compact' : ''}" data-video="${esc(m.id)}">
    <div class="video-frame">
      <button type="button" class="video-poster" data-video-play
        ${m.thumbnail ? `style="background-image:url('${esc(m.thumbnail)}')"` : ''}>
        <span class="video-play" aria-hidden="true">&#9654;</span>
        <span class="visually-hidden">Play video: </span><span class="video-poster-title">${esc(m.title)}</span>
        ${m.duration_s ? `<span class="video-duration">${fmtTime(m.duration_s)}</span>` : ''}
      </button>
    </div>
    <figcaption>
      <p class="kicker">${esc(KIND_LABEL[m.kind] || 'Video')}</p>
      <p class="video-title">${esc(m.title)}</p>
      ${m.description ? `<p class="video-desc">${esc(m.description)}</p>` : ''}
      ${chapters.length ? `<ol class="video-chapters" aria-label="Chapters">${chapters.map(c =>
        `<li><button type="button" data-video-seek="${Number(c.t) || 0}"><span class="meta">${fmtTime(c.t)}</span> ${esc(c.label)}</button></li>`).join('')}</ol>` : ''}
      ${m.creator ? `<p class="meta">Video: ${esc(m.creator)}</p>` : ''}
    </figcaption>
  </figure>`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject; s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  });
}

function embedSrc(m, start = 0, autoplay = true) {
  if (m.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(m.ref)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&cc_load_policy=1${autoplay ? '&autoplay=1' : ''}${start ? '&start=' + Math.floor(start) : ''}`;
  }
  return `https://player.vimeo.com/video/${encodeURIComponent(m.ref)}?dnt=1&playsinline=1${autoplay ? '&autoplay=1' : ''}#t=${Math.floor(start)}s`;
}

function start(fig, m, at = 0) {
  const frame = fig.querySelector('.video-frame');
  if (m.provider === 'youtube' || m.provider === 'vimeo') {
    frame.innerHTML = `<iframe src="${esc(embedSrc(m, at))}" title="${esc(m.title)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
    fig._seek = t => {
      const f = frame.querySelector('iframe');
      if (m.provider === 'youtube') f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [t, true] }), '*');
      else f.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: t }), '*');
    };
    return;
  }
  frame.innerHTML = `<video controls playsinline preload="metadata" ${m.thumbnail ? `poster="${esc(m.thumbnail)}"` : ''}>
      ${m.captions_url ? `<track kind="captions" src="${esc(m.captions_url)}" srclang="en" label="English" default>` : ''}
    </video>`;
  const v = frame.querySelector('video');
  const isHls = /\.m3u8(\?|$)/.test(m.ref) || m.provider === 'hls';
  const attach = () => {
    if (isHls && !v.canPlayType('application/vnd.apple.mpegurl')) {
      return loadScript(HLS_JS).then(() => {
        if (!window.Hls || !window.Hls.isSupported()) throw new Error('hls');
        const h = new window.Hls(); h.loadSource(m.ref); h.attachMedia(v);
      });
    }
    v.src = m.ref;
    return Promise.resolve();
  };
  attach().then(() => {
    if (at) v.currentTime = at;
    v.play().catch(() => {});
  }).catch(() => { frame.innerHTML = '<p class="video-error">This video couldn\'t load. Check your connection and try again.</p>'; });

  const bar = document.createElement('div');
  bar.className = 'video-tools';
  bar.innerHTML = `
    <label>Speed <select data-speed>${[0.25, 0.5, 0.75, 1, 1.25].map(r => `<option value="${r}"${r === 1 ? ' selected' : ''}>${r}&times;</option>`).join('')}</select></label>
    <button type="button" data-step="-1" aria-label="Back one frame">&#9664;&#9646; Frame</button>
    <button type="button" data-step="1" aria-label="Forward one frame">Frame &#9646;&#9654;</button>`;
  frame.after(bar);
  bar.querySelector('[data-speed]').addEventListener('change', e => { v.playbackRate = Number(e.target.value); });
  bar.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
    v.pause();
    v.currentTime = Math.max(0, Math.min(v.duration || Infinity, v.currentTime + Number(b.dataset.step) * FRAME));
  }));
  fig._seek = t => { v.currentTime = t; v.play().catch(() => {}); };
}

export function wireVideos(root, mediaById) {
  root.addEventListener('click', e => {
    const fig = e.target.closest && e.target.closest('[data-video]');
    if (!fig) return;
    const m = mediaById.get(fig.dataset.video);
    if (!m) return;
    if (e.target.closest('[data-video-play]')) {
      start(fig, m);
      if (window.mathleteTrack) window.mathleteTrack('video_played');
    }
    const seek = e.target.closest('[data-video-seek]');
    if (seek) {
      const t = Number(seek.dataset.videoSeek) || 0;
      if (fig._seek) fig._seek(t); else start(fig, m, t);
    }
  });
}
