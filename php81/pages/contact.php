<?php
$status = $_GET['status'] ?? '';
$error = $_GET['error'] ?? '';
?>
<section class="hero hero-small">
    <div class="container hero-content">
        <h1>Nous Contacter</h1>
        <p>Vous avez une question ? Contactez-nous et nous vous répondrons rapidement.</p>
    </div>
</section>

<section class="section container two-col">
    <div class="card">
        <h2>Coordonnées</h2>
        <p><i class="fa-solid fa-envelope"></i> info@trugroup.cm</p>
        <p><i class="fa-solid fa-phone"></i> +237 691 22 71 49</p>
        <p><i class="fa-solid fa-location-dot"></i> Garoua, Cameroun</p>
    </div>

    <div class="card">
        <h2>Envoyer un message</h2>
        <?php if ($status === 'ok'): ?>
            <p class="alert success"><i class="fa-solid fa-circle-check"></i> Message envoyé avec succès.</p>
        <?php endif; ?>
        <?php if ($error !== ''): ?>
            <p class="alert error"><i class="fa-solid fa-triangle-exclamation"></i> <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>

        <form method="post" action="actions/contact_submit.php" class="contact-form">
            <label>Nom complet
                <input type="text" name="full_name" required>
            </label>
            <label>Email
                <input type="email" name="email" required>
            </label>
            <label>Téléphone
                <input type="text" name="phone">
            </label>
            <label>Sujet
                <select name="subject" required>
                    <option value="">Choisir...</option>
                    <option>Demande de consultation</option>
                    <option>Demande de devis</option>
                    <option>Partenariat</option>
                    <option>Support technique</option>
                    <option>Autre</option>
                </select>
            </label>
            <label>Message
                <textarea name="message" rows="5" required></textarea>
            </label>
            <button class="btn btn-primary" type="submit">Envoyer</button>
        </form>
    </div>
</section>
