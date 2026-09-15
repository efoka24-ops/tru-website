<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

admin_require_login('.');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['form_action'] ?? '') === 'delete') {
    if (admin_csrf_check()) {
        content_delete('job_applications', (int)$_POST['id']);
    }
    header('Location: applications.php');
    exit;
}

$rows = db()->query('SELECT * FROM job_applications ORDER BY created_at DESC')->fetchAll();

admin_head('Candidatures');
?>
<h2>Candidatures reçues</h2>
<table>
    <thead><tr><th>Date</th><th>Poste</th><th>Candidat</th><th>Contact</th><th>CV</th><th>Message</th><th>WhatsApp</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['created_at'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['job_title'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars($row['first_name'] . ' ' . $row['last_name'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['email'], ENT_QUOTES, 'UTF-8') ?><br><span class="muted"><?= htmlspecialchars((string)$row['phone'], ENT_QUOTES, 'UTF-8') ?></span></td>
            <td><?php if (!empty($row['cv_path'])): ?><a href="../<?= htmlspecialchars((string)$row['cv_path'], ENT_QUOTES, 'UTF-8') ?>" target="_blank">Voir le CV</a><?php else: ?><span class="muted">—</span><?php endif; ?></td>
            <td><?= nl2br(htmlspecialchars(mb_strimwidth((string)$row['message'], 0, 120, '…'), ENT_QUOTES, 'UTF-8')) ?></td>
            <td><?= $row['whatsapp_notified_at'] ? 'Envoyée' : 'Non envoyée' ?></td>
            <td>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer cette candidature ?');">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                    <input type="hidden" name="form_action" value="delete">
                    <input type="hidden" name="id" value="<?= (int)$row['id'] ?>">
                    <button class="btn btn-danger" type="submit">Supprimer</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if ($rows === []): ?>
        <tr><td colspan="8" class="muted">Aucune candidature pour le moment.</td></tr>
    <?php endif; ?>
    </tbody>
</table>
<?php admin_foot(); ?>
