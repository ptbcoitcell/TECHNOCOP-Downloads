# TECHNOCOP download page

This is a static GitHub Pages download page. Before publishing:

1. The download links in `index.html` point to `ptbcoitcell/TECHNOCOP-Downloads` based on the repository shown in the setup screenshot. Change them if you use a different repository.
2. Create a GitHub Release for each app version and upload the Android APK, Windows EXE, and iOS IPA using the exact filenames in the download links. The current Android and Windows links are set to Android 3.4 and Windows 2.4.0; the iOS link expects `TECHNOCOP-iOS.ipa`.
3. Keep old releases in GitHub Releases. The “All versions” links open that release archive.
4. Put this `index.html` at the root of a public repository, or copy it to the root of a dedicated public repository.
5. In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and `/ (root)`, then save. GitHub will show the published page URL.

Update the displayed version and download filenames in `index.html` whenever you publish a new stable release. An iOS IPA must be signed and distributed using a method supported for the intended devices; simply hosting an IPA does not make it installable on every iPhone or iPad. Upload only public app installers; do not put officer records, credentials, or private configuration in a public repository.
