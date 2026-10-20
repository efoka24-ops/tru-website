<?php

declare(strict_types=1);

/** Petites aides de texte et de validation partagees par les routes. */
final class Text
{
    public static function ascii(string $text): string
    {
        $converted = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        return preg_replace('/[^\x20-\x7E\n]/', '', $converted === false ? $text : $converted) ?? '';
    }

    public static function e(?string $v): string
    {
        return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
    }

    public static function email(string $v): ?string
    {
        $v = trim($v);
        return filter_var($v, FILTER_VALIDATE_EMAIL) !== false && strlen($v) <= 190 ? strtolower($v) : null;
    }

    public static function username(string $v): ?string
    {
        $v = trim($v);
        return preg_match('/^[A-Za-z0-9._-]{3,40}$/', $v) === 1 ? $v : null;
    }

    public static function phone(string $v): ?string
    {
        $v = trim($v);
        return $v === '' || preg_match('/^\+?[0-9 ().-]{8,25}$/', $v) === 1 ? $v : null;
    }

    /** Masque une adresse : j***@exemple.cf */
    public static function maskEmail(string $email): string
    {
        return preg_replace('/^(.).*(@.*)$/', '$1***$2', $email) ?? $email;
    }
}
