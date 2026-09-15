<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

admin_require_login('.');
content_seed_if_empty();

$pdo = db();
$counts = [
    'Services' => (int)$pdo->query('SELECT COUNT(*) FROM services')->fetchColumn(),
    'Solutions' => (int)$pdo->query('SELECT COUNT(*) FROM solutions')->fetchColumn(),
    'Membres équipe' => (int)$pdo->query('SELECT COUNT(*) FROM team_members')->fetchColumn(),
    'Actualités' => (int)$pdo->query('SELECT COUNT(*) FROM news_posts')->fetchColumn(),
    'Formations' => (int)$pdo->query('SELECT COUNT(*) FROM formations')->fetchColumn(),
    'Offres d\'emploi' => (int)$pdo->query('SELECT COUNT(*) FROM jobs')->fetchColumn(),
    'Candidatures reçues' => (int)$pdo->query('SELECT COUNT(*) FROM job_applications')->fetchColumn(),
    'Messages de contact' => (int)$pdo->query('SELECT COUNT(*) FROM contact_messages')->fetchColumn(),
];

admin_head('Tableau de bord');
?>
<h2>Tableau de bord</h2>
<p class="muted">Vue d'ensemble du contenu du site TRU GROUP.</p>
<table>
    <thead><tr><th>Contenu</th><th>Nombre</th></tr></thead>
    <tbody>
        <?php foreach ($counts as $label => $count): ?>
            <tr><td><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></td><td><?= $count ?></td></tr>
        <?php endforeach; ?>
    </tbody>
</table>
<?php admin_foot(); ?>
