<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero">
    <div class="container hero-content">
        <p class="badge"><i class="fa-solid fa-sparkles"></i> Au cœur de l'innovation</p>
        <h1>Innovation digitale adaptée à l'Afrique</h1>
        <p>Nous accompagnons institutions, entreprises et communautés dans leur transition numérique.</p>
        <div class="hero-actions">
            <a class="btn btn-primary" href="index.php?page=services">Découvrir nos services</a>
            <a class="btn btn-outline" href="index.php?page=contact">Nous contacter</a>
        </div>
    </div>
</section>

<section class="section container">
    <h2>Nos domaines d'excellence</h2>
    <div class="cards three">
        <article class="card">
            <i class="fa-solid fa-lightbulb"></i>
            <h3>Mission</h3>
            <p>Rendre le digital accessible, utile et durable pour tous.</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-users"></i>
            <h3>Force</h3>
            <p>Allier expertise organisationnelle et ingénierie digitale.</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-globe"></i>
            <h3>Vision</h3>
            <p>Devenir un cabinet de référence en Afrique francophone.</p>
        </article>
    </div>
</section>

<section class="section section-dark">
    <div class="container">
        <h2>Solutions innovantes</h2>
        <div class="cards three">
            <?php foreach ($solutions as $solution): ?>
                <article class="card card-dark">
                    <i class="fa-solid <?= e($solution['icon']) ?>"></i>
                    <h3><?= e($solution['name']) ?></h3>
                    <p><strong><?= e($solution['subtitle']) ?></strong></p>
                    <p><?= e($solution['description']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>

        <div class="quick-links">
            <a class="btn btn-outline" href="index.php?page=formations">Voir les formations</a>
            <a class="btn btn-outline" href="index.php?page=news">Lire les actualités</a>
            <a class="btn btn-outline" href="index.php?page=careers">Découvrir les carrières</a>
            <a class="btn btn-outline" href="index.php?page=projects">Nos projets</a>
        </div>
    </div>
</section>
