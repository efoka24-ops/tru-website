<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Formations</h1>
        <p>Programmes de renforcement de compétences adaptés aux besoins du marché.</p>
    </div>
</section>

<section class="section container">
    <div class="cards two">
        <?php foreach ($formations as $formation): ?>
            <?php if (($formation['statut'] ?? 'active') !== 'active') { continue; } ?>
            <article class="card">
                <h3><?= e($formation['titre']) ?></h3>
                <p><?= e($formation['description']) ?></p>
                <ul>
                    <li><i class="fa-solid fa-clock"></i> Durée : <?= e($formation['duree']) ?></li>
                    <li><i class="fa-solid fa-laptop"></i> Format : <?= e($formation['format']) ?></li>
                    <li><i class="fa-solid fa-location-dot"></i> Lieu : <?= e($formation['lieu']) ?></li>
                    <li><i class="fa-solid fa-money-bill-wave"></i> Prix : <?= e(number_format((float)$formation['prix'], 0, ',', ' ')) ?> FCFA</li>
                </ul>
            </article>
        <?php endforeach; ?>
    </div>
</section>
