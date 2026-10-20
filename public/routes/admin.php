<?php

declare(strict_types=1);

/** Back-office recruteur. */

return static function (Router $r): void {

    $REVIEW = [
        'recue' => 'Candidature recue', 'examen' => "En cours d'examen", 'preselection' => 'Preselectionnee',
        'entretien' => 'Entretien planifie', 'retenue' => 'Candidature retenue', 'non_retenue' => 'Non retenue',
    ];

    $me = static fn (array $r): array => ['name' => $r['name'], 'email' => $r['email'], 'role' => $r['role']];

    // ─── Session ─────────────────────────────────────────────────────────────
    $r->get('/api/admin/session', static function () use ($me): void {
        $rec = Auth::recruiter();
        Http::ok(['recruiter' => $rec === null ? null : $me($rec)]);
    });

    $r->post('/api/admin/login', static function () use ($me): void {
        $email = strtolower(Http::str('email', 190));
        $rec = Db::one('SELECT * FROM `rca_recruiters` WHERE `email` = ? AND `active` = 1', [$email]);
        if ($rec === null) {
            password_verify((string) Http::input('password', ''), password_hash('compte-inexistant', PASSWORD_DEFAULT));
            Http::fail('Identifiants incorrects.', 401);
        }
        if (!Auth::checkPassword('rca_recruiters', $rec, (string) Http::input('password', ''))) {
            Http::fail('Identifiants incorrects.', 401);
        }
        Auth::loginRecruiter($rec['id']);
        Http::ok(['recruiter' => $me($rec)]);
    });

    $r->post('/api/admin/logout', static function (): void {
        unset($_SESSION['rid']);
        session_regenerate_id(true);
        Http::ok();
    });

    $r->post('/api/admin/password', static function (): void {
        $rec = Auth::requireRecruiter();
        if (!Auth::checkPassword('rca_recruiters', $rec, (string) Http::input('current', ''))) {
            Http::fail('Mot de passe actuel incorrect.', 400);
        }
        $new = (string) Http::input('password', '');
        if (!Auth::strongPassword($new)) {
            Http::fail('8 caracteres minimum, dont une majuscule, un chiffre et un caractere special.', 400);
        }
        Db::update('rca_recruiters', $rec['id'], ['passwordHash' => Auth::hashPassword($new)]);
        Http::ok(['message' => 'Mot de passe modifie.']);
    });

    // ─── Tableau de bord ─────────────────────────────────────────────────────
    $r->get('/api/admin/dashboard', static function () use ($REVIEW): void {
        Auth::requireRecruiter();
        $byStatus = array_fill_keys(array_keys($REVIEW), 0);
        foreach (Db::all("SELECT `reviewStatus` s, COUNT(*) n FROM `rca_applications` WHERE `status` = 'submitted' GROUP BY `reviewStatus`") as $row) {
            if (isset($byStatus[$row['s']])) {
                $byStatus[$row['s']] = (int) $row['n'];
            }
        }
        Http::ok([
            'jobsPublished' => (int) Db::value('SELECT COUNT(*) FROM `rca_jobs` j WHERE ' . Jobs::VISIBLE),
            'jobsDraft'     => (int) Db::value("SELECT COUNT(*) FROM `rca_jobs` WHERE `status` = 'draft'"),
            'candidates'    => (int) Db::value('SELECT COUNT(*) FROM `rca_users`'),
            'submitted'     => (int) Db::value("SELECT COUNT(*) FROM `rca_applications` WHERE `status` = 'submitted'"),
            'submitted7d'   => (int) Db::value("SELECT COUNT(*) FROM `rca_applications` WHERE `status` = 'submitted' AND `submittedAt` >= ?", [Db::now(-7 * 86400)]),
            'drafts'        => (int) Db::value("SELECT COUNT(*) FROM `rca_applications` WHERE `status` = 'draft'"),
            'byStatus'      => $byStatus,
            'mailFailures7d'=> (int) Db::value('SELECT COUNT(*) FROM `rca_mail_log` WHERE `ok` = 0 AND `createdAt` >= ?', [Db::now(-7 * 86400)]),
            'latest'        => array_map(static fn (array $a): array => [
                'id' => $a['id'], 'name' => trim(($a['fn'] ?? '') . ' ' . ($a['ln'] ?? '')) ?: $a['username'],
                'job' => $a['title'], 'ref' => $a['ref'], 'reviewStatus' => $a['reviewStatus'], 'submittedAt' => Db::iso($a['submittedAt']),
            ], Db::all(
                "SELECT p.`id`, p.`reviewStatus`, p.`submittedAt`, u.`username`, j.`title`, j.`ref`,
                        JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.fn')) fn, JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.ln')) ln
                 FROM `rca_applications` p JOIN `rca_users` u ON u.`id` = p.`userId` JOIN `rca_jobs` j ON j.`id` = p.`jobId`
                 WHERE p.`status` = 'submitted' ORDER BY p.`submittedAt` DESC LIMIT 8"
            )),
        ]);
    });

    // ─── Offres ──────────────────────────────────────────────────────────────
    $jobInput = static function (): array {
        $title = Http::str('title', 160);
        $org = Http::str('org', 120);
        $location = Http::str('location', 80);
        $domain = Http::str('domain', 80);
        $summary = Http::str('summary', 500);
        $contract = Http::str('contract', 10);
        $education = Http::str('education', 60);
        if ($title === '' || $org === '' || $location === '' || $domain === '' || $summary === '') {
            Http::fail('Intitule, organisation, lieu, domaine et resume sont obligatoires.', 400);
        }
        if (!in_array($contract, Jobs::CONTRACTS, true)) {
            Http::fail('Type de contrat invalide.', 400);
        }
        $date = static function (string $k): ?string {
            $v = Http::str($k, 10);
            if ($v === '') {
                return null;
            }
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) {
                Http::fail("Date invalide : $k.", 400);
            }
            return $v;
        };
        $pub = $date('publishedAt');
        $unpub = $date('unpublishAt');
        if ($pub !== null && $unpub !== null && $unpub < $pub) {
            Http::fail('La date de depublication precede la date de publication.', 400);
        }
        return [
            'title' => $title, 'org' => $org, 'location' => $location, 'domain' => $domain, 'contract' => $contract,
            'education' => $education !== '' ? $education : 'Autre', 'schedule' => Http::str('schedule', 40) ?: 'Temps plein',
            'urgent' => Http::input('urgent') ? 1 : 0, 'summary' => $summary,
            'missions' => Http::str('missions', 5000), 'requirements' => Http::str('requirements', 5000), 'offer' => Http::str('offer', 3000),
            'publishedAt' => $pub, 'unpublishAt' => $unpub,
        ];
    };

    $presentAdmin = static fn (array $j): array => Jobs::present($j, true) + [
        'id' => $j['id'], 'status' => $j['status'], 'missionsText' => (string) $j['missions'],
        'requirementsText' => (string) $j['requirements'], 'visible' => (int) ($j['visible'] ?? 0) === 1,
        'applications' => (int) ($j['applications'] ?? 0), 'drafts' => (int) ($j['drafts'] ?? 0),
    ];

    $r->get('/api/admin/jobs', static function () use ($presentAdmin): void {
        Auth::requireRecruiter();
        Http::ok(['items' => array_map($presentAdmin, Db::all(
            "SELECT j.*, (" . Jobs::VISIBLE . ") visible,
                    (SELECT COUNT(*) FROM `rca_applications` p WHERE p.`jobId` = j.`id` AND p.`status` = 'submitted') applications,
                    (SELECT COUNT(*) FROM `rca_applications` p WHERE p.`jobId` = j.`id` AND p.`status` = 'draft') drafts
             FROM `rca_jobs` j ORDER BY j.`status` = 'published' DESC, j.`publishedAt` DESC, j.`createdAt` DESC"
        ))]);
    });

    /** Prevenir les candidats dont une recherche sauvegardee correspond a l'offre publiee. */
    $alertSavedSearches = static function (array $job): int {
        $sent = 0;
        $rows = Db::all(
            'SELECT s.`criteria`, u.`email`, u.`id` uid FROM `rca_saved_searches` s JOIN `rca_users` u ON u.`id` = s.`userId`
             WHERE s.`alert` = 1 AND u.`alertsOptIn` = 1 LIMIT 500'
        );
        $seen = [];
        foreach ($rows as $row) {
            if (isset($seen[$row['uid']])) {
                continue;
            }
            $c = Db::json($row['criteria']);
            $kw = mb_strtolower((string) ($c['kw'] ?? ''));
            $hay = mb_strtolower($job['title'] . ' ' . $job['ref'] . ' ' . $job['domain'] . ' ' . $job['summary']);
            $match = ($kw === '' || str_contains($hay, $kw))
                && (empty($c['org']) || $c['org'] === $job['org'])
                && (empty($c['loc']) || $c['loc'] === $job['location'])
                && (empty($c['dom']) || $c['dom'] === $job['domain'])
                && (empty($c['urg']) || (int) $job['urgent'] === 1)
                && (empty($c['ct']) || in_array($job['contract'], (array) $c['ct'], true))
                && (empty($c['edu']) || $c['edu'] === $job['education']);
            if (!$match) {
                continue;
            }
            $seen[$row['uid']] = true;
            $link = Config::publicUrl() . '/#/offre/' . rawurlencode($job['ref']);
            $sent += Mailer::send((string) $row['email'], 'Nouvelle offre : ' . $job['title'],
                '<p>Une nouvelle offre correspond a l\'une de vos recherches sauvegardees :</p><p><b>' . Text::e($job['title']) . '</b><br>'
                . Text::e($job['location']) . ' · ' . Text::e($job['contract']) . '</p><p><a href="' . Text::e($link) . '">Consulter l\'offre</a></p>',
                'job_alert') ? 1 : 0;
        }
        return $sent;
    };

    $r->post('/api/admin/jobs', static function () use ($jobInput): void {
        $rec = Auth::requireRecruiter();
        $data = $jobInput();
        // Reference annuelle sequentielle : RCA26012…
        $prefix = 'RCA' . gmdate('y');
        $last = (string) Db::value('SELECT MAX(`ref`) FROM `rca_jobs` WHERE `ref` LIKE ?', [$prefix . '%']);
        $data['ref'] = $prefix . str_pad((string) ((int) substr($last, strlen($prefix)) + 1), 3, '0', STR_PAD_LEFT);
        $data['status'] = 'draft';
        $data['createdBy'] = $rec['id'];
        $id = Db::insert('rca_jobs', $data);
        Http::ok(['id' => $id, 'ref' => $data['ref']], 201);
    });

    $r->post('/api/admin/jobs/{id}', static function (array $a) use ($jobInput): void {
        Auth::requireRecruiter();
        if (Db::one('SELECT `id` FROM `rca_jobs` WHERE `id` = ?', [$a['id']]) === null) {
            Http::fail('Offre introuvable.', 404);
        }
        Db::update('rca_jobs', $a['id'], $jobInput());
        Http::ok();
    });

    $r->post('/api/admin/jobs/{id}/status', static function (array $a) use ($alertSavedSearches): void {
        Auth::requireRecruiter();
        $job = Db::one('SELECT * FROM `rca_jobs` WHERE `id` = ?', [$a['id']]);
        if ($job === null) {
            Http::fail('Offre introuvable.', 404);
        }
        $status = Http::str('status', 10);
        if (!in_array($status, ['draft', 'published', 'closed'], true)) {
            Http::fail('Statut invalide.', 400);
        }
        $data = ['status' => $status];
        if ($status === 'published' && $job['publishedAt'] === null) {
            $data['publishedAt'] = gmdate('Y-m-d');
        }
        Db::update('rca_jobs', $job['id'], $data);

        $alerts = 0;
        if ($status === 'published' && $job['status'] !== 'published') {
            $alerts = $alertSavedSearches(array_merge($job, $data));
        }
        Http::ok(['status' => $status, 'alertsSent' => $alerts]);
    });

    // ─── Candidatures ────────────────────────────────────────────────────────
    $r->get('/api/admin/applications', static function () use ($REVIEW): void {
        Auth::requireRecruiter();
        $where = ["p.`status` = 'submitted'"];
        $params = [];
        if (($job = (string) ($_GET['job'] ?? '')) !== '') {
            $where[] = 'j.`id` = ?';
            $params[] = $job;
        }
        if (isset($REVIEW[$st = (string) ($_GET['status'] ?? '')])) {
            $where[] = 'p.`reviewStatus` = ?';
            $params[] = $st;
        }
        if (($q = trim((string) ($_GET['q'] ?? ''))) !== '') {
            $where[] = "(u.`username` LIKE ? OR u.`email` LIKE ? OR JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.ln')) LIKE ? OR JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.fn')) LIKE ?)";
            $like = '%' . addcslashes($q, '%_\\') . '%';
            array_push($params, $like, $like, $like, $like);
        }
        Http::ok(['items' => array_map(static fn (array $a): array => [
            'id' => $a['id'], 'name' => trim(($a['fn'] ?? '') . ' ' . ($a['ln'] ?? '')) ?: $a['username'],
            'email' => $a['em'] ?: $a['email'], 'phone' => $a['ph'], 'city' => $a['ci'], 'job' => $a['title'], 'ref' => $a['ref'],
            'reviewStatus' => $a['reviewStatus'], 'submittedAt' => Db::iso($a['submittedAt']),
            'experience' => $a['q1'], 'cv' => (int) $a['cv'] > 0,
        ], Db::all(
            "SELECT p.`id`, p.`reviewStatus`, p.`submittedAt`, u.`username`, u.`email`, j.`title`, j.`ref`,
                    JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.fn')) fn, JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.ln')) ln,
                    JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.em')) em, JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.ph')) ph,
                    JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.profile.ci')) ci, JSON_UNQUOTE(JSON_EXTRACT(p.`data`, '$.answers.q1')) q1,
                    (SELECT COUNT(*) FROM `rca_attachments` t WHERE t.`applicationId` = p.`id` AND t.`kind` = 'cv') cv
             FROM `rca_applications` p JOIN `rca_users` u ON u.`id` = p.`userId` JOIN `rca_jobs` j ON j.`id` = p.`jobId`
             WHERE " . implode(' AND ', $where) . ' ORDER BY p.`submittedAt` DESC LIMIT 300',
            $params
        ))]);
    });

    $r->get('/api/admin/applications/{id}', static function (array $a) use ($REVIEW): void {
        Auth::requireRecruiter();
        $p = Db::one(
            'SELECT p.*, u.`username`, u.`email`, u.`phone`, u.`phoneVerifiedAt`, j.`title`, j.`ref`, j.`location`
             FROM `rca_applications` p JOIN `rca_users` u ON u.`id` = p.`userId` JOIN `rca_jobs` j ON j.`id` = p.`jobId`
             WHERE p.`id` = ? AND p.`status` <> \'draft\'',
            [$a['id']]
        );
        if ($p === null) {
            Http::fail('Candidature introuvable.', 404);
        }
        Http::ok([
            'id' => $p['id'], 'status' => $p['status'], 'reviewStatus' => $p['reviewStatus'], 'submittedAt' => Db::iso($p['submittedAt']),
            'signedName' => $p['signedName'], 'job' => ['title' => $p['title'], 'ref' => $p['ref'], 'location' => $p['location']],
            'account' => ['username' => $p['username'], 'email' => $p['email'], 'phone' => $p['phone'], 'phoneVerified' => $p['phoneVerifiedAt'] !== null,
                          'smsEligible' => $p['phoneVerifiedAt'] !== null && Sms::cameroon($p['phone']) !== null],
            'data' => Db::json($p['data']),
            'attachments' => array_map(static fn (array $f): array => ['id' => $f['id'], 'kind' => $f['kind'], 'name' => $f['originalName'], 'size' => (int) $f['size']],
                Db::all('SELECT * FROM `rca_attachments` WHERE `applicationId` = ? ORDER BY `kind`, `createdAt`', [$p['id']])),
            'history' => array_map(static fn (array $h): array => [
                'from' => $h['fromStatus'], 'to' => $h['toStatus'], 'label' => $REVIEW[$h['toStatus']] ?? $h['toStatus'], 'note' => $h['note'],
                'by' => $h['recruiterName'], 'notified' => $h['notified'], 'at' => Db::iso($h['createdAt']),
            ], Db::all('SELECT h.*, r.`name` recruiterName FROM `rca_status_history` h LEFT JOIN `rca_recruiters` r ON r.`id` = h.`recruiterId` WHERE h.`applicationId` = ? ORDER BY h.`createdAt` DESC', [$p['id']])),
        ]);
    });

    $r->post('/api/admin/applications/{id}/status', static function (array $a) use ($REVIEW): void {
        $rec = Auth::requireRecruiter();
        $p = Db::one(
            'SELECT p.*, u.`email`, u.`phone`, u.`phoneVerifiedAt`, j.`title`, j.`ref` FROM `rca_applications` p
             JOIN `rca_users` u ON u.`id` = p.`userId` JOIN `rca_jobs` j ON j.`id` = p.`jobId` WHERE p.`id` = ? AND p.`status` = \'submitted\'',
            [$a['id']]
        );
        if ($p === null) {
            Http::fail('Candidature introuvable ou retiree.', 404);
        }
        $to = Http::str('status', 20);
        if (!isset($REVIEW[$to])) {
            Http::fail('Statut invalide.', 400);
        }
        $note = Http::str('note', 1000);
        $message = Http::str('message', 1000);

        $notified = [];
        if (Http::input('notifyEmail')) {
            $data = Db::json($p['data']);
            $email = Text::email((string) ($data['profile']['em'] ?? '')) ?? (string) $p['email'];
            if (Mailer::send($email, 'Votre candidature : ' . $p['title'],
                '<p>Bonjour,</p><p>Le statut de votre candidature au poste <b>' . Text::e($p['title']) . '</b> (' . Text::e($p['ref']) . ') a evolue : <b>'
                . Text::e($REVIEW[$to]) . '</b>.</p>' . ($message !== '' ? '<p>' . nl2br(Text::e($message)) . '</p>' : ''),
                'status_change')) {
                $notified[] = 'email';
            }
        }
        if (Http::input('notifySms') && $p['phoneVerifiedAt'] !== null
            && Sms::notify($p['phone'], 'Carrieres RCA (demo) : votre candidature ' . $p['ref'] . ' est passee au statut : ' . $REVIEW[$to] . '.')) {
            $notified[] = 'sms';
        }

        Db::update('rca_applications', $p['id'], ['reviewStatus' => $to]);
        Db::insert('rca_status_history', [
            'applicationId' => $p['id'], 'fromStatus' => $p['reviewStatus'], 'toStatus' => $to,
            'note' => $note !== '' ? $note : null, 'recruiterId' => $rec['id'], 'notified' => $notified === [] ? null : implode(',', $notified),
        ]);
        Http::ok(['reviewStatus' => $to, 'notified' => $notified]);
    });

    // ─── Candidats, cooptations, messages ────────────────────────────────────
    $r->get('/api/admin/candidates', static function (): void {
        Auth::requireRecruiter();
        Http::ok(['items' => array_map(static fn (array $u): array => [
            'username' => $u['username'], 'email' => $u['email'], 'phone' => $u['phone'], 'phoneVerified' => $u['phoneVerifiedAt'] !== null,
            'createdAt' => Db::iso($u['createdAt']), 'lastLoginAt' => Db::iso($u['lastLoginAt']),
            'submitted' => (int) $u['submitted'], 'drafts' => (int) $u['drafts'],
        ], Db::all(
            "SELECT u.*, (SELECT COUNT(*) FROM `rca_applications` p WHERE p.`userId` = u.`id` AND p.`status` = 'submitted') submitted,
                    (SELECT COUNT(*) FROM `rca_applications` p WHERE p.`userId` = u.`id` AND p.`status` = 'draft') drafts
             FROM `rca_users` u ORDER BY u.`createdAt` DESC LIMIT 500"
        ))]);
    });

    $r->get('/api/admin/cooptations', static function (): void {
        Auth::requireRecruiter();
        Http::ok(['items' => array_map(static fn (array $c): array => [
            'by' => $c['username'], 'name' => $c['firstName'] . ' ' . $c['lastName'], 'email' => $c['email'],
            'job' => $c['title'], 'ref' => $c['ref'], 'mailed' => (int) $c['mailed'] === 1, 'createdAt' => Db::iso($c['createdAt']),
        ], Db::all('SELECT c.*, u.`username`, j.`title`, j.`ref` FROM `rca_cooptations` c JOIN `rca_users` u ON u.`id` = c.`userId` JOIN `rca_jobs` j ON j.`id` = c.`jobId` ORDER BY c.`createdAt` DESC LIMIT 300'))]);
    });

    $r->get('/api/admin/messages', static function (): void {
        Auth::requireRecruiter();
        Http::ok([
            'smtp'  => Config::get('SMTP_HOST') !== null,
            'sms'   => Sms::configured(),
            'items' => array_map(static fn (array $m): array => [
                'to' => $m['recipient'], 'subject' => $m['subject'], 'kind' => $m['kind'], 'ok' => (int) $m['ok'] === 1,
                'via' => $m['via'], 'error' => $m['error'], 'at' => Db::iso($m['createdAt']),
            ], Db::all('SELECT * FROM `rca_mail_log` ORDER BY `createdAt` DESC LIMIT 200')),
        ]);
    });

    // ─── Recruteurs (administrateurs) ────────────────────────────────────────
    $r->get('/api/admin/recruiters', static function (): void {
        Auth::requireRecruiter(true);
        Http::ok(['items' => array_map(static fn (array $x): array => [
            'id' => $x['id'], 'name' => $x['name'], 'email' => $x['email'], 'role' => $x['role'],
            'active' => (int) $x['active'] === 1, 'lastLoginAt' => Db::iso($x['lastLoginAt']),
        ], Db::all('SELECT * FROM `rca_recruiters` ORDER BY `createdAt`'))]);
    });

    $r->post('/api/admin/recruiters', static function (): void {
        Auth::requireRecruiter(true);
        $email = Text::email(Http::str('email', 190));
        $name = Http::str('name', 120);
        $role = Http::str('role', 10) === 'admin' ? 'admin' : 'recruiter';
        if ($email === null || $name === '') {
            Http::fail('Nom et adresse electronique valides requis.', 400);
        }
        if (Db::one('SELECT `id` FROM `rca_recruiters` WHERE `email` = ?', [$email]) !== null) {
            Http::fail('Ce recruteur existe deja.', 409);
        }
        // Mot de passe provisoire affiche une seule fois, a changer a la premiere connexion.
        $password = 'Rca-' . bin2hex(random_bytes(5)) . '!';
        Db::insert('rca_recruiters', ['email' => $email, 'name' => $name, 'role' => $role, 'passwordHash' => Auth::hashPassword($password)]);
        Http::ok(['email' => $email, 'temporaryPassword' => $password], 201);
    });

    $r->post('/api/admin/recruiters/{id}', static function (array $a): void {
        $me = Auth::requireRecruiter(true);
        if ($a['id'] === $me['id']) {
            Http::fail('Vous ne pouvez pas vous desactiver vous-meme.', 400);
        }
        Db::run('UPDATE `rca_recruiters` SET `active` = ?, `updatedAt` = ? WHERE `id` = ?', [Http::input('active') ? 1 : 0, Db::now(), $a['id']]);
        Http::ok();
    });
};
