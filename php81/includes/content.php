<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Seed initial (une seule fois) : si une table est vide, on y insere
 * le contenu de demarrage ci-dessous pour que le site ne soit jamais vide.
 */
function content_seed_if_empty(): void
{
    $pdo = db();

    if ((int)$pdo->query('SELECT COUNT(*) FROM services')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO services (title, icon, description, objective, features_json, sort_order, created_at, updated_at) VALUES (:title, :icon, :description, :objective, :features_json, :sort_order, NOW(), NOW())');
        foreach (content_services_seed() as $i => $row) {
            $stmt->execute([
                ':title' => $row['title'],
                ':icon' => $row['icon'],
                ':description' => $row['description'],
                ':objective' => $row['objective'] ?? '',
                ':features_json' => json_encode($row['features'], JSON_UNESCAPED_UNICODE),
                ':sort_order' => $i,
            ]);
        }
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM solutions')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO solutions (name, subtitle, icon, description, sort_order, created_at, updated_at) VALUES (:name, :subtitle, :icon, :description, :sort_order, NOW(), NOW())');
        foreach (content_solutions_seed() as $i => $row) {
            $stmt->execute([
                ':name' => $row['name'],
                ':subtitle' => $row['subtitle'],
                ':icon' => $row['icon'],
                ':description' => $row['description'],
                ':sort_order' => $i,
            ]);
        }
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM team_members')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO team_members (name, title, bio, specialties_json, sort_order, created_at, updated_at) VALUES (:name, :title, :bio, :specialties_json, :sort_order, NOW(), NOW())');
        foreach (content_team_seed() as $i => $row) {
            $stmt->execute([
                ':name' => $row['name'],
                ':title' => $row['title'],
                ':bio' => $row['bio'],
                ':specialties_json' => json_encode([], JSON_UNESCAPED_UNICODE),
                ':sort_order' => $i,
            ]);
        }
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM news_posts')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO news_posts (title, description, content, category, created_at, updated_at) VALUES (:title, :description, :content, :category, NOW(), NOW())');
        foreach (content_news_seed() as $row) {
            $stmt->execute([
                ':title' => $row['title'],
                ':description' => $row['description'],
                ':content' => $row['content'] ?? '',
                ':category' => $row['category'],
            ]);
        }
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM jobs')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO jobs (title, location, type, description, statut, created_at, updated_at) VALUES (:title, :location, :type, :description, :statut, NOW(), NOW())');
        foreach (content_jobs_seed() as $row) {
            $stmt->execute([
                ':title' => $row['title'],
                ':location' => $row['location'],
                ':type' => $row['type'],
                ':description' => $row['description'],
                ':statut' => 'active',
            ]);
        }
    }

    if ((int)$pdo->query('SELECT COUNT(*) FROM formations')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO formations (titre, description, prix, duree, format, lieu, statut, created_at, updated_at) VALUES (:titre, :description, :prix, :duree, :format, :lieu, :statut, NOW(), NOW())');
        foreach (content_formations_seed() as $row) {
            $stmt->execute([
                ':titre' => $row['titre'],
                ':description' => $row['description'],
                ':prix' => $row['prix'],
                ':duree' => $row['duree'],
                ':format' => $row['format'],
                ':lieu' => $row['lieu'],
                ':statut' => $row['statut'],
            ]);
        }
    }
}

function content_services_seed(): array
{
    return [
        ['title' => 'Conseil & Organisation', 'icon' => 'fa-building', 'description' => 'Accompagnement des institutions dans la modernisation organisationnelle.', 'objective' => '', 'features' => ['Audit organisationnel', 'Cartographie et optimisation des processus', 'Rédaction de manuels et procédures', 'Conduite du changement']],
        ['title' => 'Transformation digitale', 'icon' => 'fa-display', 'description' => 'Conception et déploiement de solutions numériques adaptées.', 'objective' => '', 'features' => ['Digitalisation des services publics', 'E-administration', 'Outils de gestion', 'Tableaux de bord décisionnels']],
        ['title' => 'Développement d\'applications', 'icon' => 'fa-mobile-screen-button', 'description' => 'Création de plateformes web et applications sur mesure.', 'objective' => '', 'features' => ['Applications mobiles', 'Plateformes web', 'Systèmes d\'information sectoriels', 'Outils SaaS']],
        ['title' => 'Gestion de projet & Assistance technique', 'icon' => 'fa-clipboard-check', 'description' => 'Pilotage de projets complexes avec des experts métier dédiés.', 'objective' => '', 'features' => ['Gestion de projet', 'Pilotage stratégique', 'Suivi-évaluation', 'Coordination multisectorielle']],
        ['title' => 'Formation & Renforcement des capacités', 'icon' => 'fa-graduation-cap', 'description' => 'Formations professionnelles pour jeunes, cadres et institutions.', 'objective' => '', 'features' => ['Gestion de projet classique et agile', 'Outils numériques', 'Data & intelligence décisionnelle', 'Leadership et innovation']],
    ];
}

function content_solutions_seed(): array
{
    return [
        ['name' => 'MokineVeto', 'subtitle' => 'Télémédecine vétérinaire', 'icon' => 'fa-cow', 'description' => 'Consultations vétérinaires en ligne, géolocalisation du bétail et détection précoce des maladies.'],
        ['name' => 'Mokine', 'subtitle' => 'Traçabilité & Sécurité', 'icon' => 'fa-location-dot', 'description' => 'Solution IoT pour la géolocalisation en temps réel et la protection du bétail.'],
        ['name' => 'MokineKid', 'subtitle' => 'Sécurité enfants', 'icon' => 'fa-child-reaching', 'description' => 'Bracelet intelligent avec géolocalisation, zones de sécurité et bouton SOS.'],
    ];
}

function content_team_seed(): array
{
    return [
        ['name' => 'Emmanuel Foka Ziegoube', 'title' => 'Fondateur & PDG', 'bio' => 'Ingénieur en génie logiciel et expert en transformation digitale.'],
        ['name' => 'Tatinou Hervé', 'title' => 'Senior UI/UX Designer', 'bio' => 'Conception d\'interfaces intuitives et d\'expériences produit performantes.'],
        ['name' => 'Halimatou Sadia Ahmadou', 'title' => 'Lead Project Manager', 'bio' => 'Coordination stratégique et pilotage opérationnel de projets complexes.'],
    ];
}

function content_news_seed(): array
{
    return [
        ['title' => 'TRU GROUP accélère sa feuille de route digitale', 'description' => 'Focus sur l\'innovation, la transformation digitale et la création de valeur locale.', 'content' => '', 'category' => 'Entreprise'],
    ];
}

function content_jobs_seed(): array
{
    return [
        ['title' => 'Consultant Transformation Digitale', 'location' => 'Garoua / Remote', 'type' => 'Temps plein', 'description' => 'Accompagner nos clients dans la digitalisation de leurs processus métier.'],
    ];
}

function content_formations_seed(): array
{
    return [
        ['titre' => 'Introduction à l\'Intelligence Artificielle', 'description' => 'Concepts fondamentaux, cas d\'usage et bonnes pratiques.', 'prix' => '180000', 'duree' => '3 semaines', 'format' => 'en_ligne', 'lieu' => 'En ligne', 'statut' => 'active'],
    ];
}

// ---- Lecture (front + admin) ----

function list_services(): array
{
    return db()->query('SELECT * FROM services ORDER BY sort_order ASC, id ASC')->fetchAll();
}

function list_solutions(): array
{
    return db()->query('SELECT * FROM solutions ORDER BY sort_order ASC, id ASC')->fetchAll();
}

function list_team(): array
{
    return db()->query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC')->fetchAll();
}

function list_news(): array
{
    return db()->query('SELECT * FROM news_posts ORDER BY created_at DESC, id DESC')->fetchAll();
}

function list_formations(): array
{
    return db()->query("SELECT * FROM formations WHERE statut = 'active' ORDER BY id DESC")->fetchAll();
}

function list_formations_all(): array
{
    return db()->query('SELECT * FROM formations ORDER BY id DESC')->fetchAll();
}

function list_jobs(): array
{
    return db()->query("SELECT * FROM jobs WHERE statut = 'active' ORDER BY id DESC")->fetchAll();
}

function list_jobs_all(): array
{
    return db()->query('SELECT * FROM jobs ORDER BY id DESC')->fetchAll();
}

function find_job(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM jobs WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

// ---- Ecriture generique pour l'admin ----

/**
 * @param array<string,mixed> $fields
 */
function content_insert(string $table, array $fields): int
{
    $columns = array_keys($fields);
    $placeholders = array_map(static fn($c) => ':' . $c, $columns);
    $sql = sprintf('INSERT INTO %s (%s, created_at, updated_at) VALUES (%s, NOW(), NOW())', $table, implode(', ', $columns), implode(', ', $placeholders));
    $stmt = db()->prepare($sql);
    $stmt->execute(array_combine($placeholders, array_values($fields)));
    return (int)db()->lastInsertId();
}

/**
 * @param array<string,mixed> $fields
 */
function content_update(string $table, int $id, array $fields): void
{
    $columns = array_keys($fields);
    $set = implode(', ', array_map(static fn($c) => "$c = :$c", $columns));
    $sql = sprintf('UPDATE %s SET %s, updated_at = NOW() WHERE id = :id', $table, $set);
    $params = [];
    foreach ($fields as $k => $v) {
        $params[':' . $k] = $v;
    }
    $params[':id'] = $id;
    db()->prepare($sql)->execute($params);
}

function content_delete(string $table, int $id): void
{
    $stmt = db()->prepare("DELETE FROM {$table} WHERE id = :id");
    $stmt->execute([':id' => $id]);
}
