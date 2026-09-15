<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

admin_require_login('.');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['form_action'] ?? '') === 'delete') {
    if (admin_csrf_check()) {
        content_delete('contact_messages', (int)$_POST['id']);
    }
    header('Location: messages.php');
    exit;
}

$rows = db()->query('SELECT * FROM contact_messages ORDER BY created_at DESC')->fetchAll();

admin_head('Messages de contact');
?>
<h2>Messages de contact</h2>
<table>
    <thead><tr><th>Date</th><th>Nom</th><th>Contact</th><th>Sujet</th><th>Message</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['created_at'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['full_name'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['email'], ENT_QUOTES, 'UTF-8') ?><br><span class="muted"><?= htmlspecialchars((string)$row['phone'], ENT_QUOTES, 'UTF-8') ?></span></td>
            <td><?= htmlspecialchars((string)$row['subject'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= nl2br(htmlspecialchars(mb_strimwidth((string)$row['message'], 0, 160, '…'), ENT_QUOTES, 'UTF-8')) ?></td>
            <td>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer ce message ?');">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                    <input type="hidden" name="form_action" value="delete">
                    <input type="hidden" name="id" value="<?= (int)$row['id'] ?>">
                    <button class="btn btn-danger" type="submit">Supprimer</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    <?php if ($rows === []): ?>
        <tr><td colspan="6" class="muted">Aucun message pour le moment.</td></tr>
    <?php endif; ?>
    </tbody>
</table>
<?php admin_foot(); ?>
