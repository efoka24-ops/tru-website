<?php

declare(strict_types=1);

/**
 * Parcours de candidature : brouillon sauvegarde a chaque etape, pieces
 * jointes, soumission signee, retrait.
 */

return static function (Router $r): void {

    $STEPS = 7;
    $REVIEW = [
        'recue' => 'Candidature recue', 'examen' => "En cours d'examen", 'preselection' => 'Preselectionnee',
        'entretien' => 'Entretien planifie', 'retenue' => 'Candidature retenue', 'non_retenue' => 'Non retenue',
    ];

    /** Ne garde que les champs attendus, tronques : le JSON vient du navigateur. */
    $clean = static function (mixed $d): array {
        $d = is_array($d) ? $d : [];
        $s = static fn (mixed $v, int $max = 160): string => is_scalar($v) ? mb_substr(trim((string) $v), 0, $max) : '';
        $p = is_array($d['profile'] ?? null) ? $d['profile'] : [];
        $profile = [];
        foreach (['fn' => 80, 'ln' => 80, 'em' => 190, 'ph' => 30, 'ad' => 200, 'ci' => 60, 'co' => 60, 'bd' => 10, 'src' => 60, 'dom' => 80] as $k => $max) {
            $profile[$k] = $s($p[$k] ?? '', $max);
        }
        $list = static function (mixed $items, array $fields) use ($s): array {
            $out = [];
            foreach (array_slice(is_array($items) ? $items : [], 0, 10) as $it) {
                $row = [];
                foreach ($fields as $k => $max) {
                    $row[$k] = $s(is_array($it) ? ($it[$k] ?? '') : '', $max);
                }
                $out[] = $row;
            }
            return $out;
        };
        $q = is_array($d['answers'] ?? null) ? $d['answers'] : [];
        return [
            'privacy' => !empty($d['privacy']),
            'profile' => $profile,
            'edu'     => $list($d['edu'] ?? [], ['s' => 160, 'g' => 60, 'p' => 120, 'y' => 4]),
            'exp'     => $list($d['exp'] ?? [], ['c' => 160, 't' => 160, 'a' => 10, 'z' => 10, 'r' => 2000]),
            'answers' => [
                'q1'    => $s($q['q1'] ?? '', 40),
                'q2'    => $s($q['q2'] ?? '', 40),
                'q3'    => $s($q['q3'] ?? '', 10),
                'langs' => array_values(array_intersect(is_array($q['langs'] ?? null) ? $q['langs'] : [], ['Francais', 'Sango', 'Anglais', 'Arabe'])),
            ],
        ];
    };

    $find = static function (array $u, string $ref, bool $mustBeOpen = true): array {
        $job = $mustBeOpen ? Jobs::visibleByRef($ref) : Db::one('SELECT * FROM `rca_jobs` WHERE `ref` = ?', [$ref]);
        if ($job === null) {
            Http::fail("Cette offre n'est plus publiee.", 404);
        }
        $app = Db::one('SELECT * FROM `rca_applications` WHERE `userId` = ? AND `jobId` = ?', [$u['id'], $job['id']]);
        return [$job, $app];
    };

    $attachments = static fn (string $appId): array => array_map(static fn (array $a): array => [
        'id' => $a['id'], 'kind' => $a['kind'], 'name' => $a['originalName'], 'size' => (int) $a['size'],
    ], Db::all('SELECT * FROM `rca_attachments` WHERE `applicationId` = ? ORDER BY `createdAt`', [$appId]));

    // ─── Mes candidatures ────────────────────────────────────────────────────
    $r->get('/api/applications', static function () use ($REVIEW): void {
        $u = Auth::requireUser();
        Http::ok(['items' => array_map(static fn (array $a): array => [
            'ref'          => $a['ref'],
            'title'        => $a['title'],
            'location'     => $a['location'],
            'jobOpen'      => $a['jobOpen'] === 1 || $a['jobOpen'] === '1',
            'status'       => $a['status'],
            'reviewStatus' => $a['reviewStatus'],
            'reviewLabel'  => $a['reviewStatus'] === null ? null : $REVIEW[$a['reviewStatus']],
            'step'         => (int) $a['step'],
            'updatedAt'    => Db::iso($a['updatedAt']),
            'submittedAt'  => Db::iso($a['submittedAt']),
        ], Db::all(
            'SELECT p.*, j.`ref`, j.`title`, j.`location`, (' . Jobs::VISIBLE . ') AS jobOpen
             FROM `rca_applications` p JOIN `rca_jobs` j ON j.`id` = p.`jobId`
             WHERE p.`userId` = ? AND p.`status` <> \'withdrawn\' ORDER BY p.`updatedAt` DESC',
            [$u['id']]
        ))]);
    });

    // ─── Ouvrir une candidature (ou en preparer une nouvelle) ────────────────
    $r->get('/api/applications/{ref}', static function (array $a) use ($find, $attachments, $REVIEW): void {
        $u = Auth::requireUser();
        [$job, $app] = $find($u, $a['ref'], false);

        $base = ['job' => Jobs::present($job), 'profile' => Db::json($u['profile']) + ['em' => $u['email'], 'ph' => (string) $u['phone']]];
        if ($app === null || $app['status'] === 'withdrawn') {
            if (Jobs::visibleByRef($a['ref']) === null) {
                Http::fail("Cette offre n'est plus publiee.", 404);
            }
            Http::ok($base + ['exists' => false]);
        }
        Http::ok($base + [
            'exists'       => true,
            'status'       => $app['status'],
            'reviewLabel'  => $app['reviewStatus'] === null ? null : $REVIEW[$app['reviewStatus']],
            'step'         => (int) $app['step'],
            'data'         => Db::json($app['data']),
            'signedName'   => $app['signedName'],
            'submittedAt'  => Db::iso($app['submittedAt']),
            'attachments'  => $attachments($app['id']),
        ]);
    });

    // ─── Sauvegarder le brouillon ────────────────────────────────────────────
    $r->post('/api/applications/{ref}', static function (array $a) use ($find, $clean, $STEPS): void {
        $u = Auth::requireUser();
        [$job, $app] = $find($u, $a['ref']);
        if ($app !== null && $app['status'] === 'submitted') {
            Http::fail('Cette candidature est deja soumise.', 409);
        }

        $data = $clean(Http::input('data'));
        $step = max(0, min((int) Http::input('step', 0), $STEPS - 1));

        if ($app === null) {
            $id = Db::insert('rca_applications', ['userId' => $u['id'], 'jobId' => $job['id'], 'step' => $step, 'data' => json_encode($data, JSON_UNESCAPED_UNICODE)]);
        } else {
            // Une candidature retiree redevient un brouillon si le candidat repostule.
            Db::update('rca_applications', $app['id'], ['status' => 'draft', 'reviewStatus' => null, 'step' => $step, 'data' => json_encode($data, JSON_UNESCAPED_UNICODE)]);
            $id = $app['id'];
        }

        // Le profil general est reutilise pour les prochaines candidatures.
        $profile = array_filter($data['profile'], static fn (string $v): bool => $v !== '');
        if ($profile !== []) {
            Db::update('rca_users', $u['id'], ['profile' => json_encode($profile + Db::json($u['profile']), JSON_UNESCAPED_UNICODE)]);
        }
        Http::ok(['id' => $id, 'step' => $step]);
    });

    // ─── Pieces jointes ──────────────────────────────────────────────────────
    $r->post('/api/applications/{ref}/attachments', static function (array $a) use ($find, $attachments): void {
        $u = Auth::requireUser();
        [, $app] = $find($u, $a['ref']);
        if ($app === null) {
            Http::fail('Enregistrez d\'abord une etape de la candidature.', 409);
        }
        if ($app['status'] === 'submitted') {
            Http::fail('Cette candidature est deja soumise.', 409);
        }
        $kind = (string) ($_POST['kind'] ?? '');
        if (!in_array($kind, ['cv', 'letter', 'other'], true) || !isset($_FILES['file'])) {
            Http::fail('Fichier ou type de piece manquant.', 400);
        }
        if ($kind === 'other' && (int) Db::value("SELECT COUNT(*) FROM `rca_attachments` WHERE `applicationId` = ? AND `kind` = 'other'", [$app['id']]) >= 5) {
            Http::fail('5 documents complementaires au maximum.', 400);
        }

        $stored = Uploads::store($_FILES['file'], $kind === 'other' ? ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'] : ['pdf', 'doc', 'docx']);

        // Un seul CV et une seule lettre : le nouveau remplace l'ancien.
        if ($kind !== 'other') {
            foreach (Db::all('SELECT * FROM `rca_attachments` WHERE `applicationId` = ? AND `kind` = ?', [$app['id'], $kind]) as $old) {
                Uploads::delete((string) $old['storedName']);
                Db::run('DELETE FROM `rca_attachments` WHERE `id` = ?', [$old['id']]);
            }
        }
        Db::insert('rca_attachments', ['applicationId' => $app['id'], 'kind' => $kind] + $stored);
        Http::ok(['attachments' => $attachments($app['id'])], 201);
    });

    $r->post('/api/applications/{ref}/attachments/{id}/delete', static function (array $a) use ($find, $attachments): void {
        $u = Auth::requireUser();
        [, $app] = $find($u, $a['ref'], false);
        if ($app === null || $app['status'] === 'submitted') {
            Http::fail('Piece non modifiable.', 409);
        }
        $att = Db::one('SELECT * FROM `rca_attachments` WHERE `id` = ? AND `applicationId` = ?', [$a['id'], $app['id']]);
        if ($att !== null) {
            Uploads::delete((string) $att['storedName']);
            Db::run('DELETE FROM `rca_attachments` WHERE `id` = ?', [$att['id']]);
        }
        Http::ok(['attachments' => $attachments($app['id'])]);
    });

    // ─── Soumettre ───────────────────────────────────────────────────────────
    $r->post('/api/applications/{ref}/submit', static function (array $a) use ($find, $clean): void {
        $u = Auth::requireUser();
        [$job, $app] = $find($u, $a['ref']);
        if ($app === null) {
            Http::fail('Candidature introuvable.', 404);
        }
        if ($app['status'] === 'submitted') {
            Http::fail('Cette candidature est deja soumise.', 409);
        }

        $data = $clean(Db::json($app['data']));
        $p = $data['profile'];
        $missing = [];
        if (!$data['privacy']) {
            $missing[] = "l'acceptation de l'enonce de confidentialite";
        }
        foreach (['fn' => 'le prenom', 'ln' => 'le nom', 'em' => "l'adresse electronique", 'ph' => 'le telephone', 'ci' => 'la ville'] as $k => $label) {
            if ($p[$k] === '') {
                $missing[] = $label;
            }
        }
        if ($p['em'] !== '' && Text::email($p['em']) === null) {
            $missing[] = 'une adresse electronique valide';
        }
        if ((int) Db::value("SELECT COUNT(*) FROM `rca_attachments` WHERE `applicationId` = ? AND `kind` = 'cv'", [$app['id']]) === 0) {
            $missing[] = 'le CV';
        }
        $signed = Http::str('signedName', 160);
        if (Http::input('certify') !== true || $signed === '') {
            $missing[] = 'la signature electronique';
        }
        if ($missing !== []) {
            Http::fail('Il manque : ' . implode(', ', $missing) . '.', 400, 'INCOMPLETE', ['missing' => $missing]);
        }

        Db::transaction(static function () use ($app, $signed): void {
            Db::update('rca_applications', $app['id'], [
                'status' => 'submitted', 'reviewStatus' => 'recue', 'signedName' => $signed, 'submittedAt' => Db::now(), 'step' => 6,
            ]);
            Db::insert('rca_status_history', ['applicationId' => $app['id'], 'fromStatus' => null, 'toStatus' => 'recue', 'note' => 'Candidature soumise en ligne']);
        });

        $mailed = Mailer::send(
            Text::email($p['em']) ?? (string) $u['email'],
            'Confirmation de votre candidature',
            '<p>Bonjour ' . Text::e($p['fn']) . ',</p><p>Votre candidature au poste <b>' . Text::e($job['title']) . '</b> (' . Text::e($job['ref']) . ') a bien ete recue.</p>'
            . '<p>Vous pouvez suivre son avancement dans « Mes candidatures ».</p>',
            'application_submitted'
        );
        $sms = $u['phoneVerifiedAt'] !== null && Sms::notify($u['phone'], 'Carrieres RCA (demo) : votre candidature ' . $job['ref'] . ' a bien ete recue.');

        Http::ok(['status' => 'submitted', 'mailed' => $mailed, 'sms' => $sms]);
    });

    // ─── Retirer une candidature ou supprimer un brouillon ───────────────────
    $r->post('/api/applications/{ref}/withdraw', static function (array $a) use ($find): void {
        $u = Auth::requireUser();
        [, $app] = $find($u, $a['ref'], false);
        if ($app === null) {
            Http::fail('Candidature introuvable.', 404);
        }
        if ($app['status'] === 'draft') {
            foreach (Db::all('SELECT `storedName` FROM `rca_attachments` WHERE `applicationId` = ?', [$app['id']]) as $f) {
                Uploads::delete((string) $f['storedName']);
            }
            Db::run('DELETE FROM `rca_applications` WHERE `id` = ?', [$app['id']]);
            Http::ok(['message' => 'Brouillon supprime.']);
        }
        Db::update('rca_applications', $app['id'], ['status' => 'withdrawn']);
        Db::insert('rca_status_history', ['applicationId' => $app['id'], 'fromStatus' => $app['reviewStatus'], 'toStatus' => 'retiree', 'note' => 'Retiree par le candidat']);
        Http::ok(['message' => 'Candidature retiree.']);
    });
};
