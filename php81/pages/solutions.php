<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Nos Solutions</h1>
        <p>Des approches globales et intégrées pour résoudre vos défis stratégiques.</p>
    </div>
</section>

<section class="section container">
    <div class="cards three">
        <?php foreach ($solutions as $solution): ?>
            <article class="card">
                <i class="fa-solid <?= e($solution['icon']) ?>"></i>
                <h3><?= e($solution['name']) ?></h3>
                <p><strong><?= e($solution['subtitle']) ?></strong></p>
                <p><?= e($solution['description']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>
