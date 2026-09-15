<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';

const ADMIN_BASE = '.';

function admin_head(string $title, bool $minimal = false): void
{
    $current = basename($_SERVER['SCRIPT_NAME'] ?? '');
    $navItems = [
        'index.php' => ['Tableau de bord', 'fa-gauge-high'],
        'services.php' => ['Services', 'fa-briefcase'],
        'solutions.php' => ['Solutions', 'fa-lightbulb'],
        'team.php' => ['Équipe', 'fa-user-tie'],
        'news.php' => ['Actualités', 'fa-newspaper'],
        'formations.php' => ['Formations', 'fa-graduation-cap'],
        'jobs.php' => ["Offres d'emploi", 'fa-clipboard-check'],
        'applications.php' => ['Candidatures', 'fa-file-lines'],
        'messages.php' => ['Messages de contact', 'fa-envelope'],
    ];
    ?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?> — Back-office TRU GROUP</title>
<link rel="icon" type="image/png" href="../logo-845x295.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer">
<style>
    :root {
        --bg: #f6f8fb;
        --text: #102036;
        --muted: #51617a;
        --primary: #1f9d55;
        --primary-dark: #157043;
        --dark: #0d1726;
        --card: #ffffff;
        --border: #dce3ef;
        color-scheme: light;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Manrope, sans-serif; background: var(--bg); color: var(--text); }
    a { color: var(--primary-dark); }
    h2, h3 { font-family: 'Space Grotesk', sans-serif; }
    .admin-shell { display: flex; min-height: 100vh; }
    .admin-nav {
        width: 240px;
        background: linear-gradient(180deg, var(--dark), #0a1220);
        color: #cfd6e4;
        padding: 22px 16px;
        flex-shrink: 0;
    }
    .admin-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
    .admin-brand img { width: 40px; height: auto; }
    .admin-brand span { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #fff; font-size: 15px; line-height: 1.2; }
    .admin-nav a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 999px;
        color: #cfd6e4;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 3px;
    }
    .admin-nav a i { width: 16px; text-align: center; opacity: 0.85; }
    .admin-nav a:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .admin-nav a.active { background: linear-gradient(120deg, var(--primary), #2cc974); color: #fff; }
    .admin-nav .logout { margin-top: 22px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
    .admin-main { flex: 1; padding: 32px 40px; max-width: 1150px; }
    .admin-main h2 { margin-top: 0; color: var(--text); }
    table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 2px rgba(16,32,54,.06); }
    th, td { text-align: left; padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: top; }
    th { background: #eef3ee; font-weight: 700; color: var(--dark); }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid transparent; }
    .btn-primary { background: linear-gradient(120deg, var(--primary), #2cc974); color: #fff; }
    .btn-primary:hover { background: linear-gradient(120deg, var(--primary-dark), var(--primary)); }
    .btn-danger { background: #d6350f; color: #fff; }
    .btn-outline { background: #fff; border-color: var(--border); color: var(--text); }
    form.inline { display: inline; }
    .card { background: var(--card); padding: 22px; border-radius: 16px; box-shadow: 0 1px 2px rgba(16,32,54,.06); max-width: 640px; }
    .field { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
    .field label { font-weight: 600; color: var(--dark); }
    input, select, textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; font: inherit; }
    input:focus, select:focus, textarea:focus { outline: 2px solid var(--primary); outline-offset: 1px; }
    .alert { padding: 11px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
    .alert.success { background: #e4f7e9; color: #196c2e; }
    .alert.error { background: #fdeaea; color: #a3241a; }
    .toolbar { margin-bottom: 16px; }
    .muted { color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<div class="admin-shell">
    <?php if (!$minimal): ?>
    <nav class="admin-nav">
        <div class="admin-brand">
            <img src="../logo-845x295.png" alt="TRU GROUP">
            <span>TRU GROUP<br>Back-office</span>
        </div>
        <?php foreach ($navItems as $file => [$label, $icon]): ?>
            <a href="<?= $file ?>" class="<?= $current === $file ? 'active' : '' ?>"><i class="fa-solid <?= $icon ?>"></i> <?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></a>
        <?php endforeach; ?>
        <div class="logout">
            <span class="muted">Connecté : <?= htmlspecialchars($_SESSION['admin_username'] ?? '', ENT_QUOTES, 'UTF-8') ?></span><br>
            <a href="logout.php"><i class="fa-solid fa-right-from-bracket"></i> Se déconnecter</a>
        </div>
    </nav>
    <?php else: ?>
    <div class="admin-brand" style="padding:24px 0 0 32px;">
        <img src="../logo-845x295.png" alt="TRU GROUP" style="width:56px;">
        <span style="color:var(--dark);">TRU GROUP<br>Back-office</span>
    </div>
    <?php endif; ?>
    <main class="admin-main">
    <?php
}

function admin_foot(): void
{
    ?>
    </main>
</div>
</body>
</html>
    <?php
}
