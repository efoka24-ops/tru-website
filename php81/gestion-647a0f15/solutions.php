<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

admin_require_login('.');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_csrf_check()) {
        $error = 'Session expirée, réessayez.';
    } else {
        $postAction = $_POST['form_action'] ?? '';

        if ($postAction === 'delete') {
            content_delete('solutions', (int)$_POST['id']);
            header('Location: solutions.php');
            exit;
        }

        if ($postAction === 'save') {
            $fields = [
                'name' => trim((string)$_POST['name']),
                'subtitle' => trim((string)$_POST['subtitle']),
                'icon' => trim((string)$_POST['icon']) ?: 'fa-lightbulb',
                'description' => trim((string)$_POST['description']),
                'sort_order' => (int)$_POST['sort_order'],
            ];

            if ($fields['name'] === '') {
                $error = 'Le nom est obligatoire.';
            } else {
                $postId = (int)($_POST['id'] ?? 0);
                if ($postId > 0) {
                    content_update('solutions', $postId, $fields);
                } else {
                    content_insert('solutions', $fields);
                }
                header('Location: solutions.php');
                exit;
            }
        }
    }
}

$editRow = null;
if (($_GET['action'] ?? '') === 'edit' && (int)($_GET['id'] ?? 0) > 0) {
    $stmt = db()->prepare('SELECT * FROM solutions WHERE id = :id');
    $stmt->execute([':id' => (int)$_GET['id']]);
    $editRow = $stmt->fetch() ?: null;
}

$rows = list_solutions();

admin_head('Solutions');
?>
<h2>Solutions</h2>
<?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

<div class="card" style="margin-bottom: 24px;">
    <h3><?= $editRow ? 'Modifier la solution' : 'Ajouter une solution' ?></h3>
    <form method="post">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="form_action" value="save">
        <input type="hidden" name="id" value="<?= (int)($editRow['id'] ?? 0) ?>">
        <div class="field">
            <label>Nom</label>
            <input type="text" name="name" value="<?= htmlspecialchars((string)($editRow['name'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="field">
            <label>Sous-titre</label>
            <input type="text" name="subtitle" value="<?= htmlspecialchars((string)($editRow['subtitle'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Icône (classe Font Awesome)</label>
            <input type="text" name="icon" value="<?= htmlspecialchars((string)($editRow['icon'] ?? 'fa-lightbulb'), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Description</label>
            <textarea name="description" rows="3"><?= htmlspecialchars((string)($editRow['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Ordre d'affichage</label>
            <input type="number" name="sort_order" value="<?= (int)($editRow['sort_order'] ?? 0) ?>">
        </div>
        <button class="btn btn-primary" type="submit"><?= $editRow ? 'Enregistrer' : 'Ajouter' ?></button>
        <?php if ($editRow): ?><a class="btn btn-outline" href="solutions.php">Annuler</a><?php endif; ?>
    </form>
</div>

<table>
    <thead><tr><th>Nom</th><th>Sous-titre</th><th>Ordre</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['name'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['subtitle'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= (int)$row['sort_order'] ?></td>
            <td>
                <a class="btn btn-outline" href="solutions.php?action=edit&id=<?= (int)$row['id'] ?>">Modifier</a>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer cette solution ?');">
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
                    <input type="hidden" name="form_action" value="delete">
                    <input type="hidden" name="id" value="<?= (int)$row['id'] ?>">
                    <button class="btn btn-danger" type="submit">Supprimer</button>
                </form>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
<?php admin_foot(); ?>
