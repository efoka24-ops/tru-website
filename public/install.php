<?php

declare(strict_types=1);

/**
 * Installateur a usage unique : schema, offres de demonstration, premier
 * recruteur administrateur.
 *
 *   POST /carrieres-rca/install.php?token=<INSTALL_TOKEN>
 *
 * A supprimer du serveur juste apres usage, avec schema.sql. Ne detruit
 * jamais rien : les tables sont creees si absentes, les offres et le
 * recruteur seulement si aucun n'existe.
 */

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

foreach (['Http', 'Config', 'Id', 'Db', 'Auth'] as $lib) {
    require __DIR__ . "/lib/$lib.php";
}
Config::boot(__DIR__);
date_default_timezone_set('UTC');

if (Http::method() !== 'POST') {
    Http::fail('Utilisez POST.', 405);
}
$attendu = Config::get('INSTALL_TOKEN', '');
if ($attendu === '' || !hash_equals((string) $attendu, (string) ($_GET['token'] ?? ''))) {
    Http::fail('Non autorise.', 403);
}

$pdo = Db::pdo();

// ─── Schema ─────────────────────────────────────────────────────────────────
$erreurs = [];
foreach (preg_split('/;\s*\R/', (string) file_get_contents(__DIR__ . '/schema.sql')) ?: [] as $bloc) {
    $sql = trim(implode("\n", array_filter(
        array_map('trim', preg_split('/\R/', $bloc) ?: []),
        static fn (string $l): bool => $l !== '' && !str_starts_with($l, '--')
    )));
    if ($sql === '') {
        continue;
    }
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        $erreurs[] = ['instruction' => substr($sql, 0, 100), 'message' => $e->getMessage()];
    }
}

$attendues = ['rca_users', 'rca_recruiters', 'rca_jobs', 'rca_applications', 'rca_attachments', 'rca_status_history',
              'rca_cart', 'rca_saved_searches', 'rca_cooptations', 'rca_codes', 'rca_mail_log', 'rca_throttle'];
$manquantes = array_values(array_diff($attendues, $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN)));
if ($manquantes !== []) {
    Http::fail('Installation incomplete.', 500, 'INCOMPLETE', ['manquantes' => $manquantes, 'erreurs' => $erreurs]);
}

// ─── Offres de demonstration (celles de la maquette) ────────────────────────
$offres = 0;
if ((int) Db::value('SELECT COUNT(*) FROM `rca_jobs`') === 0) {
    $missions = "Piloter les activités du périmètre et garantir l'atteinte des objectifs.\nCoordonner les équipes internes et les partenaires externes.\nProduire le reporting et proposer des axes d'amélioration.";
    $offer = "Un environnement stimulant au sein du groupe Orange, des parcours de formation et une rémunération attractive.";
    $jobs = [
        ['RCA26001', 'Chef de Projet SI & Mobile Money', "Direction des Systèmes d'Information", 'Bangui', "Systèmes d'information", 'CDI', 'BAC+4/BAC+5, Master', 1, 'Pilotage des projets Orange Money, intégrations partenaires, UAT/SIT.'],
        ['RCA26002', 'Spécialiste Produits Orange Money – Marchands', 'Orange Money Centrafrique', 'Bangui', 'Marketing', 'CDI', 'BAC+4/BAC+5, Master', 0, "Développement de l'offre marchands et paiement digital."],
        ['RCA26003', 'Ingénieur Réseau Radio', 'Direction Technique', 'Bangui', 'Réseaux & Télécoms', 'CDI', 'BAC+4/BAC+5, Master', 0, 'Planification et optimisation 2G/3G/4G.'],
        ['RCA26004', 'Responsable Commercial Régional', 'Direction Commerciale', 'Berbérati', 'Ventes', 'CDD', 'BAC+3, Licence', 1, 'Animation du réseau de distribution régional.'],
        ['RCA26005', 'Conseiller Clientèle', 'Direction Expérience Client', 'Bangui', 'Relation client', 'CDD', 'BAC+2, BTS, DUT', 0, 'Accueil et accompagnement des clients en agence.'],
        ['RCA26006', 'Analyste Data & BI', "Direction des Systèmes d'Information", 'Bangui', "Systèmes d'information", 'CDI', 'BAC+4/BAC+5, Master', 0, 'Reporting, tableaux de bord et modèles prédictifs.'],
        ['RCA26007', 'Technicien Énergie Sites', 'Direction Technique', 'Bambari', 'Réseaux & Télécoms', 'CDD', 'BAC+2, BTS, DUT', 0, 'Maintenance des groupes électrogènes et solaires.'],
        ['RCA26008', 'Juriste Réglementation', 'Direction Juridique', 'Bangui', 'Juridique', 'CDI', 'BAC+4/BAC+5, Master', 0, 'Veille réglementaire télécoms et services financiers.'],
        ['RCA26009', 'Stagiaire Marketing Digital', 'Direction Marketing', 'Bangui', 'Marketing', 'Stage', 'BAC+3, Licence', 0, 'Campagnes réseaux sociaux et contenus.'],
        ['RCA26010', 'Contrôleur de Gestion', 'Direction Financière', 'Bangui', 'Finance', 'CDI', 'BAC+4/BAC+5, Master', 0, 'Budget, suivi des coûts et reporting groupe.'],
        ['RCA26011', 'Animateur Réseau Distribution', 'Direction Commerciale', 'Bouar', 'Ventes', 'CDD', 'BAC', 0, 'Suivi des points de vente et distributeurs.'],
    ];
    foreach ($jobs as $i => [$ref, $title, $org, $loc, $dom, $ct, $edu, $urg, $summary]) {
        // Publiees a intervalles reguliers jusqu'a aujourd'hui, ouvertes 45 jours.
        $pub = gmdate('Y-m-d', time() - ($i * 3 + 1) * 86400);
        Db::insert('rca_jobs', [
            'ref' => $ref, 'title' => $title, 'org' => $org, 'location' => $loc, 'domain' => $dom, 'contract' => $ct,
            'education' => $edu, 'urgent' => $urg, 'status' => 'published', 'summary' => $summary,
            'missions' => $missions,
            'requirements' => "Diplôme : $edu.\nExpérience significative dans le domaine " . mb_strtolower($dom) . ".\nRigueur, sens du service client, esprit d'équipe.",
            'offer' => $offer, 'publishedAt' => $pub, 'unpublishAt' => gmdate('Y-m-d', strtotime($pub) + 45 * 86400),
        ]);
        $offres++;
    }
}

// ─── Premier recruteur administrateur ───────────────────────────────────────
$admin = null;
if ((int) Db::value('SELECT COUNT(*) FROM `rca_recruiters`') === 0) {
    $email = strtolower((string) Config::get('ADMIN_EMAIL', 'admin@trugroup.cm'));
    $password = 'Rca-' . bin2hex(random_bytes(6)) . '!';
    Db::insert('rca_recruiters', ['email' => $email, 'name' => 'Administrateur', 'role' => 'admin', 'passwordHash' => Auth::hashPassword($password)]);
    $admin = ['email' => $email, 'temporaryPassword' => $password];
}

Http::ok([
    'status'  => 'installed',
    'offres'  => $offres,
    'admin'   => $admin,
    'erreurs' => $erreurs,
    'suite'   => 'Supprimez install.php et schema.sql du serveur, videz INSTALL_TOKEN, puis connectez-vous au back-office (/admin) et changez le mot de passe.',
]);
