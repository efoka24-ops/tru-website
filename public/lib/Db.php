<?php

declare(strict_types=1);

/**
 * Acces MySQL : instructions preparees non emulees, session en UTC,
 * horodatages DATETIME(3).
 */
final class Db
{
    /** Tables portant une colonne `updatedAt`. */
    private const HORODATEES = ['rca_users', 'rca_jobs', 'rca_applications', 'rca_recruiters', 'rca_saved_searches'];

    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }
        $cfg = Config::db();
        try {
            self::$pdo = new PDO(
                sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $cfg['host'], $cfg['port'], $cfg['name']),
                (string) $cfg['user'],
                (string) $cfg['pass'],
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
            self::$pdo->exec("SET time_zone = '+00:00'");
        } catch (PDOException $e) {
            error_log('[db] connexion impossible : ' . $e->getMessage());
            Http::fail('Service temporairement indisponible.', 503);
        }
        return self::$pdo;
    }

    public static function run(string $sql, array $params = []): PDOStatement
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function one(string $sql, array $params = []): ?array
    {
        $row = self::run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    /** @return list<array<string, mixed>> */
    public static function all(string $sql, array $params = []): array
    {
        return self::run($sql, $params)->fetchAll();
    }

    public static function value(string $sql, array $params = []): mixed
    {
        $value = self::run($sql, $params)->fetchColumn();
        return $value === false ? null : $value;
    }

    public static function insert(string $table, array $data): string
    {
        $data['id'] ??= Id::uuid();
        $now = self::now();
        $data['createdAt'] ??= $now;
        if (in_array($table, self::HORODATEES, true)) {
            $data['updatedAt'] ??= $now;
        }
        $columns = array_keys($data);
        self::run(sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s)',
            $table,
            '`' . implode('`, `', $columns) . '`',
            implode(', ', array_map(static fn (string $c): string => ':' . $c, $columns))
        ), $data);
        return (string) $data['id'];
    }

    public static function update(string $table, string $id, array $data): void
    {
        if ($data === []) {
            return;
        }
        if (in_array($table, self::HORODATEES, true)) {
            $data['updatedAt'] = self::now();
        }
        $sets = implode(', ', array_map(static fn (string $c): string => "`$c` = :$c", array_keys($data)));
        $data['__id'] = $id;
        self::run("UPDATE `$table` SET $sets WHERE `id` = :__id", $data);
    }

    public static function transaction(callable $work): mixed
    {
        $pdo = self::pdo();
        if ($pdo->inTransaction()) {
            return $work();
        }
        $pdo->beginTransaction();
        try {
            $result = $work();
            $pdo->commit();
            return $result;
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public static function now(?int $offsetSeconds = null): string
    {
        $moment = new DateTimeImmutable('now', new DateTimeZone('UTC'));
        if ($offsetSeconds !== null) {
            $moment = $moment->modify(sprintf('%+d seconds', $offsetSeconds));
        }
        return $moment->format('Y-m-d H:i:s.v');
    }

    public static function iso(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return null;
        }
        $moment = DateTimeImmutable::createFromFormat('Y-m-d H:i:s.u', $stored, new DateTimeZone('UTC'))
            ?: DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $stored, new DateTimeZone('UTC'))
            ?: DateTimeImmutable::createFromFormat('Y-m-d', $stored, new DateTimeZone('UTC'));
        return $moment === false ? null : $moment->format('Y-m-d\TH:i:s.v\Z');
    }

    /** JSON stocke -> tableau, jamais d'exception sur une colonne vide ou abimee. */
    public static function json(?string $value): array
    {
        $decoded = $value === null || $value === '' ? [] : json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }
}
