<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';
require_once __DIR__ . '/../includes/content.php';

if (admin_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    // Anti-bruteforce basique : petite pause a chaque tentative.
    usleep(300000);

    if (admin_attempt_login($username, $password)) {
        header('Location: index.php');
        exit;
    }

    $error = 'Identifiants incorrects.';
}

admin_head('Connexion');
?>
<div class="card" style="margin: 60px auto;">
    <h2>Connexion back-office</h2>
    <?php if ($error !== ''): ?>
        <p class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
    <?php endif; ?>
    <form method="post">
        <div class="field">
            <label for="username">Identifiant</label>
            <input type="text" id="username" name="username" required autofocus>
        </div>
        <div class="field">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
        </div>
        <button class="btn btn-primary" type="submit">Se connecter</button>
    </form>
</div>
<?php admin_foot(); ?>
