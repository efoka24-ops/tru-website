<?php

declare(strict_types=1);

/** Offres d'emploi : visibilite publique et presentation. */
final class Jobs
{
    public const CONTRACTS = ['CDI', 'CDD', 'Stage'];
    public const EDUCATION = [
        'Aucun', 'BAC', 'BAC+1, BP, BT', 'BAC+2, BTS, DUT', 'Programme non sanctionné par un diplôme',
        'BAC+3, Licence', 'BAC+4/BAC+5, Master', 'BAC+8, Doctorat', 'BAC+9 et +', 'Autre',
    ];

    /** Condition SQL d'une offre visible des candidats (alias `j`). */
    public const VISIBLE = "j.`status` = 'published'
        AND (j.`publishedAt` IS NULL OR j.`publishedAt` <= UTC_DATE())
        AND (j.`unpublishAt` IS NULL OR j.`unpublishAt` >= UTC_DATE())";

    public static function visibleByRef(string $ref): ?array
    {
        return Db::one('SELECT j.* FROM `rca_jobs` j WHERE j.`ref` = ? AND ' . self::VISIBLE, [$ref]);
    }

    public static function lines(?string $text): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/\R/', (string) $text) ?: []), static fn (string $l): bool => $l !== ''));
    }

    public static function present(array $j, bool $full = false): array
    {
        $out = [
            'ref'         => $j['ref'],
            'title'       => $j['title'],
            'org'         => $j['org'],
            'location'    => $j['location'],
            'domain'      => $j['domain'],
            'contract'    => $j['contract'],
            'education'   => $j['education'],
            'schedule'    => $j['schedule'],
            'urgent'      => (int) $j['urgent'] === 1,
            'summary'     => $j['summary'],
            'publishedAt' => $j['publishedAt'],
            'unpublishAt' => $j['unpublishAt'],
        ];
        if ($full) {
            $out += [
                'missions'     => self::lines($j['missions']),
                'requirements' => self::lines($j['requirements']),
                'offer'        => (string) $j['offer'],
            ];
        }
        return $out;
    }
}
