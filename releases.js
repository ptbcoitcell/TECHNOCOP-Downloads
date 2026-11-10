const owner = "ptbcoitcell";
const repo = "TECHNOCOP-Downloads";

const config = {
  android: { label: "Android", ext: ".apk", icon: "ANDROID" },
  windows: { label: "Windows", ext: ".exe", icon: "WINDOWS" },
  ios: { label: "iOS", ext: ".ipa", icon: "iOS" }
};

const platformKey = document.body.dataset.platform;
const platform = config[platformKey];
const list = document.querySelector("#release-list");
const status = document.querySelector("#release-status");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[char]));
}

function prettyDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDownloads(count) {
  const n = Number(count || 0);
  return `${n.toLocaleString()} download${n === 1 ? "" : "s"}`;
}

function formatSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function downloadIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/></svg>`;
}

function renderNotes(markdown) {
  const linkPattern = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(String(markdown ?? ""))) !== null) {
    html += escapeHtml(String(markdown).slice(lastIndex, match.index));
    const label = escapeHtml(match[1]);
    const href = escapeHtml(match[2]);
    html += `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    lastIndex = linkPattern.lastIndex;
  }

  html += escapeHtml(String(markdown ?? "").slice(lastIndex));
  return html.replace(/\r?\n/g, "<br>");
}

function render(releases) {
  const sorted = [...releases].sort(
    (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
  );
  const matches = sorted
    .map(release => ({
      release,
      assets: (release.assets || []).filter(asset => asset.name.toLowerCase().endsWith(platform.ext))
    }))
    .filter(entry => entry.assets.length);

  if (!matches.length) {
    status.textContent = `No ${platform.label} installers are listed yet. Check the GitHub release archive or try again after a release is published.`;
    return;
  }

  const platformTotal = matches.reduce(
    (sum, entry) => sum + entry.assets.reduce((aSum, asset) => aSum + Number(asset.download_count || 0), 0),
    0
  );

  status.textContent = `${matches.length} ${platform.label} release${matches.length === 1 ? "" : "s"} found · ${formatDownloads(platformTotal)} total.`;
  list.innerHTML = matches.map(({ release, assets }) => {
    const releaseTotal = assets.reduce((sum, asset) => sum + Number(asset.download_count || 0), 0);
    return `
    <article class="release-card">
      <div class="release-head">
        <div><span class="platform">${platform.icon}</span><h2>${escapeHtml(release.name || release.tag_name)}</h2></div>
        <span class="date">${escapeHtml(prettyDate(release.published_at))}</span>
      </div>
      <p class="tag">Version ${escapeHtml(release.tag_name)}${assets.length > 1 ? ` · ${escapeHtml(formatDownloads(releaseTotal))} total` : ""}</p>
      ${release.body ? `<p class="notes">${renderNotes(release.body)}</p>` : ""}
      <div class="asset-list">${assets.map(asset => {
        const sizeText = formatSize(asset.size);
        return `
        <div class="asset-item">
          <a class="button" href="${escapeHtml(asset.browser_download_url)}">Download ${escapeHtml(asset.name)}</a>
          <p class="asset-meta">
            <span class="download-badge">${downloadIcon()}<span>${escapeHtml(formatDownloads(asset.download_count))}</span></span>
            ${sizeText ? `<span class="asset-size">${escapeHtml(sizeText)}</span>` : ""}
          </p>
        </div>
        `;
      }).join("")}</div>
    </article>
  `;
  }).join("");
}

const loadTimeout = window.setTimeout(() => {
  if (status.textContent.startsWith("Loading")) {
    status.textContent = "Release list is taking too long to load. Check your connection and refresh this page.";
  }
}, 12000);

fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, {
  cache: "no-store",
  headers: { Accept: "application/vnd.github+json" }
})
  .then(response => {
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    return response.json();
  })
  .then(releases => {
    window.clearTimeout(loadTimeout);
    render(releases);
  })
  .catch(() => {
    window.clearTimeout(loadTimeout);
    status.textContent = "Could not load releases. Check your connection and refresh this page.";
  });
