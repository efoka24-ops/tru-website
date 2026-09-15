<?php require_once __DIR__ . '/../includes/data.php'; ?>
<section class="hero">
    <div class="container hero-content">
        <p class="badge"><i class="fa-solid fa-sparkles"></i> Au cœur de l'innovation</p>
        <h1>Innovation digitale adaptée à l'Afrique</h1>
        <p>Nous accompagnons les institutions, entreprises et communautés dans leur transition numérique grâce à des solutions technologiques innovantes.</p>
        <div class="hero-actions">
            <a class="btn btn-primary" href="index.php?page=services">Découvrir nos services</a>
            <a class="btn btn-outline" href="index.php?page=contact">Nous contacter</a>
        </div>
    </div>
</section>

<section class="section container">
    <div class="cards three">
        <article class="card">
            <i class="fa-solid fa-lightbulb"></i>
            <h3>Notre mission</h3>
            <p>Rendre le digital accessible, utile et durable pour tous.</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-users"></i>
            <h3>Notre force</h3>
            <p>Allier expertise organisationnelle et ingénierie digitale.</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-globe"></i>
            <h3>Notre vision</h3>
            <p>Devenir le cabinet de référence en Afrique francophone.</p>
        </article>
    </div>
</section>

<section class="section container">
    <h2>Nos domaines d'excellence</h2>
    <p class="section-subtitle">Une expertise complète pour accompagner votre transformation</p>
    <div class="cards three">
        <article class="card">
            <i class="fa-solid fa-building"></i>
            <h3>Conseil en organisation</h3>
            <p>Audit et optimisation des processus</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-mobile-screen-button"></i>
            <h3>Transformation digitale</h3>
            <p>E-administration et solutions numériques</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-users"></i>
            <h3>Développement web &amp; mobile</h3>
            <p>Applications sur mesure</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-sparkles"></i>
            <h3>Télémédecine vétérinaire</h3>
            <p>MokineVeto pour les éleveurs</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-globe"></i>
            <h3>Traçabilité &amp; IoT</h3>
            <p>Mokine et MokineKid</p>
        </article>
        <article class="card">
            <i class="fa-solid fa-graduation-cap"></i>
            <h3>Formation</h3>
            <p>Renforcement des capacités</p>
        </article>
    </div>
</section>

<section class="section section-dark">
    <div class="container">
        <h2>Nos solutions innovantes</h2>
        <p class="section-subtitle">Des technologies conçues pour les réalités africaines</p>
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

<section class="section section-cta">
    <div class="container hero-content">
        <h2>Prêt à transformer votre organisation ?</h2>
        <p>Discutons ensemble de vos besoins et trouvons la solution adaptée à vos enjeux.</p>
        <a class="btn btn-dark" href="index.php?page=contact">Contactez-nous</a>
    </div>
</section>
