--
--  db-schema-upgrade-150709.sql
--

SET default_storage_engine=InnoDB;


--  **************************************************************************
--  文書管理
--  **************************************************************************

-- 文書テーブルにカラムを追加
ALTER TABLE t_doc ADD COLUMN (
    `dictionary`        LONGTEXT        NOT NULL,
    `voice_setting`     LONGTEXT        NOT NULL,
    `convert_setting`   LONGTEXT        NOT NULL,
    `read_setting_modified_at` DATETIME NULL,
    `revision`          INTEGER         NOT NULL DEFAULT 1
);

-- 文書段落テーブルの `doc_id` に外部参照制約を追加。
ALTER TABLE t_doc_p ADD FOREIGN KEY (`doc_id`)
                                        REFERENCES t_doc (`id`)
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE;

-- アニメーション テーブルを追加
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

-- ユーザー情報テーブルを追加
CREATE TABLE t_user_info (
    `user_id`           INTEGER         NOT NULL PRIMARY KEY,
    `user_setting`      LONGTEXT        NULL,
    `editor_setting`    LONGTEXT        NULL
);

