-- Carrieres RCA (demonstration) — schema MySQL.
--
-- Tables prefixees `rca_` : la base trugro9159_tru est partagee avec le site
-- trugroup.cm et teeeotp. Horodatages en DATETIME(3) UTC.

SET FOREIGN_KEY_CHECKS = 0;

-- ─── Candidats ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rca_users` (
  `id`                CHAR(36)     NOT NULL,
  `username`          VARCHAR(40)  NOT NULL,
  `email`             VARCHAR(190) NOT NULL,
  `phone`             VARCHAR(30)  NULL,
  `phoneVerifiedAt`   DATETIME(3)  NULL,
  `passwordHash`      VARCHAR(255) NOT NULL,
  `privacyAcceptedAt` DATETIME(3)  NOT NULL,
  `lang`              VARCHAR(10)  NOT NULL DEFAULT 'fr',
  `alertsOptIn`       TINYINT(1)   NOT NULL DEFAULT 1,
  `marketingOptIn`    TINYINT(1)   NOT NULL DEFAULT 0,
  -- Profil general reutilise d'une candidature a l'autre (nom, ville, domaine…).
  `profile`           JSON         NULL,
  `failedLogins`      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `lockedUntil`       DATETIME(3)  NULL,
  `lastLoginAt`       DATETIME(3)  NULL,
  `createdAt`         DATETIME(3)  NOT NULL,
  `updatedAt`         DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rca_users_username_key` (`username`),
  UNIQUE KEY `rca_users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Recruteurs (back-office) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rca_recruiters` (
  `id`           CHAR(36)     NOT NULL,
  `email`        VARCHAR(190) NOT NULL,
  `name`         VARCHAR(120) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role`         ENUM('admin','recruiter') NOT NULL DEFAULT 'recruiter',
  `active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `failedLogins` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `lockedUntil`  DATETIME(3)  NULL,
  `lastLoginAt`  DATETIME(3)  NULL,
  `createdAt`    DATETIME(3)  NOT NULL,
  `updatedAt`    DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rca_recruiters_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Offres d'emploi ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rca_jobs` (
  `id`            CHAR(36)     NOT NULL,
  `ref`           VARCHAR(20)  NOT NULL,
  `title`         VARCHAR(160) NOT NULL,
  `org`           VARCHAR(120) NOT NULL,
  `location`      VARCHAR(80)  NOT NULL,
  `domain`        VARCHAR(80)  NOT NULL,
  `contract`      ENUM('CDI','CDD','Stage') NOT NULL,
  `education`     VARCHAR(60)  NOT NULL,
  `schedule`      VARCHAR(40)  NOT NULL DEFAULT 'Temps plein',
  `urgent`        TINYINT(1)   NOT NULL DEFAULT 0,
  `status`        ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  `summary`       VARCHAR(500) NOT NULL,
  -- Une ligne par puce.
  `missions`      TEXT         NULL,
  `requirements`  TEXT         NULL,
  `offer`         TEXT         NULL,
  `publishedAt`   DATE         NULL,
  `unpublishAt`   DATE         NULL,
  `createdBy`     CHAR(36)     NULL,
  `createdAt`     DATETIME(3)  NOT NULL,
  `updatedAt`     DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rca_jobs_ref_key` (`ref`),
  KEY `rca_jobs_status_idx` (`status`, `publishedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Candidatures ───────────────────────────────────────────────────────────
-- `data` : instantane du dossier (profil, formations, experiences, reponses),
-- fige a la soumission pour que le recruteur lise ce que le candidat a envoye.
CREATE TABLE IF NOT EXISTS `rca_applications` (
  `id`           CHAR(36)    NOT NULL,
  `userId`       CHAR(36)    NOT NULL,
  `jobId`        CHAR(36)    NOT NULL,
  `status`       ENUM('draft','submitted','withdrawn') NOT NULL DEFAULT 'draft',
  `reviewStatus` ENUM('recue','examen','preselection','entretien','retenue','non_retenue') NULL,
  `step`         TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `data`         JSON        NULL,
  `signedName`   VARCHAR(160) NULL,
  `submittedAt`  DATETIME(3) NULL,
  `createdAt`    DATETIME(3) NOT NULL,
  `updatedAt`    DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rca_app_user_job_key` (`userId`, `jobId`),
  KEY `rca_app_job_idx` (`jobId`, `status`),
  CONSTRAINT `rca_app_user_fk` FOREIGN KEY (`userId`) REFERENCES `rca_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rca_app_job_fk` FOREIGN KEY (`jobId`) REFERENCES `rca_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rca_attachments` (
  `id`            CHAR(36)     NOT NULL,
  `applicationId` CHAR(36)     NOT NULL,
  `kind`          ENUM('cv','letter','other') NOT NULL,
  `originalName`  VARCHAR(190) NOT NULL,
  `storedName`    VARCHAR(60)  NOT NULL,
  `mime`          VARCHAR(100) NOT NULL,
  `size`          INT UNSIGNED NOT NULL,
  `createdAt`     DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_att_app_idx` (`applicationId`),
  CONSTRAINT `rca_att_app_fk` FOREIGN KEY (`applicationId`) REFERENCES `rca_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rca_status_history` (
  `id`            CHAR(36)     NOT NULL,
  `applicationId` CHAR(36)     NOT NULL,
  `fromStatus`    VARCHAR(20)  NULL,
  `toStatus`      VARCHAR(20)  NOT NULL,
  `note`          VARCHAR(1000) NULL,
  `recruiterId`   CHAR(36)     NULL,
  `notified`      VARCHAR(40)  NULL,
  `createdAt`     DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_hist_app_idx` (`applicationId`, `createdAt`),
  CONSTRAINT `rca_hist_app_fk` FOREIGN KEY (`applicationId`) REFERENCES `rca_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Activites du candidat ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rca_cart` (
  `userId`    CHAR(36)    NOT NULL,
  `jobId`     CHAR(36)    NOT NULL,
  `createdAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`userId`, `jobId`),
  CONSTRAINT `rca_cart_user_fk` FOREIGN KEY (`userId`) REFERENCES `rca_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rca_cart_job_fk` FOREIGN KEY (`jobId`) REFERENCES `rca_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rca_saved_searches` (
  `id`        CHAR(36)     NOT NULL,
  `userId`    CHAR(36)     NOT NULL,
  `name`      VARCHAR(80)  NOT NULL,
  `criteria`  JSON         NOT NULL,
  `alert`     TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3)  NOT NULL,
  `updatedAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_saved_user_idx` (`userId`),
  CONSTRAINT `rca_saved_user_fk` FOREIGN KEY (`userId`) REFERENCES `rca_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rca_cooptations` (
  `id`        CHAR(36)     NOT NULL,
  `userId`    CHAR(36)     NOT NULL,
  `jobId`     CHAR(36)     NOT NULL,
  `firstName` VARCHAR(80)  NOT NULL,
  `lastName`  VARCHAR(80)  NOT NULL,
  `email`     VARCHAR(190) NOT NULL,
  `mailed`    TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_coopt_user_idx` (`userId`),
  CONSTRAINT `rca_coopt_user_fk` FOREIGN KEY (`userId`) REFERENCES `rca_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rca_coopt_job_fk` FOREIGN KEY (`jobId`) REFERENCES `rca_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Codes a usage unique et journaux ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rca_codes` (
  `id`           CHAR(36)     NOT NULL,
  `userId`       CHAR(36)     NOT NULL,
  `purpose`      ENUM('verify_phone','reset_password') NOT NULL,
  `channel`      ENUM('sms','email') NOT NULL,
  `target`       VARCHAR(190) NOT NULL,
  `codeHash`     CHAR(64)     NULL,
  `otpRequestId` CHAR(36)     NULL,
  `attemptsLeft` TINYINT UNSIGNED NOT NULL,
  `expiresAt`    DATETIME(3)  NOT NULL,
  `usedAt`       DATETIME(3)  NULL,
  `createdAt`    DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_codes_user_idx` (`userId`, `purpose`),
  CONSTRAINT `rca_codes_user_fk` FOREIGN KEY (`userId`) REFERENCES `rca_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rca_mail_log` (
  `id`        CHAR(36)     NOT NULL,
  `recipient` VARCHAR(190) NOT NULL,
  `subject`   VARCHAR(190) NOT NULL,
  `kind`      VARCHAR(30)  NOT NULL,
  `ok`        TINYINT(1)   NOT NULL,
  `via`       VARCHAR(10)  NOT NULL,
  `error`     VARCHAR(255) NULL,
  `createdAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_mail_created_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limitation des envois declenches sans compte (envoyer a un ami, oublis).
CREATE TABLE IF NOT EXISTS `rca_throttle` (
  `id`        CHAR(36)    NOT NULL,
  `action`    VARCHAR(30) NOT NULL,
  `ip`        VARCHAR(45) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rca_throttle_idx` (`action`, `ip`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
