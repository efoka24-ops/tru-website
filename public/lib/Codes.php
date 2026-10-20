<?php

declare(strict_types=1);

/**
 * Codes a usage unique du portail : verification du telephone et
 * reinitialisation du mot de passe.
 *
 * Par SMS, le code vient de teeeotp, qui le verifie aussi (on ne garde que
 * son requestId). Par e-mail, le code est genere ici et stocke en HMAC.
 * Dans les deux cas : 10 minutes de validite, 5 essais.
 */
final class Codes
{
    private const TTL = 600;
    private const ATTEMPTS = 5;

    /**
     * @return array{id: string, channel: string}
     * @throws TeeeOtpException si le SMS est refuse
     */
    public static function issue(string $purpose, string $userId, string $channel, string $target): array
    {
        // Une seule demande active par usage et par compte.
        Db::run('UPDATE `rca_codes` SET `usedAt` = ? WHERE `userId` = ? AND `purpose` = ? AND `usedAt` IS NULL', [Db::now(), $userId, $purpose]);

        $data = [
            'userId'       => $userId,
            'purpose'      => $purpose,
            'channel'      => $channel,
            'target'       => $target,
            'attemptsLeft' => self::ATTEMPTS,
            'expiresAt'    => Db::now(self::TTL),
        ];

        if ($channel === 'sms') {
            $data['otpRequestId'] = Sms::sendCode($target, $purpose === 'reset_password' ? 'reset' : 'verify-phone');
        } else {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $data['codeHash'] = self::hash($code);
            $label = $purpose === 'reset_password' ? 'reinitialiser votre mot de passe' : 'verifier votre adresse';
            Mailer::send(
                $target,
                'Votre code de verification',
                '<p>Votre code pour ' . $label . ' :</p><p style="font-size:28px;letter-spacing:6px;font-weight:bold">' . $code . '</p>'
                . '<p>Il est valable 10 minutes. Si vous n\'etes pas a l\'origine de cette demande, ignorez ce message.</p>',
                $purpose
            );
        }

        return ['id' => Db::insert('rca_codes', $data), 'channel' => $channel];
    }

    /**
     * Verifie un code ; le consomme s'il est bon.
     *
     * @return array{ok: bool, userId?: string, target?: string, message?: string}
     */
    public static function check(string $id, string $purpose, string $code): array
    {
        $row = Db::one('SELECT * FROM `rca_codes` WHERE `id` = ? AND `purpose` = ?', [$id, $purpose]);
        if ($row === null || $row['usedAt'] !== null || $row['expiresAt'] < Db::now() || (int) $row['attemptsLeft'] <= 0) {
            return ['ok' => false, 'message' => 'Code expire ou invalide. Demandez-en un nouveau.'];
        }

        $code = preg_replace('/\D+/', '', $code) ?? '';
        if ($row['channel'] === 'sms') {
            $r = Sms::verifyCode((string) $row['otpRequestId'], $code);
            $valid = !empty($r['valid']);
        } else {
            $valid = $code !== '' && hash_equals((string) $row['codeHash'], self::hash($code));
        }

        if (!$valid) {
            $left = (int) $row['attemptsLeft'] - 1;
            Db::run('UPDATE `rca_codes` SET `attemptsLeft` = ? WHERE `id` = ?', [$left, $id]);
            return ['ok' => false, 'message' => $left > 0 ? "Code incorrect. Il vous reste $left essai(s)." : 'Trop d\'essais. Demandez un nouveau code.'];
        }

        Db::run('UPDATE `rca_codes` SET `usedAt` = ? WHERE `id` = ?', [Db::now(), $id]);
        return ['ok' => true, 'userId' => (string) $row['userId'], 'target' => (string) $row['target']];
    }

    private static function hash(string $code): string
    {
        return hash_hmac('sha256', $code, Config::required('APP_SECRET'));
    }
}
