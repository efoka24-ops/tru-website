<?php

declare(strict_types=1);

/**
 * Pieces jointes des candidatures.
 *
 * Stockees hors de public_html sous un nom aleatoire, jamais sous le nom
 * fourni par le candidat. Le type est controle sur le contenu reel du
 * fichier (finfo), pas sur l'extension ni sur ce que declare le navigateur.
 */
final class Uploads
{
    public const MAX_BYTES = 5 * 1024 * 1024;

    private const TYPES = [
        'pdf'  => ['application/pdf'],
        'doc'  => ['application/msword', 'application/vnd.ms-office', 'application/octet-stream'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png'  => ['image/png'],
    ];

    /** @return array{storedName: string, originalName: string, mime: string, size: int} */
    public static function store(array $file, array $allowedExt): array
    {
        if (!isset($file['error']) || is_array($file['error'])) {
            Http::fail('Fichier invalide.', 400);
        }
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || (int) $file['size'] > self::MAX_BYTES) {
            Http::fail('Fichier trop volumineux (5 Mo maximum).', 413);
        }
        if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file((string) $file['tmp_name'])) {
            Http::fail('Le televersement a echoue. Reessayez.', 400);
        }

        $original = mb_substr(basename(str_replace('\\', '/', (string) $file['name'])), 0, 180);
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true) || !isset(self::TYPES[$ext])) {
            Http::fail('Format non accepte (' . implode(', ', array_map('strtoupper', $allowedExt)) . ').', 400);
        }
        $mime = (string) (new finfo(FILEINFO_MIME_TYPE))->file((string) $file['tmp_name']);
        if (!in_array($mime, self::TYPES[$ext], true)) {
            Http::fail('Le contenu du fichier ne correspond pas a son extension.', 400);
        }

        $dir = Config::dataDir() . '/uploads';
        if (!is_dir($dir) && !mkdir($dir, 0750, true) && !is_dir($dir)) {
            error_log('[uploads] dossier impossible a creer : ' . $dir);
            Http::fail('Stockage indisponible.', 503);
        }
        $stored = bin2hex(random_bytes(16)) . '.' . $ext;
        if (!move_uploaded_file((string) $file['tmp_name'], "$dir/$stored")) {
            Http::fail('Stockage indisponible.', 503);
        }

        return ['storedName' => $stored, 'originalName' => $original, 'mime' => $mime, 'size' => (int) $file['size']];
    }

    public static function path(string $storedName): string
    {
        return Config::dataDir() . '/uploads/' . basename($storedName);
    }

    public static function delete(string $storedName): void
    {
        $p = self::path($storedName);
        if (is_file($p)) {
            @unlink($p);
        }
    }

    public static function stream(array $att): never
    {
        $p = self::path((string) $att['storedName']);
        if (!is_file($p)) {
            Http::fail('Fichier introuvable.', 404);
        }
        header('Content-Type: ' . $att['mime']);
        header('Content-Length: ' . filesize($p));
        header('Content-Disposition: attachment; filename="' . str_replace(['"', "\r", "\n"], '', Text::ascii((string) $att['originalName'])) . '"');
        header('Cache-Control: private, no-store');
        header('X-Content-Type-Options: nosniff');
        readfile($p);
        exit;
    }
}
