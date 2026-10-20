<?php

declare(strict_types=1);

/** Offres publiques et « envoyer a un ami ». */

return static function (Router $r): void {

    $r->get('/api/jobs', static function (): void {
        $rows = Db::all('SELECT j.* FROM `rca_jobs` j WHERE ' . Jobs::VISIBLE . ' ORDER BY j.`publishedAt` DESC, j.`ref`');
        Http::ok(['items' => array_map(static fn (array $j): array => Jobs::present($j), $rows)]);
    });

    $r->get('/api/jobs/{ref}', static function (array $a): void {
        $job = Jobs::visibleByRef($a['ref']);
        if ($job === null) {
            Http::fail("Cette offre n'est plus publiee.", 404);
        }
        Http::ok(Jobs::present($job, true));
    });

    $r->post('/api/jobs/{ref}/share', static function (array $a): void {
        $job = Jobs::visibleByRef($a['ref']);
        if ($job === null) {
            Http::fail("Cette offre n'est plus publiee.", 404);
        }

        $fromName  = Http::str('fromName', 80);
        $fromEmail = Text::email(Http::str('fromEmail', 190));
        $message   = Http::str('message', 1000);
        $to = array_values(array_unique(array_filter(array_map(
            static fn (string $e): ?string => Text::email($e),
            preg_split('/[,;\s]+/', Http::str('to', 1000)) ?: []
        ))));

        if ($fromName === '' || $fromEmail === null) {
            Http::fail('Indiquez votre nom et une adresse electronique valide.', 400);
        }
        if ($to === [] || count($to) > 5) {
            Http::fail('Indiquez de 1 a 5 adresses de destinataires valides.', 400);
        }
        Throttle::hit('share', 5, 3600);

        $link = Config::publicUrl() . '/#/offre/' . rawurlencode($job['ref']);
        $body = '<p><b>' . Text::e($fromName) . '</b> (' . Text::e($fromEmail) . ') vous recommande cette offre :</p>'
            . '<p style="font-size:16px"><b>' . Text::e($job['title']) . '</b><br>' . Text::e($job['location']) . ' · ' . Text::e($job['contract']) . '</p>'
            . ($message !== '' ? '<blockquote style="border-left:3px solid #ddd;margin:0;padding-left:10px">' . nl2br(Text::e($message)) . '</blockquote>' : '')
            . '<p><a href="' . Text::e($link) . '">Consulter l\'offre</a></p>';

        $sent = 0;
        foreach ($to as $email) {
            $sent += Mailer::send($email, 'Une offre pourrait vous interesser : ' . $job['title'], $body, 'share') ? 1 : 0;
        }
        Http::ok(['sent' => $sent, 'total' => count($to)]);
    });
};
