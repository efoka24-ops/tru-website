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
            content_delete('formations', (int)$_POST['id']);
            header('Location: formations.php');
            exit;
        }

        if ($postAction === 'save') {
            $fields = [
                'titre' => trim((string)$_POST['titre']),
                'description' => trim((string)$_POST['description']),
                'prix' => (float)str_replace([' ', ','], ['', '.'], (string)$_POST['prix']),
                'duree' => trim((string)$_POST['duree']),
                'format' => trim((string)$_POST['format']),
                'lieu' => trim((string)$_POST['lieu']),
                'statut' => in_array($_POST['statut'] ?? '', ['active', 'inactive'], true) ? $_POST['statut'] : 'active',
            ];

            if ($fields['titre'] === '') {
                $error = 'Le titre est obligatoire.';
            } else {
                $postId = (int)($_POST['id'] ?? 0);
                if ($postId > 0) {
                    content_update('formations', $postId, $fields);
                } else {
                    content_insert('formations', $fields);
                }
                header('Location: formations.php');
                exit;
            }
        }
    }
}

$editRow = null;
if (($_GET['action'] ?? '') === 'edit' && (int)($_GET['id'] ?? 0) > 0) {
    $stmt = db()->prepare('SELECT * FROM formations WHERE id = :id');
    $stmt->execute([':id' => (int)$_GET['id']]);
    $editRow = $stmt->fetch() ?: null;
}

$rows = list_formations_all();

admin_head('Formations');
?>
<h2>Formations</h2>
<?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

<div class="card" style="margin-bottom: 24px;">
    <h3><?= $editRow ? 'Modifier la formation' : 'Ajouter une formation' ?></h3>
    <form method="post">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="form_action" value="save">
        <input type="hidden" name="id" value="<?= (int)($editRow['id'] ?? 0) ?>">
        <div class="field">
            <label>Titre</label>
            <input type="text" name="titre" value="<?= htmlspecialchars((string)($editRow['titre'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="field">
            <label>Description</label>
            <textarea name="description" rows="3"><?= htmlspecialchars((string)($editRow['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Prix (FCFA)</label>
            <input type="text" name="prix" value="<?= htmlspecialchars((string)($editRow['prix'] ?? '0'), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Durée</label>
            <input type="text" name="duree" value="<?= htmlspecialchars((string)($editRow['duree'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Format</label>
            <input type="text" name="format" value="<?= htmlspecialchars((string)($editRow['format'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" placeholder="en_ligne / presentiel">
        </div>
        <div class="field">
            <label>Lieu</label>
            <input type="text" name="lieu" value="<?= htmlspecialchars((string)($editRow['lieu'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Statut</label>
            <select name="statut">
                <option value="active" <?= ($editRow['statut'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active (visible sur le site)</option>
                <option value="inactive" <?= ($editRow['statut'] ?? '') === 'inactive' ? 'selected' : '' ?>>Inactive (masquée)</option>
            </select>
        </div>
        <button class="btn btn-primary" type="submit"><?= $editRow ? 'Enregistrer' : 'Ajouter' ?></button>
        <?php if ($editRow): ?><a class="btn btn-outline" href="formations.php">Annuler</a><?php endif; ?>
    </form>
</div>

<table>
    <thead><tr><th>Titre</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['titre'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= number_format((float)$row['prix'], 0, ',', ' ') ?> FCFA</td>
            <td><?= htmlspecialchars((string)$row['statut'], ENT_QUOTES, 'UTF-8') ?></td>
            <td>
                <a class="btn btn-outline" href="formations.php?action=edit&id=<?= (int)$row['id'] ?>">Modifier</a>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer cette formation ?');">
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
