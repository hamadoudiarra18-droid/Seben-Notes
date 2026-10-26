// Glue between Seben Notes and the phone.
// - Website: registers the offline service worker.
// - Android app (Capacitor build or the simple Code Assist project): exported files are
//   saved/shared through the phone, and the Back button navigates inside the app.
(function () {
  const C = window.Capacitor;
  const capacitor = !!(C && C.isNativePlatform && C.isNativePlatform());
  const simple = !!window.SebenAndroid; // bridge added by codeassist/SebenNotes MainActivity

  // Back button: returns true when the app handled it, false when the app should close.
  window.sebenBack = function () {
    const scrim = document.querySelector(".scrim, .drawer-scrim");
    if (scrim) { scrim.dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; }
    if (typeof S === "undefined") return false;
    if (S.view === "editor" && typeof closeEditor === "function") { closeEditor(); return true; }
    if (S.selecting && typeof exitSelect === "function") { exitSelect(); return true; }
    if (S.view !== "home" && typeof show === "function") { show("home"); return true; }
    return false;
  };

  if (!capacitor && !simple) {
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
    return;
  }

  const toBase64 = blob => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
  const asBlob = (data, type) => data instanceof Blob ? data : new Blob([data], { type: type || "text/plain" });

  if (simple) {
    window.SebenNative = {
      async deliver(filename, data, type) {
        try {
          const blob = asBlob(data, type);
          window.SebenAndroid.saveFile(String(filename), await toBase64(blob), blob.type || type || "");
          return true;
        } catch (e) { return null; }
      }
    };
    return;
  }

  const { Filesystem, Share, App } = C.Plugins;
  window.SebenNative = {
    // Returns true when shared, false when cancelled, null to let the app use its normal download.
    async deliver(filename, data, type) {
      try {
        const blob = asBlob(data, type);
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
  if (App) App.addListener("backButton", () => { if (!window.sebenBack()) App.exitApp(); });
})();
