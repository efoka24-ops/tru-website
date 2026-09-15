<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

admin_require_login('.');

$error = '';

function team_handle_photo_upload(): ?string
{
    if (empty($_FILES['photo']['name']) || !is_uploaded_file($_FILES['photo']['tmp_name'])) {
        return null;
    }

    if ($_FILES['photo']['size'] > 3 * 1024 * 1024) {
        throw new RuntimeException('La photo dépasse la taille maximale de 3 Mo.');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $_FILES['photo']['tmp_name']);
    finfo_close($finfo);

    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime])) {
        throw new RuntimeException('La photo doit être une image JPEG, PNG ou WebP.');
    }

    $uploadDir = __DIR__ . '/../uploads/team';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $uploadDir . '/' . $filename)) {
        throw new RuntimeException("Échec de l'enregistrement de la photo.");
    }

    return 'uploads/team/' . $filename;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!admin_csrf_check()) {
        $error = 'Session expirée, réessayez.';
    } else {
        $postAction = $_POST['form_action'] ?? '';

        if ($postAction === 'delete') {
            content_delete('team_members', (int)$_POST['id']);
            header('Location: team.php');
            exit;
        }

        if ($postAction === 'save') {
            try {
                $specialties = array_values(array_filter(array_map('trim', explode("\n", (string)($_POST['specialties'] ?? '')))));
                $fields = [
                    'name' => trim((string)$_POST['name']),
                    'title' => trim((string)$_POST['title']),
                    'bio' => trim((string)$_POST['bio']),
                    'specialties_json' => json_encode($specialties, JSON_UNESCAPED_UNICODE),
                    'sort_order' => (int)$_POST['sort_order'],
                ];

                $uploadedPath = team_handle_photo_upload();
                if ($uploadedPath !== null) {
                    $fields['image'] = $uploadedPath;
                } elseif (trim((string)($_POST['image_url'] ?? '')) !== '') {
                    $fields['image'] = trim((string)$_POST['image_url']);
                }

                if ($fields['name'] === '') {
                    $error = 'Le nom est obligatoire.';
                } else {
                    $postId = (int)($_POST['id'] ?? 0);
                    if ($postId > 0) {
                        content_update('team_members', $postId, $fields);
                    } else {
                        content_insert('team_members', $fields);
                    }
                    header('Location: team.php');
                    exit;
                }
            } catch (RuntimeException $e) {
                $error = $e->getMessage();
            }
        }
    }
}

$editRow = null;
if (($_GET['action'] ?? '') === 'edit' && (int)($_GET['id'] ?? 0) > 0) {
    $stmt = db()->prepare('SELECT * FROM team_members WHERE id = :id');
    $stmt->execute([':id' => (int)$_GET['id']]);
    $editRow = $stmt->fetch() ?: null;
}

$rows = list_team();

admin_head('Équipe');
?>
<h2>Équipe</h2>
<?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>

<div class="card" style="margin-bottom: 24px;">
    <h3><?= $editRow ? 'Modifier le membre' : 'Ajouter un membre' ?></h3>
    <form method="post" enctype="multipart/form-data">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
        <input type="hidden" name="form_action" value="save">
        <input type="hidden" name="id" value="<?= (int)($editRow['id'] ?? 0) ?>">
        <div class="field">
            <label>Nom</label>
            <input type="text" name="name" value="<?= htmlspecialchars((string)($editRow['name'] ?? ''), ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="field">
            <label>Poste / Titre</label>
            <input type="text" name="title" value="<?= htmlspecialchars((string)($editRow['title'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="field">
            <label>Bio</label>
            <textarea name="bio" rows="3"><?= htmlspecialchars((string)($editRow['bio'] ?? ''), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <?php if (!empty($editRow['image'])): ?>
            <div class="field">
                <label>Photo actuelle</label>
                <img src="<?= str_starts_with((string)$editRow['image'], 'http') ? htmlspecialchars((string)$editRow['image'], ENT_QUOTES, 'UTF-8') : '../' . htmlspecialchars((string)$editRow['image'], ENT_QUOTES, 'UTF-8') ?>" alt="" style="width:96px;height:96px;border-radius:50%;object-fit:cover;">
            </div>
        <?php endif; ?>
        <div class="field">
            <label>Nouvelle photo (JPEG/PNG/WebP, max 3 Mo)</label>
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp">
        </div>
        <div class="field">
            <label>Ou URL d'image (utilisée si aucun fichier n'est envoyé)</label>
            <input type="text" name="image_url" value="<?= htmlspecialchars(str_starts_with((string)($editRow['image'] ?? ''), 'http') ? (string)$editRow['image'] : '', ENT_QUOTES, 'UTF-8') ?>" placeholder="https://...">
        </div>
        <div class="field">
            <label>Spécialités (une par ligne)</label>
            <textarea name="specialties" rows="3"><?= htmlspecialchars(implode("\n", decode_json_list($editRow['specialties_json'] ?? null)), ENT_QUOTES, 'UTF-8') ?></textarea>
        </div>
        <div class="field">
            <label>Ordre d'affichage</label>
            <input type="number" name="sort_order" value="<?= (int)($editRow['sort_order'] ?? 0) ?>">
        </div>
        <button class="btn btn-primary" type="submit"><?= $editRow ? 'Enregistrer' : 'Ajouter' ?></button>
        <?php if ($editRow): ?><a class="btn btn-outline" href="team.php">Annuler</a><?php endif; ?>
    </form>
</div>

<table>
    <thead><tr><th>Photo</th><th>Nom</th><th>Titre</th><th>Ordre</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $row): ?>
        <tr>
            <td>
                <?php if (!empty($row['image'])): ?>
                    <img src="<?= str_starts_with((string)$row['image'], 'http') ? htmlspecialchars((string)$row['image'], ENT_QUOTES, 'UTF-8') : '../' . htmlspecialchars((string)$row['image'], ENT_QUOTES, 'UTF-8') ?>" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
                <?php else: ?>
                    <span class="muted">—</span>
                <?php endif; ?>
            </td>
            <td><?= htmlspecialchars((string)$row['name'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= htmlspecialchars((string)$row['title'], ENT_QUOTES, 'UTF-8') ?></td>
            <td><?= (int)$row['sort_order'] ?></td>
            <td>
                <a class="btn btn-outline" href="team.php?action=edit&id=<?= (int)$row['id'] ?>">Modifier</a>
                <form class="inline" method="post" onsubmit="return confirm('Supprimer ce membre ?');">
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
