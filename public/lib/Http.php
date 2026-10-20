<?php

declare(strict_types=1);

/**
 * Entree et sortie HTTP de l'API JSON.
 *
 * Succes : l'objet lui-meme. Erreur : `{ "error": { "code", "message" } }`,
 * comme les autres services TRU GROUP (teeeotp, apisungku).
 */
final class Http
{
    private static ?array $body = null;

    public static function body(): array
    {
        if (self::$body !== null) {
            return self::$body;
        }
        $raw = file_get_contents('php://input');
        $decoded = ($raw === false || $raw === '') ? [] : json_decode($raw, true);
        return self::$body = is_array($decoded) ? $decoded : [];
    }

    public static function input(string $key, mixed $default = null): mixed
    {
        $body = self::body();
        return array_key_exists($key, $body) ? $body[$key] : $default;
    }

    /** Champ texte nettoye ; '' si absent ou non scalaire. */
    public static function str(string $key, int $max = 255): string
    {
        $v = self::input($key, '');
        return is_scalar($v) ? mb_substr(trim((string) $v), 0, $max) : '';
    }

    public static function json(mixed $payload, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function ok(mixed $data = ['ok' => true], int $status = 200): never
    {
        self::json($data, $status);
    }

    public static function fail(string $message, int $status = 400, ?string $code = null, array $extra = []): never
    {
        self::json(['error' => ['code' => $code ?? self::codeFor($status), 'message' => $message] + $extra], $status);
    }

    private static function codeFor(int $status): string
    {
        return match ($status) {
            400 => 'INVALID_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            409 => 'CONFLICT',
            413 => 'TOO_LARGE',
            423 => 'LOCKED',
            429 => 'TOO_MANY_REQUESTS',
            503 => 'SERVICE_UNAVAILABLE',
            default => 'INTERNAL_ERROR',
        };
    }

    public static function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $value = $_SERVER[$key] ?? null;
        return ($value === null || $value === '') ? null : (string) $value;
    }

    public static function method(): string
    {
        return strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    }

    public static function clientIp(): string
    {
        return (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    }

    /**
     * Protection CSRF : toute ecriture doit porter l'en-tete X-Requested-With,
     * qu'un formulaire d'un autre site ne peut pas ajouter sans une requete
     * preliminaire CORS, que ce service n'autorise jamais.
     */
    public static function requireAjax(): void
    {
        if (self::method() !== 'GET' && self::header('X-Requested-With') !== 'fetch') {
            self::fail('Requete refusee.', 403, 'CSRF');
        }
    }
}
