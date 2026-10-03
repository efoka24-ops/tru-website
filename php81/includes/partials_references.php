<?php require_once __DIR__ . '/references.php'; ?>
<section class="section container">
    <h2>Ils nous ont fait confiance</h2>
    <p class="section-subtitle">Des institutions et organisations qui ont travaillé avec TRU GROUP</p>
    <div class="partners-grid">
        <?php foreach (references_partners() as $partner): ?>
            <?php $logo = partner_logo_url($partner['slug']); ?>
            <div class="partner">
                <?php if ($logo !== null): ?>
                    <img class="partner-logo" src="<?= e($logo) ?>" alt="Logo <?= e($partner['name']) ?>" loading="lazy">
                <?php else: ?>
                    <span class="partner-monogram" aria-hidden="true"><?= e($partner['initials']) ?></span>
                <?php endif; ?>
                <strong><?= e($partner['name']) ?></strong>
                <small><?= e($partner['sector']) ?></small>
            </div>
        <?php endforeach; ?>
    </div>
</section>

<section class="section container">
    <h2>Nos produits en production</h2>
    <p class="section-subtitle">Des plateformes conçues et opérées par TRU GROUP, accessibles en ligne</p>
    <div class="cards four">
        <?php foreach (references_products() as $product): ?>
            <article class="card product-card">
                <i class="fa-solid <?= e($product['icon']) ?>"></i>
                <h3><?= e($product['name']) ?></h3>
                <p><?= e($product['description']) ?></p>
                <a class="product-link" href="<?= e($product['url']) ?>" target="_blank" rel="noopener">
                    <?= e(preg_replace('#^https?://|/$#', '', $product['url'])) ?> <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </article>
        <?php endforeach; ?>
    </div>
</section>
