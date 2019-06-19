--
--  db-schema.sql
--

SET default_storage_engine=InnoDB;


--  **************************************************************************
--  セッション管理
--  **************************************************************************

-- CodeIgniter セッション テーブル
CREATE TABLE `ci_sessions` (
    `id`            VARCHAR(40)         NOT NULL PRIMARY KEY,
    `ip_address`    VARCHAR(45)         NOT NULL,
    `timestamp`     INT(10) UNSIGNED    NOT NULL DEFAULT 0,
    `data`          BLOB                NOT NULL,
    KEY `ci_sessions_timestamp` (`timestamp`)
);


--  **************************************************************************
--  ファイルシステム管理
--  **************************************************************************

-- ドライブ テーブル
CREATE TABLE t_drive (
    `id`                INTEGER         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `grouser_id`        INTEGER         NOT NULL,
    `root_id`           INTEGER         NOT NULL
                                        REFERENCES t_file (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
    `created_at`        DATETIME        NOT NULL,
    `updated_at`        DATETIME        NOT NULL,
    `deleted_at`        DATETIME        NULL,
    INDEX (`grouser_id`)
);

-- ファイル テーブル
CREATE TABLE t_file (
    `id`                INTEGER         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`              TEXT            NOT NULL,
    `type`              INTEGER         NOT NULL,
    `parent_id`         INTEGER         NULL
                                        REFERENCES t_file (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
    `creator_id`        INTEGER         NOT NULL,
    `doc_id`            INTEGER         NULL
                                        REFERENCES t_doc (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
    `edit_session_id`   VARCHAR(40)     NULL
                                        REFERENCES ci_sessions (`id`)
                                            ON DELETE SET NULL
                                            ON UPDATE CASCADE,
    `created_at`        DATETIME        NOT NULL,
    `updated_at`        DATETIME        NOT NULL,
    `deleted_at`        DATETIME        NULL,
    INDEX (`parent_id`),
    INDEX (`doc_id`),
    INDEX (`edit_session_id`)
);


--  **************************************************************************
--  文書管理
--  **************************************************************************

-- 文書テーブル
CREATE TABLE t_doc (
    `id`                INTEGER         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `content`           LONGTEXT        NOT NULL,
    `dictionary`        LONGTEXT        NOT NULL,
    `voice_setting`     LONGTEXT        NOT NULL,
    `convert_setting`   LONGTEXT        NOT NULL,
    `read_setting_modified_at` DATETIME NULL,
    `revision`          INTEGER         NOT NULL DEFAULT 1
);

-- 文書段落テーブル
CREATE TABLE t_doc_p (
    `doc_id`            INTEGER         NOT NULL
                                        REFERENCES t_doc (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
    `p_id`              INTEGER         NOT NULL,
    `content`           LONGTEXT        NOT NULL,
    PRIMARY KEY (`doc_id`, `p_id`)
);

-- アニメーション テーブル
CREATE TABLE t_doc_animation (
    `doc_id`            INTEGER         NOT NULL
                                        REFERENCES t_doc (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
    `animation_id`      INTEGER         NOT NULL,
    `content`           LONGTEXT        NOT NULL,
    PRIMARY KEY (`doc_id`, `animation_id`)
);


--  **************************************************************************
--  ユーザー管理
--  **************************************************************************

-- ユーザー情報テーブル
CREATE TABLE t_user_info (
    `user_id`           INTEGER         NOT NULL PRIMARY KEY,
    `user_setting`      LONGTEXT        NULL,
    `editor_setting`    LONGTEXT        NULL
);


--  **************************************************************************
--  データ変換
--  **************************************************************************

-- 変換テーブル
CREATE TABLE t_convert (
    `id`                INTEGER         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `task_id`           VARCHAR(40)     NOT NULL,
    `user_id`           INTEGER         NOT NULL,
    `doc_id`            INTEGER         NOT NULL
                                        REFERENCES t_doc (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
    `convert_type`      TINYINT(1)      NOT NULL,
    `file_type`         VARCHAR(100)    NOT NULL,
    `queued_at`         DATETIME        NOT NULL,
    `completed_at`      DATETIME        NULL,
    `status`            VARCHAR(10)     NULL,
    `exportable_count`  INTEGER         NOT NULL DEFAULT 1,
    UNIQUE INDEX (`task_id`),
    UNIQUE INDEX (`user_id`, `doc_id`, `convert_type`)
);


