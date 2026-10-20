<?php

declare(strict_types=1);

/**
 * Sessions des candidats et des recruteurs.
 *
 * Session PHP native, cookie limite au chemin du service, HttpOnly, Secure et
 * SameSite=Lax. Deconnexion automatique apres 60 minutes d'inactivite, comme
 * l'annonce le bandeau de la maquette. Les deux espaces sont separes : un
 * recruteur connecte n'est pas un candidat, et inversement.
 */
final class Auth
{
    public const IDLE_SECONDS = 3600;
    private const MAX_FAILS = 5;
    private const LOCK_SECONDS = 900;

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        session_name('rca_sid');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => Config::basePath() . '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        ini_set('session.use_strict_mode', '1');
        ini_set('session.gc_maxlifetime', (string) self::IDLE_SECONDS);
        session_start();

        $last = $_SESSION['last'] ?? null;
        if ($last !== null && time() - (int) $last > self::IDLE_SECONDS) {
            $_SESSION = [];
            session_regenerate_id(true);
            $_SESSION['expired'] = true;
        }
        $_SESSION['last'] = time();
    }

    /** Secondes avant deconnexion pour inactivite. */
    public static function remaining(): int
    {
        return self::IDLE_SECONDS;
    }

    // ─── Mots de passe ──────────────────────────────────────────────────────

    /** Regle affichee dans la maquette : 8 caracteres, une majuscule, un chiffre, un caractere special. */
    public static function strongPassword(string $p): bool
    {
        return strlen($p) >= 8 && strlen($p) <= 128
            && preg_match('/[A-Z]/', $p) && preg_match('/\d/', $p) && preg_match('/[^A-Za-z0-9]/', $p);
    }

    public static function hashPassword(string $p): string
    {
        return password_hash($p, PASSWORD_DEFAULT);
    }

    /**
     * Verifie un mot de passe avec verrouillage progressif : 5 echecs
     * bloquent le compte 15 minutes.
     */
    public static function checkPassword(string $table, array $row, string $password): bool
    {
        if ($row['lockedUntil'] !== null && $row['lockedUntil'] > Db::now()) {
            Http::fail('Trop de tentatives. Reessayez dans quelques minutes.', 423);
        }
        if (password_verify($password, (string) $row['passwordHash'])) {
            Db::update($table, $row['id'], ['failedLogins' => 0, 'lockedUntil' => null, 'lastLoginAt' => Db::now()]);
            return true;
        }
        $fails = (int) $row['failedLogins'] + 1;
        Db::update($table, $row['id'], [
            'failedLogins' => $fails >= self::MAX_FAILS ? 0 : $fails,
            'lockedUntil'  => $fails >= self::MAX_FAILS ? Db::now(self::LOCK_SECONDS) : null,
        ]);
        return false;
    }

    // ─── Candidats ──────────────────────────────────────────────────────────

    public static function loginUser(string $id): void
    {
        session_regenerate_id(true);
        $_SESSION['uid'] = $id;
        unset($_SESSION['expired']);
    }

    public static function userId(): ?string
    {
        return $_SESSION['uid'] ?? null;
    }

    public static function user(): ?array
    {
        $id = self::userId();
        if ($id === null) {
            return null;
        }
        $u = Db::one('SELECT * FROM `rca_users` WHERE `id` = ?', [$id]);
        if ($u === null) {
            unset($_SESSION['uid']);
        }
        return $u;
    }

    public static function requireUser(): array
    {
        $u = self::user();
        if ($u === null) {
            Http::fail(
                !empty($_SESSION['expired']) ? 'Votre session a expire. Reconnectez-vous.' : 'Veuillez vous connecter.',
                401
            );
        }
        return $u;
    }

    // ─── Recruteurs ─────────────────────────────────────────────────────────

    public static function loginRecruiter(string $id): void
    {
        session_regenerate_id(true);
        $_SESSION['rid'] = $id;
    }

    public static function recruiter(): ?array
    {
        $id = $_SESSION['rid'] ?? null;
        if ($id === null) {
            return null;
        }
        $r = Db::one('SELECT * FROM `rca_recruiters` WHERE `id` = ? AND `active` = 1', [$id]);
        if ($r === null) {
            unset($_SESSION['rid']);
        }
        return $r;
    }

    public static function requireRecruiter(bool $admin = false): array
    {
        $r = self::recruiter();
        if ($r === null) {
            Http::fail('Veuillez vous connecter au back-office.', 401);
        }
        if ($admin && $r['role'] !== 'admin') {
            Http::fail('Reserve aux administrateurs.', 403);
        }
        return $r;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_regenerate_id(true);
    }
}
