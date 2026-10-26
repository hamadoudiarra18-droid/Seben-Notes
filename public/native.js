// Glue between Seben Notes and the phone.
// - On the website: registers the offline service worker.
// - In the Android app: files are saved and shared with the phone's share menu, and the Back button navigates inside the app.
(function () {
  const C = window.Capacitor;
  const native = !!(C && C.isNativePlatform && C.isNativePlatform());

  if (!native) {
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
    return;
  }

  const { Filesystem, Share, App } = C.Plugins;
  const toBase64 = blob => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

  window.SebenNative = {
    // Returns true when shared, false when cancelled, null to let the app use its normal download.
    async deliver(filename, data, type) {
      try {
        const blob = data instanceof Blob ? data : new Blob([data], { type: type || "text/plain" });
        const path = String(filename).replace(/[\\/:*?"<>|]/g, "_");
        const written = await Filesystem.writeFile({ path, data: await toBase64(blob), directory: "CACHE" });
        await Share.share({ title: path, files: [written.uri], dialogTitle: "Enregistrer ou partager" });
        return true;
      } catch (e) {
        if (/cancel/i.test(String((e && e.message) || e))) return false;
        return null;
      }
    }
  };

  if (App) App.addListener("backButton", () => {
    const scrim = document.querySelector(".scrim");
    if (scrim) { scrim.dispatchEvent(new MouseEvent("click", { bubbles: true })); return; }
    if (typeof S === "undefined") { App.exitApp(); return; }
    if (S.view === "editor" && typeof closeEditor === "function") { closeEditor(); return; }
    if (S.selecting && typeof exitSelect === "function") { exitSelect(); return; }
    if (S.view !== "home" && typeof show === "function") { show("home"); return; }
    App.exitApp();
  });
})();
