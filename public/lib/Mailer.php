<?php

declare(strict_types=1);

/**
 * Envoi d'e-mails.
 *
 * SMTP authentifie quand il est configure (SMTP_HOST, SMTP_USER…), sinon
 * mail() de l'hebergeur, que Gmail classe souvent en spam ou rejette sans
 * erreur. Chaque envoi est journalise (rca_mail_log, sans le corps) pour
 * savoir ce qui est reellement parti : c'est la seule facon de repondre a un
 * candidat qui « n'a rien recu ».
 *
 * Le client SMTP reprend celui de KoliGo (verification du certificat,
 * STARTTLS, AUTH LOGIN, corps en base64).
 */
final class Mailer
{
    public static ?string $lastError = null;

    /** @return bool vrai si un serveur a accepte le message (pas une preuve de reception) */
    public static function send(string $to, string $subject, string $bodyHtml, string $kind): bool
    {
        self::$lastError = null;
        $to = self::clean($to);
        if (!filter_var($to, FILTER_VALIDATE_EMAIL) || Config::get('MAIL_DISABLED') === '1') {
            self::$lastError = 'adresse invalide ou envoi desactive';
            self::log($to, $subject, $kind, false, 'none');
            return false;
        }

        $subject = '[Demo] ' . $subject;
        $html = self::layout($bodyHtml);
        $from = (string) Config::get('MAIL_FROM', 'noreply@trugroup.cm');

        if (Config::get('SMTP_HOST') !== null) {
            $ok = self::smtp($to, $subject, $html, $from);
            self::log($to, $subject, $kind, $ok, 'smtp');
            return $ok;
        }

        $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n"
            . 'From: =?UTF-8?B?' . base64_encode('Carrieres RCA (demo)') . "?= <$from>\r\n";
        $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', chunk_split(base64_encode($html)), $headers);
        if (!$ok) {
            self::$lastError = 'mail() a refuse le message';
        }
        self::log($to, $subject, $kind, $ok, 'mail');
        return $ok;
    }

    private static function layout(string $body): string
    {
        return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#333">'
            . '<div style="background:#000;color:#fff;padding:14px 18px;font-weight:bold">'
            . '<span style="background:#FF7900;color:#000;padding:2px 6px;margin-right:8px">orange</span> Carrieres RCA</div>'
            . '<div style="background:#fff3e6;border-left:4px solid #FF7900;padding:8px 12px;font-size:12px">'
            . 'Environnement de demonstration : ce message ne provient pas du site officiel d\'Orange Centrafrique.</div>'
            . '<div style="padding:18px;line-height:1.5">' . $body . '</div></div>';
    }

    private static function log(string $to, string $subject, string $kind, bool $ok, string $via): void
    {
        try {
            Db::insert('rca_mail_log', [
                'recipient' => mb_substr($to, 0, 190),
                'subject'   => mb_substr($subject, 0, 190),
                'kind'      => mb_substr($kind, 0, 30),
                'ok'        => $ok ? 1 : 0,
                'via'       => $via,
                'error'     => self::$lastError === null ? null : mb_substr(self::$lastError, 0, 255),
            ]);
        } catch (Throwable $e) {
            error_log('[mail] journal : ' . $e->getMessage());
        }
    }

    private static function clean(string $v): string
    {
        return trim(str_replace(["\r", "\n", "\0"], '', $v));
    }

    private static function smtp(string $to, string $subject, string $html, string $from): bool
    {
        $host   = self::clean((string) Config::get('SMTP_HOST', ''));
        $port   = Config::int('SMTP_PORT', 587);
        $secure = strtolower((string) Config::get('SMTP_SECURE', $port === 465 ? 'ssl' : 'tls'));
        $user   = (string) Config::get('SMTP_USER', '');
        $pass   = (string) Config::get('SMTP_PASS', '');

        $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true, 'peer_name' => $host]]);
        $errno = 0;
        $errstr = '';
        $fp = @stream_socket_client(($secure === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
        if (!$fp) {
            self::$lastError = "connexion impossible a $host:$port ($errstr)";
            return false;
        }
        stream_set_timeout($fp, 15);

        try {
            self::expect($fp, [220]);
            $ehlo = substr($from, (int) strrpos($from, '@') + 1) ?: 'localhost';
            self::cmd($fp, "EHLO $ehlo", [250]);
            if ($secure === 'tls') {
                self::cmd($fp, 'STARTTLS', [220]);
                if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new RuntimeException('echec du chiffrement STARTTLS');
                }
                self::cmd($fp, "EHLO $ehlo", [250]);
            }
            if ($user !== '') {
                self::cmd($fp, 'AUTH LOGIN', [334]);
                self::cmd($fp, base64_encode($user), [334]);
                self::cmd($fp, base64_encode($pass), [235]);
            }
            self::cmd($fp, "MAIL FROM:<$from>", [250]);
            self::cmd($fp, "RCPT TO:<$to>", [250, 251]);
            self::cmd($fp, 'DATA', [354]);
            $headers = [
                'Date: ' . gmdate('D, d M Y H:i:s') . ' +0000',
                'From: =?UTF-8?B?' . base64_encode('Carrieres RCA (demo)') . "?= <$from>",
                "To: <$to>",
                'Subject: =?UTF-8?B?' . base64_encode(self::clean($subject)) . '?=',
                'Message-ID: <' . bin2hex(random_bytes(12)) . "@$ehlo>",
                'MIME-Version: 1.0',
                'Auto-Submitted: auto-generated',
                'Content-Type: text/html; charset=UTF-8',
                'Content-Transfer-Encoding: base64',
            ];
            fwrite($fp, implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($html), 76, "\r\n") . "\r\n.\r\n");
            self::expect($fp, [250]);
            @fwrite($fp, "QUIT\r\n");
            fclose($fp);
            return true;
        } catch (Throwable $e) {
            self::$lastError = $e->getMessage();
            @fclose($fp);
            return false;
        }
    }

    private static function cmd($fp, string $line, array $ok): void
    {
        fwrite($fp, $line . "\r\n");
        self::expect($fp, $ok);
    }

    private static function expect($fp, array $ok): void
    {
        $resp = '';
        while (($line = fgets($fp, 1024)) !== false) {
            $resp .= $line;
            if (strlen($line) < 4 || $line[3] !== '-') {
                break;
            }
        }
        if (!in_array((int) substr($resp, 0, 3), $ok, true)) {
            throw new RuntimeException('reponse SMTP inattendue : ' . trim(strtok($resp, "\n") ?: 'aucune reponse'));
        }
    }
}
