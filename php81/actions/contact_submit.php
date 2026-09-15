<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/whatsapp.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php?page=contact');
    exit;
}

$fullName = trim((string)($_POST['full_name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($fullName === '' || $email === '' || $subject === '' || $message === '') {
    header('Location: ../index.php?page=contact&' . http_build_query(['error' => 'Tous les champs obligatoires doivent être renseignés']));
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ../index.php?page=contact&' . http_build_query(['error' => 'Adresse e-mail invalide']));
    exit;
}

try {
    $pdo = db();

    $sql = 'INSERT INTO contact_messages (full_name, email, phone, subject, message, created_at) VALUES (:full_name, :email, :phone, :subject, :message, NOW())';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':full_name' => $fullName,
        ':email' => $email,
        ':phone' => $phone,
        ':subject' => $subject,
        ':message' => $message,
    ]);

    $notifText = "Nouveau message de contact TRU GROUP\n"
        . 'Nom : ' . $fullName . "\n"
        . 'Sujet : ' . $subject . "\n"
        . 'Email : ' . $email . "\n"
        . 'Téléphone : ' . ($phone !== '' ? $phone : 'Non renseigné');
    wapi_notify_admin($notifText);

    header('Location: ../index.php?page=contact&status=ok');
    exit;
} catch (Throwable $e) {
    header('Location: ../index.php?page=contact&' . http_build_query(['error' => "Erreur serveur pendant l'envoi"]));
    exit;
}
