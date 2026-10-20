<?php

declare(strict_types=1);

/**
 * SMS par la passerelle teeeotp (TRU GROUP).
 *
 * Les codes sont generes ET verifies par teeeotp : le portail ne garde que le
 * requestId. teeeotp n'envoie qu'aux mobiles camerounais ; les numeros
 * centrafricains (+236) passent donc par l'e-mail.
 */
final class Sms
{
    public static function configured(): bool
    {
        return Config::get('TEEEOTP_API_KEY') !== null;
    }

    /** +2376XXXXXXXX si le numero est un mobile camerounais, sinon null. */
    public static function cameroon(?string $phone): ?string
    {
        $d = preg_replace('/\D+/', '', (string) $phone) ?? '';
        if (str_starts_with($d, '00')) {
            $d = substr($d, 2);
        }
        if (strlen($d) === 9 && $d[0] === '6') {
            $d = '237' . $d;
        }
        return preg_match('/^2376\d{8}$/', $d) ? '+' . $d : null;
    }

    private static function client(): TeeeOtpClient
    {
        return new TeeeOtpClient(
            (string) Config::get('TEEEOTP_BASE_URL', 'https://trugroup.cm/teeeotp'),
            (string) Config::required('TEEEOTP_API_KEY'),
            8
        );
    }

    /** @return string requestId teeeotp @throws TeeeOtpException */
    public static function sendCode(string $phone, string $purpose): string
    {
        return (string) self::client()->sendOtp($phone, $purpose)['requestId'];
    }

    /** @return array{valid: bool, reason?: string, attemptsLeft?: int} */
    public static function verifyCode(string $requestId, string $code): array
    {
        try {
            return self::client()->verifyOtp($requestId, $code);
        } catch (TeeeOtpException $e) {
            error_log('[sms] verification : ' . $e->errorCode);
            return ['valid' => false, 'reason' => 'unavailable'];
        }
    }

    /** Notification best-effort : un echec n'interrompt jamais l'action metier. */
    public static function notify(?string $phone, string $text): bool
    {
        $to = self::cameroon($phone);
        if ($to === null || !self::configured()) {
            return false;
        }
        try {
            self::client()->sendSms($to, Text::ascii($text));
            return true;
        } catch (TeeeOtpException $e) {
            error_log('[sms] notification : ' . $e->errorCode);
            return false;
        }
    }

    /** Message lisible pour le candidat a partir d'une erreur teeeotp. */
    public static function explain(TeeeOtpException $e): string
    {
        return match ($e->errorCode) {
            'TOO_MANY_REQUESTS' => 'Trop de codes demandes pour ce numero. Reessayez dans quelques minutes.',
            'INVALID_PHONE'     => 'Ce numero ne peut pas recevoir de SMS (mobiles camerounais uniquement pendant la demonstration).',
            'QUOTA_EXCEEDED'    => 'Le service SMS a atteint sa limite du jour. Utilisez l\'e-mail.',
            default             => 'Le service SMS est momentanement indisponible. Utilisez l\'e-mail.',
        };
    }
}
