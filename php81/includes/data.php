<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/content.php';

content_seed_if_empty();
content_run_migrations();

$services = array_map(static function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'title' => (string)$row['title'],
        'icon' => (string)($row['icon'] ?: 'fa-briefcase'),
        'description' => (string)$row['description'],
        'objective' => (string)($row['objective'] ?? ''),
        'image_url' => (string)($row['image_url'] ?? ''),
        'features' => decode_json_list($row['features_json'] ?? null),
    ];
}, list_services());

$solutions = array_map(static function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'name' => (string)$row['name'],
        'subtitle' => (string)($row['subtitle'] ?? ''),
        'icon' => (string)($row['icon'] ?: 'fa-lightbulb'),
        'description' => (string)$row['description'],
    ];
}, list_solutions());

$team = array_map(static function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'name' => (string)$row['name'],
        'title' => (string)($row['title'] ?? ''),
        'bio' => (string)($row['bio'] ?? ''),
        'image' => (string)($row['image'] ?? ''),
        'specialties' => decode_json_list($row['specialties_json'] ?? null),
    ];
}, list_team());

$news = array_map(static function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'title' => (string)$row['title'],
        'description' => (string)($row['description'] ?? ''),
        'content' => (string)($row['content'] ?? ''),
        'category' => (string)($row['category'] ?? ''),
        'created_at' => (string)$row['created_at'],
        'image' => (string)($row['image'] ?? ''),
    ];
}, list_news());

$jobs = array_map(static function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'title' => (string)$row['title'],
        'location' => (string)($row['location'] ?? ''),
        'type' => (string)($row['type'] ?? ''),
        'description' => (string)($row['description'] ?? ''),
    ];
}, list_jobs());

$formations = array_map(static function (array $row): array {
    return [
        'id' => (int)$row['id'],
        'titre' => (string)$row['titre'],
        'description' => (string)($row['description'] ?? ''),
        'prix' => (string)$row['prix'],
        'duree' => (string)($row['duree'] ?? ''),
        'format' => (string)($row['format'] ?? ''),
        'lieu' => (string)($row['lieu'] ?? ''),
        'statut' => (string)$row['statut'],
    ];
}, list_formations());
