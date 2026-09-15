<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Envoie un message texte WhatsApp via l'API wapi.mana.cm (Baileys).
 * Ne leve jamais d'exception : un echec d'envoi ne doit pas casser le site.
 */
function wapi_send_message(string $to, string $text): bool
{
    if (WAPI_NOTIFY_NUMBER === '' || trim($to) === '') {
        return false;
    }

    $url = rtrim(WAPI_BASE_URL, '/') . '/api/messages/send';

    $headers = ['Content-Type: application/json'];
    if (WAPI_API_KEY !== '') {
        $headers[] = 'x-api-key: ' . WAPI_API_KEY;
    }

    $payload = json_encode(['to' => $to, 'text' => $text], JSON_UNESCAPED_UNICODE);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $payload,
            'timeout' => 8,
            'ignore_errors' => true,
        ],
    ]);

    $result = @file_get_contents($url, false, $context);

    return $result !== false;
}

function wapi_notify_admin(string $text): bool
{
    return wapi_send_message(WAPI_NOTIFY_NUMBER, $text);
}
