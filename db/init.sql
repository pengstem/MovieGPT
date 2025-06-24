/* ========= 基础设置 ========= */
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET sql_mode = 'STRICT_TRANS_TABLES';

CREATE DATABASE IF NOT EXISTS imdb
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE imdb;

/* 导入时关掉部分约束可明显提速，完毕后再恢复 */
SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_LOG_BIN = @@SQL_LOG_BIN, SQL_LOG_BIN = 0;

/* ========= 1. name.basics.tsv ========= */
CREATE TABLE name_basics (
  nconst            CHAR(10)  PRIMARY KEY,
  primaryName       VARCHAR(255),
  birthYear         SMALLINT,
  deathYear         SMALLINT,
  primaryProfession VARCHAR(255),
  knownForTitles    VARCHAR(255)
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/name.basics.tsv'
INTO TABLE name_basics
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES
(nconst, primaryName, birthYear, deathYear,
 primaryProfession, knownForTitles);

/* ========= 2. title.basics.tsv ========= */
CREATE TABLE title_basics (
  tconst          CHAR(10)  PRIMARY KEY,
  titleType       VARCHAR(32),
  primaryTitle    VARCHAR(512),
  originalTitle   VARCHAR(512),
  isAdult         TINYINT(1),
  startYear       SMALLINT,
  endYear         SMALLINT,
  runtimeMinutes  INT UNSIGNED,
  genres          VARCHAR(128)
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/title.basics.tsv'
INTO TABLE title_basics
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES;

/* ========= 3. title.akas.tsv ========= */
CREATE TABLE title_akas (
  titleId     CHAR(10),
  ordering    INT,
  title       VARCHAR(1024),
  region      VARCHAR(16),
  language    VARCHAR(32),
  types       VARCHAR(128),
  attributes  VARCHAR(128),
  isOriginalTitle TINYINT(1),
  PRIMARY KEY (titleId, ordering)
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/title.akas.tsv'
INTO TABLE title_akas
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES;

/* ========= 4. title.crew.tsv ========= */
CREATE TABLE title_crew (
  tconst     CHAR(10) PRIMARY KEY,
  directors  VARCHAR(1024),
  writers    VARCHAR(2048)
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/title.crew.tsv'
INTO TABLE title_crew
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES
(tconst, directors, writers);

/* ========= 5. title.episode.tsv ========= */
CREATE TABLE title_episode (
  tconst        CHAR(10) PRIMARY KEY,
  parentTconst CHAR(10),
  seasonNumber SMALLINT,
  episodeNumber SMALLINT,
  INDEX (parentTconst)
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/title.episode.tsv'
INTO TABLE title_episode
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES
(tconst, parentTconst, seasonNumber, episodeNumber);

/* ========= 6. title.principals.tsv ========= */
CREATE TABLE title_principals (
  tconst     CHAR(10),
  ordering   INT,
  nconst     CHAR(10),
  category   VARCHAR(64),
  job        VARCHAR(255),
  characters VARCHAR(1024),
  PRIMARY KEY (tconst, ordering),
  INDEX (nconst)
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/title.principals.tsv'
INTO TABLE title_principals
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES;

/* ========= 7. title.ratings.tsv ========= */
CREATE TABLE title_ratings (
  tconst        CHAR(10) PRIMARY KEY,
  averageRating DECIMAL(3,1),
  numVotes      INT
) DEFAULT CHARSET = utf8mb4;

LOAD DATA INFILE '/var/lib/mysql-files/title.ratings.tsv'
INTO TABLE title_ratings
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t'
LINES  TERMINATED BY '\n'
IGNORE 1 LINES
(tconst, averageRating, numVotes);

/* ========= 收尾：恢复原设置 ========= */
SET SQL_LOG_BIN             = @OLD_SQL_LOG_BIN;
SET FOREIGN_KEY_CHECKS      = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS           = @OLD_UNIQUE_CHECKS;
COMMIT;
