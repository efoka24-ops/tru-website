<?php

declare(strict_types=1);

/**
 * Carrieres RCA (demonstration) — controleur frontal.
 *
 * Portail candidat et back-office recruteur, servis depuis
 * https://trugroup.cm/carrieres-rca/. Tout passe par ce fichier : la
 * barriere de demonstration s'applique donc aux pages, a l'API et aux
 * fichiers sans exception.
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

foreach (['Http', 'Config', 'Id', 'Db', 'Router', 'Text', 'Auth', 'Demo', 'Mailer', 'TeeeOtpClient', 'Sms', 'Codes', 'Uploads', 'Throttle', 'Jobs'] as $lib) {
    require __DIR__ . "/lib/$lib.php";
}

Config::boot(__DIR__);
date_default_timezone_set('UTC');
Demo::headers();

$path = trim((string) ($_GET['__path'] ?? ''), '/');

// /admin/ et /admin servent la meme page, mais ses liens relatifs (api/…,
// files/…) ne se resolvent correctement que sans la barre finale.
if ($path === 'admin' && str_ends_with((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH), '/')) {
    header('Location: ' . Config::basePath() . '/admin', true, 301);
    exit;
}

if ($path === 'robots.txt') {
    header('Content-Type: text/plain');
    echo "User-agent: *\nDisallow: /\n";
    exit;
}

// ─── Barriere de demonstration ──────────────────────────────────────────────
if ($path === 'acces' && Http::method() === 'POST') {
    $ok = Demo::attempt((string) ($_POST['code'] ?? ''));
    $next = ($_POST['next'] ?? '') === 'admin' ? 'admin' : '';
    header('Location: ' . Config::basePath() . '/' . $next . ($ok ? '' : '?code=invalide'), true, 303);
    exit;
}
if (!Demo::granted()) {
    if (str_starts_with($path, 'api/')) {
        Http::fail('Environnement de demonstration : code d\'acces requis.', 403, 'DEMO_LOCKED');
    }
    http_response_code(401);
    header('Content-Type: text/html; charset=utf-8');
    require __DIR__ . '/views/gate.php';
    exit;
}

Auth::start();

// ─── Pages ──────────────────────────────────────────────────────────────────
$page = static function (string $file): never {
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    readfile(__DIR__ . "/views/$file");
    exit;
};
if ($path === '' || $path === 'index.html') {
    $page('app.html');
}
if ($path === 'admin') {
    $page('admin.html');
}

// ─── Pieces jointes : au candidat proprietaire ou a un recruteur ───────────
if (preg_match('#^files/([0-9a-f-]{36})$#', $path, $m) === 1) {
    $att = Db::one(
        'SELECT a.*, p.`userId` FROM `rca_attachments` a JOIN `rca_applications` p ON p.`id` = a.`applicationId` WHERE a.`id` = ?',
        [$m[1]]
    );
    if ($att === null || (Auth::recruiter() === null && Auth::userId() !== $att['userId'])) {
        Http::fail('Fichier introuvable.', 404);
    }
    Uploads::stream($att);
}

// ─── API ────────────────────────────────────────────────────────────────────
if (!str_starts_with($path, 'api/')) {
    Http::fail('Page introuvable.', 404);
}
Http::requireAjax();

$router = new Router();
foreach (['jobs', 'auth', 'account', 'applications', 'admin'] as $group) {
    (require __DIR__ . "/routes/$group.php")($router);
}

try {
    $router->dispatch(Http::method(), '/' . $path);
} catch (Throwable $e) {
    error_log('[carrieres-rca] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    Http::fail('Une erreur inattendue est survenue.', 500);
}
