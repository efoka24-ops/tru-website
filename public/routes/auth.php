<?php

declare(strict_types=1);

/** Comptes candidats : inscription, connexion, oublis. */

return static function (Router $r): void {

    $publicUser = static fn (array $u): array => [
        'username'      => $u['username'],
        'email'         => $u['email'],
        'phone'         => $u['phone'],
        'phoneVerified' => $u['phoneVerifiedAt'] !== null,
        // Le SMS n'est propose que pour un mobile camerounais (limite de teeeotp).
        'smsEligible'   => Sms::configured() && Sms::cameroon($u['phone']) !== null,
        'lang'          => $u['lang'],
        'alerts'        => (int) $u['alertsOptIn'] === 1,
        'marketing'     => (int) $u['marketingOptIn'] === 1,
        'privacyAcceptedAt' => Db::iso($u['privacyAcceptedAt']),
    ];

    // ─── Etat de la session (appele au chargement de chaque page) ────────────
    $r->get('/api/session', static function () use ($publicUser): void {
        $u = Auth::user();
        Http::ok([
            'user'          => $u === null ? null : $publicUser($u),
            'cartCount'     => $u === null ? 0 : (int) Db::value('SELECT COUNT(*) FROM `rca_cart` WHERE `userId` = ?', [$u['id']]),
            'idleSeconds'   => Auth::IDLE_SECONDS,
            'expired'       => $u === null && !empty($_SESSION['expired']),
        ]);
    });

    // ─── Inscription ─────────────────────────────────────────────────────────
    $r->post('/api/auth/register', static function () use ($publicUser): void {
        if (Http::input('privacyAccepted') !== true) {
            Http::fail("Vous devez accepter l'accord de confidentialite.", 400);
        }
        $username = Text::username(Http::str('username', 60));
        if ($username === null) {
            Http::fail("Nom d'utilisateur : 3 a 40 caracteres (lettres, chiffres, point, tiret, souligne).", 400);
        }
        $email = Text::email(Http::str('email', 190));
        if ($email === null) {
            Http::fail('Adresse electronique invalide.', 400);
        }
        $phone = Text::phone(Http::str('phone', 30));
        if ($phone === null) {
            Http::fail('Numero de telephone invalide.', 400);
        }
        $password = (string) Http::input('password', '');
        if (!Auth::strongPassword($password)) {
            Http::fail('Le mot de passe doit comporter au moins 8 caracteres, dont une majuscule, un chiffre et un caractere special.', 400);
        }
        Throttle::hit('register', 10, 3600);

        if (Db::one('SELECT `id` FROM `rca_users` WHERE `username` = ?', [$username]) !== null) {
            Http::fail("Ce nom d'utilisateur est deja pris.", 409, 'USERNAME_TAKEN');
        }
        if (Db::one('SELECT `id` FROM `rca_users` WHERE `email` = ?', [$email]) !== null) {
            Http::fail('Un compte existe deja avec cette adresse. Utilisez « Nom d\'utilisateur oublie ».', 409, 'EMAIL_TAKEN');
        }

        $id = Db::insert('rca_users', [
            'username'          => $username,
            'email'             => $email,
            'phone'             => $phone === '' ? null : $phone,
            'passwordHash'      => Auth::hashPassword($password),
            'privacyAcceptedAt' => Db::now(),
            'profile'           => json_encode(['em' => $email, 'ph' => $phone], JSON_UNESCAPED_UNICODE),
        ]);
        Auth::loginUser($id);

        Mailer::send(
            $email,
            'Bienvenue sur Carrieres RCA',
            '<p>Bonjour,</p><p>Votre compte candidat <b>' . Text::e($username) . '</b> a ete cree. Vous pouvez desormais postuler en ligne et suivre vos candidatures.</p>',
            'welcome'
        );

        Http::ok(['user' => $publicUser(Db::one('SELECT * FROM `rca_users` WHERE `id` = ?', [$id]))], 201);
    });

    // ─── Connexion ───────────────────────────────────────────────────────────
    $r->post('/api/auth/login', static function () use ($publicUser): void {
        $login    = Http::str('username', 190);
        $password = (string) Http::input('password', '');
        $u = $login === '' ? null : Db::one('SELECT * FROM `rca_users` WHERE `username` = ? OR `email` = ?', [$login, strtolower($login)]);

        if ($u === null) {
            // Meme duree qu'une vraie verification : ne revele pas l'existence du compte.
            password_verify($password, password_hash('compte-inexistant', PASSWORD_DEFAULT));
            Http::fail("Nom d'utilisateur ou mot de passe incorrect.", 401, 'BAD_CREDENTIALS');
        }
        if (!Auth::checkPassword('rca_users', $u, $password)) {
            Http::fail("Nom d'utilisateur ou mot de passe incorrect.", 401, 'BAD_CREDENTIALS');
        }
        Auth::loginUser($u['id']);
        Http::ok(['user' => $publicUser($u)]);
    });

    $r->post('/api/auth/logout', static function (): void {
        unset($_SESSION['uid']);
        session_regenerate_id(true);
        Http::ok();
    });

    // ─── Nom d'utilisateur oublie ────────────────────────────────────────────
    $r->post('/api/auth/forgot-username', static function (): void {
        $email = Text::email(Http::str('email', 190));
        if ($email === null) {
            Http::fail('Adresse electronique invalide.', 400);
        }
        Throttle::hit('forgot', 5, 3600);

        $u = Db::one('SELECT `username` FROM `rca_users` WHERE `email` = ?', [$email]);
        if ($u !== null) {
            Mailer::send($email, "Votre nom d'utilisateur", '<p>Votre nom d\'utilisateur est : <b>' . Text::e($u['username']) . '</b></p>', 'forgot_username');
        }
        // Reponse identique dans tous les cas : ne revele pas quelles adresses ont un compte.
        Http::ok(['message' => 'Si un compte est associe a cette adresse, un courriel vient de vous etre envoye.']);
    });

    // ─── Mot de passe oublie : envoi du code ─────────────────────────────────
    $r->post('/api/auth/forgot-password', static function (): void {
        $login = Http::str('username', 190);
        if ($login === '') {
            Http::fail("Indiquez votre nom d'utilisateur.", 400);
        }
        Throttle::hit('forgot', 5, 3600);

        $u = Db::one('SELECT * FROM `rca_users` WHERE `username` = ? OR `email` = ?', [$login, strtolower($login)]);
        // Sans compte : un identifiant factice, que la verification refusera.
        $resetId = Id::uuid();
        $channel = 'email';

        if ($u !== null) {
            $phone = $u['phoneVerifiedAt'] !== null ? Sms::cameroon($u['phone']) : null;
            $want  = Http::str('channel', 10);
            try {
                if ($phone !== null && Sms::configured() && $want !== 'email') {
                    $issued = Codes::issue('reset_password', $u['id'], 'sms', $phone);
                } else {
                    $issued = Codes::issue('reset_password', $u['id'], 'email', $u['email']);
                }
            } catch (TeeeOtpException $e) {
                // SMS refuse : repli sur l'e-mail plutot qu'un echec.
                $issued = Codes::issue('reset_password', $u['id'], 'email', $u['email']);
            }
            $resetId = $issued['id'];
            $channel = $issued['channel'];
        }

        Http::ok([
            'resetId' => $resetId,
            'message' => 'Si ce compte existe, un code vient d\'etre envoye par SMS ou par courriel, selon les coordonnees verifiees du compte.',
            // Le canal n'est indique que pour un compte reel ayant un telephone verifie :
            // c'est l'utilisateur lui-meme qui l'a configure.
            'channel' => $channel,
        ]);
    });

    // ─── Mot de passe oublie : nouveau mot de passe ──────────────────────────
    $r->post('/api/auth/reset-password', static function (): void {
        $password = (string) Http::input('password', '');
        if (!Auth::strongPassword($password)) {
            Http::fail('Le mot de passe doit comporter au moins 8 caracteres, dont une majuscule, un chiffre et un caractere special.', 400);
        }
        $check = Codes::check(Http::str('resetId', 36), 'reset_password', Http::str('code', 10));
        if (!$check['ok']) {
            Http::fail($check['message'], 400, 'INVALID_CODE');
        }

        Db::update('rca_users', $check['userId'], [
            'passwordHash' => Auth::hashPassword($password),
            'failedLogins' => 0,
            'lockedUntil'  => null,
        ]);
        $u = Db::one('SELECT `email` FROM `rca_users` WHERE `id` = ?', [$check['userId']]);
        Mailer::send((string) $u['email'], 'Votre mot de passe a ete modifie', '<p>Le mot de passe de votre compte candidat vient d\'etre modifie. Si vous n\'etes pas a l\'origine de ce changement, contactez-nous immediatement.</p>', 'password_changed');

        Http::ok(['message' => 'Mot de passe modifie. Vous pouvez vous connecter.']);
    });
};
