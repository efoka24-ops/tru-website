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
            content_delete('news_posts', (int)$_POST['id']);
            header('Location: news.php');
            exit;
        }

        if ($postAction === 'save') {
            $fields = [
                'title' => trim((string)$_POST['title']),
                'category' => trim((string)$_POST['category']),
                'description' => trim((string)$_POST['description']),
                'content' => trim((string)$_POST['content']),
            ];

            if ($fields['title'] === '') {
                $error = 'Le titre est obligatoire.';
            } else {
                $postId = (int)($_POST['id'] ?? 0);
                if ($postId > 0) {
                    content_update('news_posts', $postId, $fields);
                } else {
                    content_insert('news_posts', $fields);
                }
                header('Location: news.php');
                exit;
            }
        }
    }
}

$editRow = null;
if (($_GET['action'] ?? '') === 'edit' && (int)($_GET['id'] ?? 0) > 0) {
    $stmt = db()->prepare('SELECT * FROM news_posts WHERE id = :id');
    $stmt->execute([':id' => (int)$_GET['id']]);
    $editRow = $stmt->fetch() ?: null;
}

$rows = list_news();

admin_head('Actualités');
?>
<h2>Actualités</h2>
<?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

<div class="card" style="margin-bottom: 24px;">
    <h3><?= $editRow ? 'Modifier l\'actualité' : 'Ajouter une actualité' ?></h3>
    <form method="post">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="form_action" value="save">
        <input type="hidden" name="id" value="<?= (int)($editRow['id'] ?? 0) ?>">
        <div class="field">
            <label>Titre</label>
            <input type="text" name="title" value="<?= htmlspecialchars((string)($editRow['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="field">
            <label>Catégorie</label>
            <input type="text" name="category" value="<?= htmlspecialchars((string)($editRow['category'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Résumé</label>
            <textarea name="description" rows="2"><?= htmlspecialchars((string)($editRow['description'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Contenu complet</label>
            <textarea name="content" rows="6"><?= htmlspecialchars((string)($editRow['content'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <button class="btn btn-primary" type="submit"><?= $editRow ? 'Enregistrer' : 'Ajouter' ?></button>
        <?php if ($editRow): ?><a class="btn btn-outline" href="news.php">Annuler</a><?php endif; ?>
    </form>
</div>

<table>
    <thead><tr><th>Titre</th><th>Catégorie</th><th>Date</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td><?= htmlspecialchars((string)$row['title'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['category'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['created_at'], ENT_QUOTES, 'UTF-8') ?></td>
            <td>
                <a class="btn btn-outline" href="news.php?action=edit&id=<?= (int)$row['id'] ?>">Modifier</a>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer cette actualité ?');">
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
