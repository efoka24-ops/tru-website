<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';

const ADMIN_BASE = '.';

function admin_head(string $title): void
{
    ?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?> — Back-office TRU GROUP</title>
<style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, Segoe UI, Manrope, sans-serif; background: #f4f5f7; color: #1c1f26; }
    a { color: #0f5fd6; }
    .admin-shell { display: flex; min-height: 100vh; }
    .admin-nav { width: 220px; background: #11151c; color: #cfd6e4; padding: 20px 14px; flex-shrink: 0; }
    .admin-nav h1 { font-size: 15px; color: #fff; margin: 0 0 18px; }
    .admin-nav a { display: block; padding: 9px 10px; border-radius: 6px; color: #cfd6e4; text-decoration: none; font-size: 14px; margin-bottom: 2px; }
    .admin-nav a:hover, .admin-nav a.active { background: #232a37; color: #fff; }
    .admin-nav .logout { margin-top: 20px; border-top: 1px solid #232a37; padding-top: 14px; }
    .admin-main { flex: 1; padding: 28px 34px; max-width: 1100px; }
    .admin-main h2 { margin-top: 0; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #edf0f4; font-size: 14px; vertical-align: top; }
    th { background: #eef1f6; font-weight: 600; }
    .btn { display: inline-block; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-size: 13px; cursor: pointer; border: none; }
    .btn-primary { background: #0f5fd6; color: #fff; }
    .btn-danger { background: #d6350f; color: #fff; }
    .btn-outline { background: #fff; border: 1px solid #ccd3de; color: #1c1f26; }
    form.inline { display: inline; }
    .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.06); max-width: 640px; }
    .field { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
    input, select, textarea { padding: 8px 10px; border: 1px solid #ccd3de; border-radius: 6px; font: inherit; }
    .alert { padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
    .alert.success { background: #e4f7e9; color: #196c2e; }
    .alert.error { background: #fdeaea; color: #a3241a; }
    .toolbar { margin-bottom: 16px; }
    .muted { color: #6b7280; font-size: 13px; }
</style>
</head>
<body>
<div class="admin-shell">
    <nav class="admin-nav">
        <h1>TRU GROUP — Gestion</h1>
        <a href="index.php">Tableau de bord</a>
        <a href="services.php">Services</a>
        <a href="solutions.php">Solutions</a>
        <a href="team.php">Équipe</a>
        <a href="news.php">Actualités</a>
        <a href="formations.php">Formations</a>
        <a href="jobs.php">Offres d'emploi</a>
        <a href="applications.php">Candidatures</a>
        <a href="messages.php">Messages de contact</a>
        <div class="logout">
            <span class="muted">Connecté : <?= htmlspecialchars($_SESSION['admin_username'] ?? '', ENT_QUOTES, 'UTF-8') ?></span><br>
            <a href="logout.php">Se déconnecter</a>
        </div>
    </nav>
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
