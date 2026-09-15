<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Notre Équipe</h1>
        <p>Une équipe pluridisciplinaire passionnée par l'innovation et le développement.</p>
    </div>
</section>

<section class="section container">
    <div class="cards three">
        <?php foreach ($team as $member): ?>
            <article class="card">
                <?php if (!empty($member['image'])): ?>
                    <img class="avatar" src="<?= e($member['image']) ?>" alt="<?= e($member['name']) ?>">
                <?php endif; ?>
                <i class="fa-solid fa-user-tie"></i>
                <h3><?= e($member['name']) ?></h3>
                <p><strong><?= e($member['title']) ?></strong></p>
                <p><?= e($member['bio']) ?></p>
                <?php if (!empty($member['specialties']) && is_array($member['specialties'])): ?>
                    <div class="tags">
                        <?php foreach ($member['specialties'] as $spec): ?>
                            <span><?= e((string)$spec) ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </article>
        <?php endforeach; ?>
    </div>
</section>
