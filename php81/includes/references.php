<?php

declare(strict_types=1);

/**
 * Partenaires et produits deployes, affiches sur l'accueil et la page Projets.
 *
 * Logos : deposer le fichier dans assets/img/partners/ en le nommant avec le
 * "slug" du partenaire (ex. coton-sport-garoua.png ; png, jpg, webp ou svg).
 * Sans fichier, un badge avec les initiales est affiche a la place.
 */

function references_partners(): array
{
    return [
        ['slug' => 'gazelle-fa-garoua', 'name' => 'Gazelle FA de Garoua', 'initials' => 'GFA', 'sector' => 'Sport'],
        ['slug' => 'coton-sport-garoua', 'name' => 'Coton Sport de Garoua', 'initials' => 'CSG', 'sector' => 'Sport'],
        ['slug' => 'universite-garoua', 'name' => 'Université de Garoua', 'initials' => 'UG', 'sector' => 'Enseignement supérieur'],
        ['slug' => 'weey-energies-eaux', 'name' => 'Weey Énergies et Eaux', 'initials' => 'WEE', 'sector' => 'Énergie & eau'],
    ];
}

function references_products(): array
{
    return [
        ['name' => 'Nkali', 'icon' => 'fa-layer-group', 'url' => 'http://nkali.trugroup.cm/', 'description' => 'Plateforme développée et opérée par TRU GROUP.'],
        ['name' => 'TRU Farm', 'icon' => 'fa-seedling', 'url' => 'http://farm.trugroup.cm/', 'description' => 'Plateforme de gestion pour les exploitations agricoles et d\'élevage.'],
        ['name' => 'TRU Guard', 'icon' => 'fa-shield-halved', 'url' => 'http://guard.trugroup.cm/', 'description' => 'Solution de sécurité et de suivi.'],
        ['name' => 'MokineVeto', 'icon' => 'fa-cow', 'url' => 'https://mokineveto.trugroup.cm/', 'description' => 'Télémédecine vétérinaire et accompagnement des éleveurs.'],
    ];
}

function partner_logo_url(string $slug): ?string
{
    foreach (['svg', 'png', 'webp', 'jpg', 'jpeg'] as $ext) {
        $relative = 'assets/img/partners/' . $slug . '.' . $ext;
        if (is_file(__DIR__ . '/../' . $relative)) {
            return $relative;
        }
    }
    return null;
}
