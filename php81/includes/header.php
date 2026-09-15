<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$currentPage = $currentPage ?? 'home';
$pageTitle = $pageTitle ?? SITE_NAME;

$navItems = [
    'home' => 'Accueil',
    'about' => 'À propos',
    'services' => 'Services',
    'solutions' => 'Solutions',
    'team' => 'Équipe',
    'formations' => 'Formations',
    'news' => 'Actualités',
    'careers' => 'Carrières',
    'contact' => 'Contact',
];
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($pageTitle) ?> - <?= e(SITE_NAME) ?></title>
    <meta name="description" content="TRU GROUP - Conseil, transformation digitale, formations, actualités et solutions innovantes au Cameroun.">
    <meta property="og:title" content="<?= e($pageTitle) ?> - <?= e(SITE_NAME) ?>">
    <meta property="og:description" content="TRU GROUP - Conseil et ingénierie digitale en Afrique.">
    <meta property="og:type" content="website">
    <link rel="icon" type="image/png" href="/logo-845x295.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header class="site-header">
    <div class="container nav-wrap">
        <a class="brand" href="index.php?page=home" aria-label="Accueil TRU GROUP">
            <img src="/logo-845x295.png" alt="TRU GROUP">
        </a>

        <nav class="nav-main" aria-label="Navigation principale">
            <?php foreach ($navItems as $slug => $label): ?>
                <a href="index.php?page=<?= e($slug) ?>" class="<?= $currentPage === $slug ? 'active' : '' ?>"><?= e($label) ?></a>
            <?php endforeach; ?>
        </nav>

        <div class="header-actions">
            <a class="btn btn-primary" href="index.php?page=contact">Nous contacter</a>
        </div>
    </div>
</header>
<main>
