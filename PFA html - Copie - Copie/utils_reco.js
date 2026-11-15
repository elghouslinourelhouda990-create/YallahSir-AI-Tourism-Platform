function savePrefs(prefs) {
    console.log("Préférences sauvegardées localement :", prefs);
    localStorage.setItem('wc2030_prefs', JSON.stringify(prefs));
}