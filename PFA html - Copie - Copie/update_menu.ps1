# Script to update the navigation menu and common head elements across all HTML files

# Use HTML entities for safety
$francais = "Fran&ccedil;ais"
$arabe = "&#x0627;&#x0644;&#x0639;&#x0631;&#x0628;&#x064a;&#x0629;"
$espanol = "Espa&ntilde;ol"
$activites = "Activit&eacute;s"
$itineraires = "Itin&eacute;raires"

$menuHtml = @"
    <header class="header">
        <div class="logo-container">
            <div class="logo-icon">
                <img src="logo.png" alt="Morocco 2030 Logo" class="logo-img">
            </div>
            <div class="logo-text">
                <span class="logo-title">Morocco 2030</span>
                <span class="logo-subtitle">World Cup Guide</span>
            </div>
        </div>
        <nav class="nav-menu">
            <a href="index.html" class="nav-item" data-i18n="nav_home">Accueil</a>
            <a href="map.html" class="nav-item" data-i18n="nav_map">Carte</a>
            <a href="matches.html" class="nav-item" data-i18n="nav_matches">Matchs</a>
            <a href="culture.html" class="nav-item" data-i18n="nav_culture">Culture</a>
            <a href="activities.html" class="nav-item" data-i18n="nav_activities">$activites</a>
            <a href="itineraries.html" class="nav-item" data-i18n="nav_itineraries">$itineraires</a>
            <a href="services.html" class="nav-item" data-i18n="nav_services">Services</a>
            <a href="chat.html" class="nav-item" data-i18n="nav_chat">Assistant</a>
        </nav>
        <div class="auth-buttons">
            <div class="lang-switcher">
                <button class="lang-btn" id="langBtn">
                    <i class="fa-solid fa-globe"></i>
                    <span id="currentLang">$francais</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="lang-dropdown" id="langDropdown">
                    <a href="#" data-lang="fr" class="active">$francais</a>
                    <a href="#" data-lang="en">English</a>
                    <a href="#" data-lang="ar">$arabe</a>
                    <a href="#" data-lang="es">$espanol</a>
                </div>
            </div>
            
            <!-- Notifications Icon -->
            <div class="notification-wrapper">
                <button class="notif-btn" id="notifBtn">
                    <i class="fa-regular fa-bell"></i>
                    <span class="notif-badge-indicator"></span>
                </button>
                <div class="notif-dropdown" id="notifDropdown">
                    <div class="notif-header">
                        <h4 data-i18n="notifications_title">Notifications</h4>
                        <span class="mark-read" data-i18n="mark_all_read">Marquer tout comme lu</span>
                    </div>
                    <div class="notif-list">
                        <!-- Notifications injected via script -->
                    </div>
                </div>
            </div>
            <div id="authContainer" class="auth-buttons-wrapper">
                <!-- Fallback content if JS is slow -->
                <a href="login.html" class="btn-login" data-i18n="login_btn">Connexion</a>
                <a href="signup.html" class="btn-signup" data-i18n="signup_btn">S'inscrire</a>
            </div>
        </div>
    </header>
"@

# Match the header tag
$headerStartPattern = '<header class="header">'
$headerEndPattern = '</header>'

# Process each .html file
Get-ChildItem -Filter *.html | ForEach-Object {
    $filePath = $_.FullName
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    
    $startIndex = $content.IndexOf($headerStartPattern)
    $endIndex = $content.IndexOf($headerEndPattern, [Math]::Max(0, $startIndex))
    
    if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
        $endIndex += $headerEndPattern.Length
        $before = $content.Substring(0, $startIndex)
        $after = $content.Substring($endIndex)
        $newContent = $before + $menuHtml + $after
        
        # Save back to UTF8 without BOM
        $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($filePath, $newContent, $utf8NoBOM)
        Write-Host "Restored header with Spanish in: $($_.Name)"
    } else {
        # Try fallback matching <header>
        $startIndex = $content.IndexOf("<header>")
        if ($startIndex -ge 0) {
             $endIndex = $content.IndexOf($headerEndPattern, $startIndex)
             if ($endIndex -gt $startIndex) {
                $endIndex += $headerEndPattern.Length
                $before = $content.Substring(0, $startIndex)
                $after = $content.Substring($endIndex)
                $newContent = $before + $menuHtml + $after
                [System.IO.File]::WriteAllText($filePath, $newContent, $utf8NoBOM)
                Write-Host "Restored header (fallback) with Spanish in: $($_.Name)"
             }
        } else {
            Write-Host "Warning: Could not find header tags in: $($_.Name)"
        }
    }
}

Write-Host "Menu update complete!"
