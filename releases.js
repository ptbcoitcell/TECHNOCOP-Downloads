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
const archiveLink = `https://github.com/${owner}/${repo}/releases`;

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

function render(releases) {
  const matches = releases
    .map(release => ({ release, assets: (release.assets || []).filter(asset => asset.name.toLowerCase().endsWith(platform.ext)) }))
    .filter(entry => entry.assets.length);

  if (!matches.length) {
    status.textContent = `No ${platform.label} installers are listed yet. Check the GitHub release archive or try again after a release is published.`;
    return;
  }

  status.textContent = `${matches.length} ${platform.label} release${matches.length === 1 ? "" : "s"} found.`;
  list.innerHTML = matches.map(({ release, assets }) => `
    <article class="release-card">
      <div class="release-head">
        <div><span class="platform">${platform.icon}</span><h2>${escapeHtml(release.name || release.tag_name)}</h2></div>
        <span class="date">${escapeHtml(prettyDate(release.published_at))}</span>
      </div>
      <p class="tag">Version ${escapeHtml(release.tag_name)}</p>
      ${release.body ? `<p class="notes">${escapeHtml(release.body).replace(/\r?\n/g, "<br>")}</p>` : ""}
      <div class="asset-list">${assets.map(asset => `
        <a class="button" href="${escapeHtml(asset.browser_download_url)}">Download ${escapeHtml(asset.name)}</a>
      `).join("")}</div>
    </article>
  `).join("");
}

fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, {
  headers: { Accept: "application/vnd.github+json" }
})
  .then(response => {
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    return response.json();
  })
  .then(render)
  .catch(() => {
    status.textContent = "Could not load the release list right now. Use the GitHub release archive below.";
  });

document.querySelectorAll(".archive-link").forEach(link => link.href = archiveLink);
