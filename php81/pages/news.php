<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Actualités</h1>
        <p>Retrouvez les dernières nouvelles de TRU GROUP.</p>
    </div>
</section>

<section class="section container">
    <div class="cards two">
        <?php foreach ($news as $item): ?>
            <article class="card">
                <h3><?= e($item['title']) ?></h3>
                <?php if (!empty($item['category'])): ?>
                    <p class="chip"><?= e($item['category']) ?></p>
                <?php endif; ?>
                <p><?= e($item['description']) ?></p>
                <?php if (!empty($item['content'])): ?>
                    <details>
                        <summary>Lire plus</summary>
                        <p><?= e($item['content']) ?></p>
                    </details>
                <?php endif; ?>
                <small class="date"><?= e(date('d/m/Y', strtotime((string)$item['created_at']))) ?></small>
            </article>
        <?php endforeach; ?>
    </div>
</section>
