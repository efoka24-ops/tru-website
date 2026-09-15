<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

admin_require_login('.');

$action = $_GET['action'] ?? 'list';
$id = (int)($_GET['id'] ?? 0);
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_csrf_check()) {
        $error = 'Session expirée, réessayez.';
    } else {
        $postAction = $_POST['form_action'] ?? '';

        if ($postAction === 'delete') {
            content_delete('services', (int)$_POST['id']);
            header('Location: services.php');
            exit;
        }

        if ($postAction === 'save') {
            $features = array_values(array_filter(array_map('trim', explode("\n", (string)($_POST['features'] ?? '')))));
            $fields = [
                'title' => trim((string)$_POST['title']),
                'icon' => trim((string)$_POST['icon']) ?: 'fa-briefcase',
                'description' => trim((string)$_POST['description']),
                'objective' => trim((string)$_POST['objective']),
                'features_json' => json_encode($features, JSON_UNESCAPED_UNICODE),
                'sort_order' => (int)$_POST['sort_order'],
            ];

            if ($fields['title'] === '') {
                $error = 'Le titre est obligatoire.';
            } else {
                $postId = (int)($_POST['id'] ?? 0);
                if ($postId > 0) {
                    content_update('services', $postId, $fields);
                } else {
                    content_insert('services', $fields);
                }
                header('Location: services.php');
                exit;
            }
        }
    }
}

$editRow = null;
if ($action === 'edit' && $id > 0) {
    $stmt = db()->prepare('SELECT * FROM services WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $editRow = $stmt->fetch() ?: null;
}

$rows = list_services();

admin_head('Services');
?>
<h2>Services</h2>
<?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

<div class="card" style="margin-bottom: 24px;">
    <h3><?= $editRow ? 'Modifier le service' : 'Ajouter un service' ?></h3>
    <form method="post">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="form_action" value="save">
        <input type="hidden" name="id" value="<?= (int)($editRow['id'] ?? 0) ?>">
        <div class="field">
            <label>Titre</label>
            <input type="text" name="title" value="<?= htmlspecialchars((string)($editRow['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="field">
            <label>Icône (classe Font Awesome, ex: fa-building)</label>
            <input type="text" name="icon" value="<?= htmlspecialchars((string)($editRow['icon'] ?? 'fa-briefcase'), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Description</label>
            <textarea name="description" rows="3"><?= htmlspecialchars((string)($editRow['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Objectif (optionnel)</label>
            <textarea name="objective" rows="2"><?= htmlspecialchars((string)($editRow['objective'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Fonctionnalités (une par ligne)</label>
            <textarea name="features" rows="4"><?= htmlspecialchars(implode("\n", decode_json_list($editRow['features_json'] ?? null)), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Ordre d'affichage</label>
            <input type="number" name="sort_order" value="<?= (int)($editRow['sort_order'] ?? 0) ?>">
        </div>
        <button class="btn btn-primary" type="submit"><?= $editRow ? 'Enregistrer' : 'Ajouter' ?></button>
        <?php if ($editRow): ?><a class="btn btn-outline" href="services.php">Annuler</a><?php endif; ?>
    </form>
</div>

<table>
    <thead><tr><th>Titre</th><th>Description</th><th>Ordre</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['title'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars(mb_strimwidth((string)$row['description'], 0, 80, '…'), ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= (int)$row['sort_order'] ?></td>
            <td>
                <a class="btn btn-outline" href="services.php?action=edit&id=<?= (int)$row['id'] ?>">Modifier</a>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer ce service ?');">
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
