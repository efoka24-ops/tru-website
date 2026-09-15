<?php

declare(strict_types=1);

$page = $_GET['page'] ?? 'home';
$allowedPages = ['home', 'about', 'services', 'solutions', 'team', 'projects', 'news', 'formations', 'careers', 'contact'];

if (!in_array($page, $allowedPages, true)) {
    $page = 'home';
}

$pageTitles = [
    'home' => 'Accueil',
    'about' => 'À propos',
    'services' => 'Services',
    'solutions' => 'Solutions',
    'team' => 'Équipe',
    'projects' => 'Projets',
    'news' => 'Actualités',
    'formations' => 'Formations',
    'careers' => 'Carrières',
    'contact' => 'Contact',
];

$currentPage = $page;
$pageTitle = $pageTitles[$page] ?? 'Accueil';

require __DIR__ . '/includes/header.php';
require __DIR__ . '/pages/' . $page . '.php';
require __DIR__ . '/includes/footer.php';
