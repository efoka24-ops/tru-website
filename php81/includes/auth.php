<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function admin_session_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params([
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => (($_SERVER['HTTPS'] ?? '') !== '') || (($_SERVER['SERVER_PORT'] ?? '') === '443'),
        ]);
        session_name('tru_admin_session');
        session_start();
    }
}

function admin_is_logged_in(): bool
{
    admin_session_start();
    return !empty($_SESSION['admin_id']);
}

function admin_require_login(string $basePath): void
{
    if (!admin_is_logged_in()) {
        header('Location: ' . $basePath . '/login.php');
        exit;
    }
}

function admin_attempt_login(string $username, string $password): bool
{
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, password_hash FROM admin_users WHERE username = :u LIMIT 1');
    $stmt->execute([':u' => $username]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($password, $row['password_hash'])) {
        return false;
    }

    admin_session_start();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$row['id'];
    $_SESSION['admin_username'] = $username;

    $upd = $pdo->prepare('UPDATE admin_users SET last_login_at = NOW() WHERE id = :id');
    $upd->execute([':id' => $row['id']]);

    return true;
}

function admin_logout(): void
{
    admin_session_start();
    $_SESSION = [];
    session_destroy();
}

function admin_csrf_token(): string
{
    admin_session_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function admin_csrf_check(): bool
{
    admin_session_start();
    $token = $_POST['csrf_token'] ?? '';
    return is_string($token) && hash_equals($_SESSION['csrf_token'] ?? '', $token);
}
