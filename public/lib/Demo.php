<?php

declare(strict_types=1);

/**
 * Barriere de l'environnement de demonstration.
 *
 * Ce portail reprend l'identite d'Orange Centrafrique sur un domaine qui
 * n'est pas celui d'Orange : il ne doit pas pouvoir etre pris pour le vrai
 * site carrieres. Tant que DEMO_ACCESS_CODE est defini, rien n'est servi
 * (pages, API, fichiers) sans le code d'acces partage, et chaque page porte
 * le bandeau « Environnement de demonstration ».
 */
final class Demo
{
    private const COOKIE = 'rca_demo';

    public static function enabled(): bool
    {
        return Config::get('DEMO_ACCESS_CODE') !== null;
    }

    private static function token(): string
    {
        return hash_hmac('sha256', 'demo-access:' . Config::required('DEMO_ACCESS_CODE'), Config::required('APP_SECRET'));
    }

    public static function granted(): bool
    {
        return !self::enabled() || hash_equals(self::token(), (string) ($_COOKIE[self::COOKIE] ?? ''));
    }

    /** Verifie le code saisi ; pose le cookie d'acces (30 jours) s'il est bon. */
    public static function attempt(string $code): bool
    {
        // Ralentit la devinette du code sans gener un humain.
        usleep(400000);
        if (!hash_equals((string) Config::get('DEMO_ACCESS_CODE'), trim($code))) {
            return false;
        }
        setcookie(self::COOKIE, self::token(), [
            'expires'  => time() + 30 * 86400,
            'path'     => Config::basePath() . '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        return true;
    }

    /** En-tetes communs : jamais d'indexation, jamais d'affichage dans un cadre tiers. */
    public static function headers(): void
    {
        header('X-Robots-Tag: noindex, nofollow, noarchive');
        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: same-origin');
        header_remove('X-Powered-By');
    }
}
