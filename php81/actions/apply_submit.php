<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/content.php';
require_once __DIR__ . '/../includes/whatsapp.php';

function apply_redirect(string $status, string $error = ''): never
{
    $params = ['page' => 'careers'];
    if ($status !== '') {
        $params['apply_status'] = $status;
    }
    if ($error !== '') {
        $params['apply_error'] = $error;
    }
    header('Location: ../index.php?' . http_build_query($params));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apply_redirect('');
}

$jobId = (int)($_POST['job_id'] ?? 0);
$firstName = trim((string)($_POST['first_name'] ?? ''));
$lastName = trim((string)($_POST['last_name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($firstName === '' || $lastName === '' || $email === '') {
    apply_redirect('', 'Le prénom, le nom et l\'email sont obligatoires.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apply_redirect('', 'Adresse e-mail invalide.');
}

$cvPath = null;
if (!empty($_FILES['cv']['name']) && is_uploaded_file($_FILES['cv']['tmp_name'])) {
    if ($_FILES['cv']['size'] > 5 * 1024 * 1024) {
        apply_redirect('', 'Le CV dépasse la taille maximale de 5 Mo.');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $_FILES['cv']['tmp_name']);
    finfo_close($finfo);

    if ($mime !== 'application/pdf') {
        apply_redirect('', 'Le CV doit être un fichier PDF.');
    }

    $uploadDir = __DIR__ . '/../uploads/cv';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = bin2hex(random_bytes(16)) . '.pdf';
    if (move_uploaded_file($_FILES['cv']['tmp_name'], $uploadDir . '/' . $filename)) {
        $cvPath = 'uploads/cv/' . $filename;
    }
}

$jobTitle = null;
if ($jobId > 0) {
    $job = find_job($jobId);
    $jobTitle = $job['title'] ?? null;
    if ($job === null) {
        $jobId = 0;
    }
}

try {
    $pdo = db();
    $stmt = $pdo->prepare('INSERT INTO job_applications (job_id, job_title, first_name, last_name, email, phone, cv_path, message, created_at) VALUES (:job_id, :job_title, :first_name, :last_name, :email, :phone, :cv_path, :message, NOW())');
    $stmt->execute([
        ':job_id' => $jobId > 0 ? $jobId : null,
        ':job_title' => $jobTitle ?? 'Candidature spontanée',
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':email' => $email,
        ':phone' => $phone,
        ':cv_path' => $cvPath,
        ':message' => $message,
    ]);
    $applicationId = (int)$pdo->lastInsertId();

    $notifText = "Nouvelle candidature TRU GROUP\n"
        . 'Poste : ' . ($jobTitle ?? 'Candidature spontanée') . "\n"
        . 'Nom : ' . $firstName . ' ' . $lastName . "\n"
        . 'Email : ' . $email . "\n"
        . 'Téléphone : ' . ($phone !== '' ? $phone : 'Non renseigné');

    if (wapi_notify_admin($notifText)) {
        $pdo->prepare('UPDATE job_applications SET whatsapp_notified_at = NOW() WHERE id = :id')
            ->execute([':id' => $applicationId]);
    }

    apply_redirect('ok');
} catch (Throwable $e) {
    apply_redirect('', "Erreur serveur pendant l'envoi de la candidature.");
}
