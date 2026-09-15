<?php

declare(strict_types=1);

/**
 * Copiez ce fichier en config.php et renseignez vos vraies valeurs.
 * config.php est volontairement exclu du dépôt git (voir .gitignore).
 */

const DB_HOST = 'localhost';
const DB_PORT = 3306;
const DB_NAME = 'change_me';
const DB_USER = 'change_me';
const DB_PASS = 'change_me';

const SITE_NAME = 'TRU GROUP';
const SITE_SLOGAN = 'Au cœur de l\'innovation';
const SITE_EMAIL = 'info@trugroup.cm';
const SITE_PHONE = '+237 691 22 71 49';
const SITE_ADDRESS = 'Garoua, Cameroun';

// Chemin discret du back-office (ne pas partager publiquement).
const ADMIN_PATH_SLUG = 'change_me';

// WhatsApp (wapi.mana.cm) - a completer avec vos identifiants reels.
const WAPI_BASE_URL = 'http://wapi.mana.cm';
const WAPI_API_KEY = '';
const WAPI_NOTIFY_NUMBER = '';

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
