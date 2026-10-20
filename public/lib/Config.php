<?php

declare(strict_types=1);

/**
 * Configuration lue depuis `/home/<compte>/carrieres-rca.env`, deux niveaux
 * au-dessus du service (hors de public_html), avec repli sur `<service>/.env`
 * protege par le .htaccess.
 */
final class Config
{
    /** @var array<string, string> */
    private static array $env = [];
    private static string $dir = '';

    public static function boot(string $serviceDir): void
    {
        self::$dir = $serviceDir;
        foreach ([dirname($serviceDir, 2) . '/carrieres-rca.env', $serviceDir . '/.env'] as $path) {
            if (is_readable($path)) {
                self::$env = self::parse($path);
                return;
            }
        }
        error_log('[config] aucun fichier d environnement lisible');
    }

    /** @return array<string, string> */
    private static function parse(string $path): array
    {
        $env = [];
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $value = trim($value);
            if (strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[-1] === $value[0]) {
                $value = substr($value, 1, -1);
            }
            $env[trim($key)] = $value;
        }
        return $env;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = self::$env[$key] ?? null;
        return ($value === null || $value === '') ? $default : $value;
    }

    public static function int(string $key, int $default): int
    {
        $value = self::get($key);
        return $value === null ? $default : (int) $value;
    }

    public static function required(string $key): string
    {
        $value = self::get($key);
        if ($value === null) {
            error_log("[config] variable obligatoire absente : $key");
            Http::fail('Service mal configure.', 500, 'MISCONFIGURED');
        }
        return $value;
    }

    public static function db(): array
    {
        return [
            'host' => self::get('DB_HOST', 'localhost'),
            'port' => self::int('DB_PORT', 3306),
            'name' => self::get('DB_NAME', ''),
            'user' => self::get('DB_USER', ''),
            'pass' => self::get('DB_PASS', ''),
        ];
    }

    public static function publicUrl(): string
    {
        return rtrim((string) self::get('PUBLIC_URL', 'https://trugroup.cm/carrieres-rca'), '/');
    }

    /** Chemin URL du service (« /carrieres-rca »), pour les cookies. */
    public static function basePath(): string
    {
        return rtrim((string) (parse_url(self::publicUrl(), PHP_URL_PATH) ?: '/'), '/') ?: '/';
    }

    /**
     * Dossier des pieces jointes, hors de public_html : un CV ne doit jamais
     * etre servi directement par Apache, seulement par /files/{id} apres
     * controle des droits.
     */
    public static function dataDir(): string
    {
        return rtrim((string) self::get('DATA_DIR', dirname(self::$dir, 2) . '/carrieres-rca-data'), '/');
    }
}
