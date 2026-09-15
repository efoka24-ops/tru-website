<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';

$pdo = db();
$existing = (int)$pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();

if ($existing > 0) {
    admin_head('Configuration');
    ?>
    <div class="card" style="margin: 60px auto;">
        <p class="alert error">Un compte administrateur existe déjà. Cette page de configuration initiale est désactivée.</p>
        <p><a class="btn btn-primary" href="login.php">Aller à la connexion</a></p>
    </div>
    <?php
    admin_foot();
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $confirm = (string)($_POST['confirm'] ?? '');

    if (strlen($username) < 3) {
        $error = "L'identifiant doit contenir au moins 3 caractères.";
    } elseif (strlen($password) < 10) {
        $error = 'Le mot de passe doit contenir au moins 10 caractères.';
    } elseif ($password !== $confirm) {
        $error = 'Les deux mots de passe ne correspondent pas.';
    } else {
        $stmt = $pdo->prepare('INSERT INTO admin_users (username, password_hash, created_at) VALUES (:u, :h, NOW())');
        $stmt->execute([':u' => $username, ':h' => password_hash($password, PASSWORD_BCRYPT)]);

        admin_head('Configuration');
        ?>
        <div class="card" style="margin: 60px auto;">
            <p class="alert success">Compte administrateur créé avec succès.</p>
            <p><a class="btn btn-primary" href="login.php">Se connecter</a></p>
        </div>
        <?php
        admin_foot();
        exit;
    }
}

admin_head('Configuration initiale');
?>
<div class="card" style="margin: 60px auto;">
    <h2>Créer le compte administrateur</h2>
    <p class="muted">Cette page n'apparaît qu'une seule fois, tant qu'aucun compte n'existe.</p>
    <?php if ($error !== ''): ?><p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <form method="post">
        <div class="field">
            <label>Identifiant</label>
            <input type="text" name="username" required minlength="3">
        </div>
        <div class="field">
            <label>Mot de passe (10 caractères minimum)</label>
            <input type="password" name="password" required minlength="10">
        </div>
        <div class="field">
            <label>Confirmer le mot de passe</label>
            <input type="password" name="confirm" required minlength="10">
        </div>
        <button class="btn btn-primary" type="submit">Créer le compte</button>
    </form>
</div>
<?php admin_foot(); ?>
