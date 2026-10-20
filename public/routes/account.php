<?php

declare(strict_types=1);

/**
 * Espace candidat connecte : options du compte, profil, telephone,
 * panier, recherches sauvegardees, cooptations.
 */

return static function (Router $r): void {

    $jobId = static function (string $ref): string {
        $job = Jobs::visibleByRef($ref);
        if ($job === null) {
            Http::fail("Cette offre n'est plus publiee.", 404);
        }
        return (string) $job['id'];
    };

    // ─── Options du compte ───────────────────────────────────────────────────
    $r->post('/api/account/prefs', static function (): void {
        $u = Auth::requireUser();
        $lang = Http::str('lang', 10);
        Db::update('rca_users', $u['id'], [
            'lang'           => in_array($lang, ['fr', 'en', 'sg'], true) ? $lang : $u['lang'],
            'alertsOptIn'    => Http::input('alerts') ? 1 : 0,
            'marketingOptIn' => Http::input('marketing') ? 1 : 0,
        ]);
        Http::ok(['message' => 'Preferences enregistrees.']);
    });

    $r->post('/api/account/password', static function (): void {
        $u = Auth::requireUser();
        if (!Auth::checkPassword('rca_users', $u, (string) Http::input('current', ''))) {
            Http::fail('Mot de passe actuel incorrect.', 400);
        }
        $new = (string) Http::input('password', '');
        if (!Auth::strongPassword($new)) {
            Http::fail('Le mot de passe doit comporter au moins 8 caracteres, dont une majuscule, un chiffre et un caractere special.', 400);
        }
        Db::update('rca_users', $u['id'], ['passwordHash' => Auth::hashPassword($new)]);
        Auth::loginUser($u['id']);
        Mailer::send((string) $u['email'], 'Votre mot de passe a ete modifie', '<p>Le mot de passe de votre compte vient d\'etre modifie.</p>', 'password_changed');
        Http::ok(['message' => 'Mot de passe modifie.']);
    });

    $r->post('/api/account/email', static function (): void {
        $u = Auth::requireUser();
        if (!Auth::checkPassword('rca_users', $u, (string) Http::input('password', ''))) {
            Http::fail('Mot de passe incorrect.', 400);
        }
        $email = Text::email(Http::str('email', 190));
        if ($email === null) {
            Http::fail('Adresse electronique invalide.', 400);
        }
        if (Db::one('SELECT `id` FROM `rca_users` WHERE `email` = ? AND `id` <> ?', [$email, $u['id']]) !== null) {
            Http::fail('Cette adresse est deja utilisee par un autre compte.', 409);
        }
        Db::update('rca_users', $u['id'], ['email' => $email]);
        // L'ancienne adresse est prevenue : un changement non sollicite se voit.
        Mailer::send((string) $u['email'], 'Adresse electronique modifiee', '<p>L\'adresse de votre compte a ete remplacee par ' . Text::e(Text::maskEmail($email)) . '.</p>', 'email_changed');
        Http::ok(['message' => 'Adresse electronique modifiee.']);
    });

    $r->post('/api/account/delete', static function (): void {
        $u = Auth::requireUser();
        if (!Auth::checkPassword('rca_users', $u, (string) Http::input('password', ''))) {
            Http::fail('Mot de passe incorrect.', 400);
        }
        // Les fichiers d'abord : la suppression en cascade de la base ne les atteint pas.
        foreach (Db::all('SELECT a.`storedName` FROM `rca_attachments` a JOIN `rca_applications` p ON p.`id` = a.`applicationId` WHERE p.`userId` = ?', [$u['id']]) as $f) {
            Uploads::delete((string) $f['storedName']);
        }
        Db::run('DELETE FROM `rca_users` WHERE `id` = ?', [$u['id']]);
        Auth::logout();
        Http::ok(['message' => 'Votre compte et vos donnees ont ete supprimes.']);
    });

    // ─── Profil general ──────────────────────────────────────────────────────
    $r->get('/api/account/profile', static function (): void {
        $u = Auth::requireUser();
        Http::ok(Db::json($u['profile']));
    });

    // ─── Verification du telephone par SMS (teeeotp) ─────────────────────────
    $r->post('/api/account/phone/send', static function (): void {
        $u = Auth::requireUser();
        $phone = Http::str('phone', 30);
        if ($phone !== '') {
            if (Text::phone($phone) === null) {
                Http::fail('Numero de telephone invalide.', 400);
            }
            Db::update('rca_users', $u['id'], ['phone' => $phone, 'phoneVerifiedAt' => null]);
            $u['phone'] = $phone;
        }
        $to = Sms::cameroon($u['phone']);
        if ($to === null || !Sms::configured()) {
            Http::fail('La verification par SMS n\'est disponible que pour les mobiles camerounais pendant la demonstration.', 400, 'SMS_UNAVAILABLE');
        }
        try {
            $issued = Codes::issue('verify_phone', $u['id'], 'sms', $to);
        } catch (TeeeOtpException $e) {
            Http::fail(Sms::explain($e), $e->httpStatus === 429 ? 429 : 503, 'SMS_FAILED');
        }
        $_SESSION['phoneCode'] = $issued['id'];
        Http::ok(['message' => 'Un code vient d\'etre envoye par SMS au ' . $to . '.']);
    });

    $r->post('/api/account/phone/verify', static function (): void {
        $u = Auth::requireUser();
        $check = Codes::check((string) ($_SESSION['phoneCode'] ?? ''), 'verify_phone', Http::str('code', 10));
        if (!$check['ok'] || $check['userId'] !== $u['id']) {
            Http::fail($check['message'] ?? 'Code invalide.', 400, 'INVALID_CODE');
        }
        unset($_SESSION['phoneCode']);
        Db::update('rca_users', $u['id'], ['phoneVerifiedAt' => Db::now()]);
        Http::ok(['message' => 'Numero verifie. Vous recevrez desormais les alertes importantes par SMS.']);
    });

    // ─── Panier ──────────────────────────────────────────────────────────────
    $r->get('/api/cart', static function (): void {
        $u = Auth::requireUser();
        $rows = Db::all('SELECT j.* FROM `rca_cart` c JOIN `rca_jobs` j ON j.`id` = c.`jobId` WHERE c.`userId` = ? AND ' . Jobs::VISIBLE . ' ORDER BY c.`createdAt` DESC', [$u['id']]);
        Http::ok(['items' => array_map(static fn (array $j): string => $j['ref'], $rows)]);
    });

    $r->post('/api/cart/{ref}', static function (array $a) use ($jobId): void {
        $u = Auth::requireUser();
        $id = $jobId($a['ref']);
        if (Http::input('in') === false) {
            Db::run('DELETE FROM `rca_cart` WHERE `userId` = ? AND `jobId` = ?', [$u['id'], $id]);
        } else {
            Db::run('INSERT IGNORE INTO `rca_cart` (`userId`, `jobId`, `createdAt`) VALUES (?, ?, ?)', [$u['id'], $id, Db::now()]);
        }
        Http::ok(['count' => (int) Db::value('SELECT COUNT(*) FROM `rca_cart` WHERE `userId` = ?', [$u['id']])]);
    });

    // ─── Recherches sauvegardees ─────────────────────────────────────────────
    $r->get('/api/saved-searches', static function (): void {
        $u = Auth::requireUser();
        Http::ok(['items' => array_map(static fn (array $s): array => [
            'id' => $s['id'], 'name' => $s['name'], 'criteria' => Db::json($s['criteria']), 'alert' => (int) $s['alert'] === 1,
        ], Db::all('SELECT * FROM `rca_saved_searches` WHERE `userId` = ? ORDER BY `createdAt` DESC', [$u['id']]))]);
    });

    $r->post('/api/saved-searches', static function (): void {
        $u = Auth::requireUser();
        $name = Http::str('name', 80);
        if ($name === '') {
            Http::fail('Donnez un nom a la recherche.', 400);
        }
        if ((int) Db::value('SELECT COUNT(*) FROM `rca_saved_searches` WHERE `userId` = ?', [$u['id']]) >= 20) {
            Http::fail('20 recherches sauvegardees au maximum.', 400);
        }
        // Seuls les criteres connus sont gardes.
        $c = Http::input('criteria', []);
        $c = is_array($c) ? $c : [];
        $criteria = [
            'kw'  => mb_substr((string) ($c['kw'] ?? ''), 0, 100),
            'org' => mb_substr((string) ($c['org'] ?? ''), 0, 120),
            'loc' => mb_substr((string) ($c['loc'] ?? ''), 0, 80),
            'dom' => mb_substr((string) ($c['dom'] ?? ''), 0, 80),
            'urg' => !empty($c['urg']),
            'ct'  => array_values(array_intersect(is_array($c['ct'] ?? null) ? $c['ct'] : [], Jobs::CONTRACTS)),
            'edu' => mb_substr((string) ($c['edu'] ?? ''), 0, 60),
        ];
        $id = Db::insert('rca_saved_searches', [
            'userId'   => $u['id'],
            'name'     => $name,
            'criteria' => json_encode($criteria, JSON_UNESCAPED_UNICODE),
            'alert'    => Http::input('alert') ? 1 : 0,
        ]);
        Http::ok(['id' => $id], 201);
    });

    $r->post('/api/saved-searches/{id}', static function (array $a): void {
        $u = Auth::requireUser();
        $s = Db::one('SELECT * FROM `rca_saved_searches` WHERE `id` = ? AND `userId` = ?', [$a['id'], $u['id']]);
        if ($s === null) {
            Http::fail('Recherche introuvable.', 404);
        }
        if (Http::input('delete') === true) {
            Db::run('DELETE FROM `rca_saved_searches` WHERE `id` = ?', [$s['id']]);
        } else {
            Db::update('rca_saved_searches', $s['id'], ['alert' => Http::input('alert') ? 1 : 0]);
        }
        Http::ok();
    });

    // ─── Cooptations ─────────────────────────────────────────────────────────
    $r->get('/api/cooptations', static function (): void {
        $u = Auth::requireUser();
        Http::ok(['items' => array_map(static fn (array $c): array => [
            'name' => $c['firstName'] . ' ' . $c['lastName'], 'email' => $c['email'], 'job' => $c['title'],
            'ref' => $c['ref'], 'createdAt' => Db::iso($c['createdAt']), 'mailed' => (int) $c['mailed'] === 1,
        ], Db::all('SELECT c.*, j.`title`, j.`ref` FROM `rca_cooptations` c JOIN `rca_jobs` j ON j.`id` = c.`jobId` WHERE c.`userId` = ? ORDER BY c.`createdAt` DESC', [$u['id']]))]);
    });

    $r->post('/api/cooptations', static function () use ($jobId): void {
        $u = Auth::requireUser();
        $first = Http::str('firstName', 80);
        $last  = Http::str('lastName', 80);
        $email = Text::email(Http::str('email', 190));
        if ($first === '' || $last === '' || $email === null) {
            Http::fail('Prenom, nom et adresse electronique valide sont requis.', 400);
        }
        $id  = $jobId(Http::str('ref', 20));
        $job = Db::one('SELECT * FROM `rca_jobs` WHERE `id` = ?', [$id]);
        Throttle::hit('coopt', 10, 3600);

        $link = Config::publicUrl() . '/#/offre/' . rawurlencode($job['ref']);
        $mailed = Mailer::send(
            $email,
            'Vous avez ete recommande(e) pour un poste',
            '<p>Bonjour ' . Text::e($first) . ',</p><p><b>' . Text::e($u['username']) . '</b> vous recommande pour le poste <b>'
            . Text::e($job['title']) . '</b> (' . Text::e($job['location']) . ').</p><p><a href="' . Text::e($link) . '">Consulter l\'offre et postuler</a></p>',
            'cooptation'
        );
        Db::insert('rca_cooptations', [
            'userId' => $u['id'], 'jobId' => $id, 'firstName' => $first, 'lastName' => $last, 'email' => $email, 'mailed' => $mailed ? 1 : 0,
        ]);
        Http::ok(['mailed' => $mailed], 201);
    });
};
