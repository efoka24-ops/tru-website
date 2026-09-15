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
            content_delete('jobs', (int)$_POST['id']);
            header('Location: jobs.php');
            exit;
        }

        if ($postAction === 'save') {
            $fields = [
                'title' => trim((string)$_POST['title']),
                'location' => trim((string)$_POST['location']),
                'type' => trim((string)$_POST['type']),
                'description' => trim((string)$_POST['description']),
                'statut' => in_array($_POST['statut'] ?? '', ['active', 'inactive'], true) ? $_POST['statut'] : 'active',
            ];

            if ($fields['title'] === '') {
                $error = 'Le titre est obligatoire.';
            } else {
                $postId = (int)($_POST['id'] ?? 0);
                if ($postId > 0) {
                    content_update('jobs', $postId, $fields);
                } else {
                    content_insert('jobs', $fields);
                }
                header('Location: jobs.php');
                exit;
            }
        }
    }
}

$editRow = null;
if (($_GET['action'] ?? '') === 'edit' && (int)($_GET['id'] ?? 0) > 0) {
    $stmt = db()->prepare('SELECT * FROM jobs WHERE id = :id');
    $stmt->execute([':id' => (int)$_GET['id']]);
    $editRow = $stmt->fetch() ?: null;
}

$rows = list_jobs_all();

admin_head("Offres d'emploi");
?>
<h2>Offres d'emploi</h2>
<?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

<div class="card" style="margin-bottom: 24px;">
    <h3><?= $editRow ? "Modifier l'offre" : 'Ajouter une offre' ?></h3>
    <form method="post">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="form_action" value="save">
        <input type="hidden" name="id" value="<?= (int)($editRow['id'] ?? 0) ?>">
        <div class="field">
            <label>Titre du poste</label>
            <input type="text" name="title" value="<?= htmlspecialchars((string)($editRow['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="field">
            <label>Localisation</label>
            <input type="text" name="location" value="<?= htmlspecialchars((string)($editRow['location'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Type de contrat</label>
            <input type="text" name="type" value="<?= htmlspecialchars((string)($editRow['type'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" placeholder="Temps plein / Stage / Freelance">
        </div>
        <div class="field">
            <label>Description</label>
            <textarea name="description" rows="4"><?= htmlspecialchars((string)($editRow['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Statut</label>
            <select name="statut">
                <option value="active" <?= ($editRow['statut'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active (visible sur le site)</option>
                <option value="inactive" <?= ($editRow['statut'] ?? '') === 'inactive' ? 'selected' : '' ?>>Inactive (masquée)</option>
            </select>
        </div>
        <button class="btn btn-primary" type="submit"><?= $editRow ? 'Enregistrer' : 'Ajouter' ?></button>
        <?php if ($editRow): ?><a class="btn btn-outline" href="jobs.php">Annuler</a><?php endif; ?>
    </form>
</div>

<table>
    <thead><tr><th>Titre</th><th>Localisation</th><th>Statut</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['title'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['location'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['statut'], ENT_QUOTES, 'UTF-8') ?></td>
            <td>
                <a class="btn btn-outline" href="jobs.php?action=edit&id=<?= (int)$row['id'] ?>">Modifier</a>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer cette offre ?');">
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
