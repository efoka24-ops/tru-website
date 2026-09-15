<?php
require_once __DIR__ . '/../includes/data.php';

$applyStatus = $_GET['apply_status'] ?? '';
$applyError = $_GET['apply_error'] ?? '';
$preselectJobId = (int)($_GET['job_id'] ?? 0);
?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Rejoignez notre équipe</h1>
        <p>Découvrez les opportunités de carrière chez TRU GROUP.</p>
    </div>
</section>

<section class="section container">
    <div class="cards two">
        <?php foreach ($jobs as $job): ?>
            <article class="card">
                <h3><?= e($job['title']) ?></h3>
                <p><?= e($job['description']) ?></p>
                <ul>
                    <li><i class="fa-solid fa-location-dot"></i> <?= e($job['location'] ?: 'Localisation à confirmer') ?></li>
                    <li><i class="fa-solid fa-briefcase"></i> <?= e($job['type'] ?: 'Type à confirmer') ?></li>
                </ul>
                <a class="btn btn-primary" href="#candidature-<?= e((string)$job['id']) ?>">Postuler</a>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<section class="section container" id="candidature-<?= e((string)$preselectJobId) ?>">
    <div class="card" style="max-width: 640px; margin: 0 auto;">
        <h2>Postuler à une offre</h2>

        <?php if ($applyStatus === 'ok'): ?>
            <p class="alert success"><i class="fa-solid fa-circle-check"></i> Candidature envoyée avec succès. Nous reviendrons vers vous rapidement.</p>
        <?php endif; ?>
        <?php if ($applyError !== ''): ?>
            <p class="alert error"><i class="fa-solid fa-triangle-exclamation"></i> <?= e($applyError) ?></p>
        <?php endif; ?>

        <form method="post" action="actions/apply_submit.php" enctype="multipart/form-data" class="contact-form">
            <label>Poste concerné
                <select name="job_id">
                    <option value="">Candidature spontanée</option>
                    <?php foreach ($jobs as $job): ?>
                        <option value="<?= e((string)$job['id']) ?>" <?= $preselectJobId === $job['id'] ? 'selected' : '' ?>><?= e($job['title']) ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label>Prénom
                <input type="text" name="first_name" required>
            </label>
            <label>Nom
                <input type="text" name="last_name" required>
            </label>
            <label>Email
                <input type="email" name="email" required>
            </label>
            <label>Téléphone
                <input type="text" name="phone">
            </label>
            <label>CV (PDF, max 5 Mo)
                <input type="file" name="cv" accept="application/pdf">
            </label>
            <label>Message
                <textarea name="message" rows="4"></textarea>
            </label>
            <button class="btn btn-primary" type="submit">Envoyer ma candidature</button>
        </form>
    </div>
</section>
