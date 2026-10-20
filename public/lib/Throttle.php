<?php

declare(strict_types=1);

/**
 * Freine les actions qui envoient des messages a des tiers (« envoyer a un
 * ami », oublis, inscription) : sans cela, le portail servirait de relais de
 * spam.
 */
final class Throttle
{
    public static function hit(string $action, int $max, int $windowSeconds): void
    {
        $ip = mb_substr(Http::clientIp(), 0, 45);
        $count = (int) Db::value(
            'SELECT COUNT(*) FROM `rca_throttle` WHERE `action` = ? AND `ip` = ? AND `createdAt` >= ?',
            [$action, $ip, Db::now(-$windowSeconds)]
        );
        if ($count >= $max) {
            Http::fail('Trop de demandes. Reessayez plus tard.', 429);
        }
        Db::insert('rca_throttle', ['action' => $action, 'ip' => $ip]);
        if (random_int(1, 200) === 1) {
            Db::run('DELETE FROM `rca_throttle` WHERE `createdAt` < ?', [Db::now(-86400)]);
        }
    }
}
