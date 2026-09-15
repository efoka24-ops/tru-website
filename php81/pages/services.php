<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Nos Services</h1>
        <p>Des solutions complètes et innovantes pour transformer votre vision en réalité.</p>
    </div>
</section>

<section class="section container">
    <div class="cards three">
        <?php foreach ($services as $service): ?>
            <article class="card">
                <?php if (!empty($service['image_url'])): ?>
                    <img class="card-cover" src="<?= e($service['image_url']) ?>" alt="<?= e($service['title']) ?>">
                <?php endif; ?>
                <i class="fa-solid <?= e($service['icon']) ?>"></i>
                <h3><?= e($service['title']) ?></h3>
                <p><?= e($service['description']) ?></p>
                <?php if (!empty($service['objective'])): ?>
                    <p class="objective"><strong>Objectif:</strong> <?= e($service['objective']) ?></p>
                <?php endif; ?>
                <ul>
                    <?php foreach ($service['features'] as $feature): ?>
                        <li><i class="fa-solid fa-check"></i> <?= e($feature) ?></li>
                    <?php endforeach; ?>
                </ul>
            </article>
        <?php endforeach; ?>
    </div>
</section>
