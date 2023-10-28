-- MySQL dump 10.13  Distrib 8.0.34, for Linux (aarch64)
--
-- Host: localhost    Database: games
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Player`
--

DROP TABLE IF EXISTS `Player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `socketId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canTalk` tinyint(1) NOT NULL DEFAULT '1',
  `index` int NOT NULL,
  `voteIn` int DEFAULT NULL,
  `life` int NOT NULL DEFAULT '1',
  `shield` int NOT NULL DEFAULT '1',
  `isProtected` tinyint(1) NOT NULL DEFAULT '0',
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `revived` tinyint(1) NOT NULL DEFAULT '0',
  `online` tinyint(1) NOT NULL DEFAULT '1',
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `votesReceived` int NOT NULL DEFAULT '0',
  `voteWeight` int NOT NULL DEFAULT '1',
  `roleVisibility` tinyint(1) NOT NULL DEFAULT '0',
  `elimination` enum('VOTE','ATTACK','OVERDOSE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isJailed` tinyint(1) NOT NULL DEFAULT '0',
  `isTrapped` tinyint(1) NOT NULL DEFAULT '0',
  `roleStolen` tinyint(1) NOT NULL DEFAULT '0',
  `isDrugged` tinyint(1) NOT NULL DEFAULT '0',
  `druggedBy` tinyint(1) NOT NULL DEFAULT '0',
  `injected` enum('ATTACK','DEFENSE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voteProtection` tinyint(1) NOT NULL DEFAULT '0',
  `roleVisibilityProtectedWhenDead` tinyint(1) NOT NULL DEFAULT '0',
  `corrupted` tinyint(1) NOT NULL DEFAULT '0',
  `bhTarget` tinyint(1) NOT NULL DEFAULT '0',
  `potionReceived` enum('RED','BLACK') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attackedBy` int DEFAULT NULL,
  `abilitiesEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `canVote` tinyint(1) NOT NULL DEFAULT '1',
  `checkedByAnalyst` tinyint(1) NOT NULL DEFAULT '0',
  `checkedByDetective` tinyint(1) NOT NULL DEFAULT '0',
  `vigiKill` tinyint(1) NOT NULL DEFAULT '0',
  `vigiReveal` tinyint(1) NOT NULL DEFAULT '0',
  `abilityConsumed` tinyint(1) NOT NULL DEFAULT '0',
  `attacked` tinyint(1) NOT NULL DEFAULT '0',
  `trapActive` tinyint(1) NOT NULL DEFAULT '0',
  `playerTrapped` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soldierAttacked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Player`
--

LOCK TABLES `Player` WRITE;
/*!40000 ALTER TABLE `Player` DISABLE KEYS */;
/*!40000 ALTER TABLE `Player` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Profile`
--

DROP TABLE IF EXISTS `Profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Profile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `xp` int NOT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wins` int DEFAULT '0',
  `loses` int DEFAULT '0',
  `quits` int DEFAULT '0',
  `deaths` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Profile_userId_key` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Profile`
--

LOCK TABLES `Profile` WRITE;
/*!40000 ALTER TABLE `Profile` DISABLE KEYS */;
INSERT INTO `Profile` VALUES ('3af47e01-7b4b-486e-af9c-abac05dd82fd',NULL,'Henrique 2','3ef1ad99-3c0a-4c97-be5d-6967281dfa22',0,'Male',0,0,0,0),('73a1ac25-9c30-42cf-b6e2-b154f22fc584',NULL,'Henrique','34d84e26-e192-4932-bc89-ce6eb8b1c7a6',0,'Male',0,0,0,0),('a7ca8aef-18e5-4959-ab0d-6fc2ce578ddd',NULL,'Henrique 3','cf1fa42b-93cc-40bc-86cd-1bec03615e4b',0,'Male',0,0,0,0),('b23e9b0d-88a3-4128-815b-c161df902dc8',NULL,'Henrique 4','4287d6a9-f045-409b-96a9-32d2c4326a12',0,'Male',0,0,0,0),('b8ad419a-0056-46ed-b045-7de45a813c86',NULL,'Larissa','daa086f5-f139-40be-abaa-c2c3ceac4d4e',0,'Female',0,0,0,0),('eae341d7-b265-4ffd-8267-be733c7e5678',NULL,'Henrique 5','9a07ab54-c02f-4b89-837d-25c8a1783334',0,'Male',0,0,0,0);
/*!40000 ALTER TABLE `Profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Role` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aura` enum('GOOD','EVIL','UNKNOWN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `team` enum('GOVERNMENT','REBEL','SOLO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `canTalkNight` tinyint(1) NOT NULL,
  `description` varchar(3000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
INSERT INTO `Role` VALUES ('0368a71a-e3a0-4561-a780-71f95c8ab877','GOOD','REBEL',0,'A former government detective, who, after facing termination, chose to dedicate their skills to the rebel cause. Leveraging their acquired knowledge and technologies from years of serving the totalitarian government, the Detective specializes in uncovering the true identity of a player by hacking into their cyber data. Each night, the Detective can select a player to reveal their role.','Detective','https://i.imgur.com/jzCEs7Q.png'),('3037e40d-ccd6-49cc-bde1-7b2b02fc72c2','UNKNOWN','GOVERNMENT',1,'The Government Leader is a high-ranking government agent, skilled in remaining hidden and manipulating information. During the night, their vote counts as double. During the day, they have the ability to send private messages to their fellow government agents, visible only to them, but cannot receive responses.','Government Leader','https://i.imgur.com/kkFwTF1.png'),('4b0ec7af-3ddf-44bd-8132-a1f31fbe51da','UNKNOWN','SOLO',0,'Embracing chaos and rejecting all forms of authority, the anarchist\'s primary goal is to incite disorder within the group. They achieve victory if the other players vote and eliminate them during the day, ending the game','Anarchist','https://i.imgur.com/fTWmiwb.png'),('4ddc1808-03eb-4d1e-980c-35bef179e424','GOOD','REBEL',0,'The Rebel Leader is the most prominent figure within the rebellion. They have the choice to disclose their role to all other players, effectively doubling the weight of their vote in day voting for the rest of the game.','Rebel Leader','https://i.imgur.com/bpOLmZ9.png'),('93d27eaa-3862-4099-b1fa-e6b71b372464','GOOD','REBEL',0,'The Combat Medic acquired their knowledge while serving in the government\'s army for years, until they managed to escape and seek shelter with the rebels. As a Combat Medic, you can choose a player to protect during the night, making that player immune to attacks. However, you cannot protect yourself.','Combat Medic','https://i.imgur.com/BOqnBkH.png'),('a11be979-8560-426a-9ccc-c1c1de0e5e39','EVIL','GOVERNMENT',1,'The Instigator Agent has the ability to reveal another player\'s role to all the other players once per game. On the day the Instigator reveals a player, there will be no voting.','Instigator','https://i.imgur.com/dmjnpGe.png'),('ba8d2760-d87d-4614-bb5a-618410a601a0','EVIL','GOVERNMENT',1,'The Chief of Intelligence is the leader of the infiltrated government agents. Due to their knowledge and experience in the field of technology, they can infiltrate a player\'s cyber systems, revealing the player\'s role to their fellow government agents during the night. If they become the last surviving government agent, they resign their position and adopt the role of a regular government agent, without any special abilities.','Chief of Intelligence','https://i.imgur.com/CULkB31.png'),('dff17fee-faf0-48e6-b98d-c2d26a7dbf5a','UNKNOWN','GOVERNMENT',1,'The Tactical Soldier is a highly skilled agent with extensive combat training and experience, making them exceptionally resourceful. When attacked, whether by night actions or daytime voting, they can escape and survive, avoiding death. However, the next attack, regardless of its nature, will be fatal.','Tactical Soldier','https://i.imgur.com/H9i06RW.png'),('e373e19e-69bd-481d-b95c-4192d73b6253','UNKNOWN','REBEL',0,'An expert in technology smuggling, the Tech Contrabandist possesses the knowledge and skills to access and manipulate technology for anonymous communication with deceased rebel agents. Once per game, the Tech Contrabandist can choose a deceased rebel agent to be resurrected in the game, allowing them to rejoin the living players on the next day.','Tech Contrabandist','https://i.imgur.com/2ZNF2fj.png'),('e874e715-19ca-4895-a3e6-9a824571cd4e','UNKNOWN','SOLO',0,'The Serial Killer is a disturbed and psychotic figure infiltrated into the group with the goal of eliminating all players. Every night, they can choose a player to stab.','Serial Killer','https://i.imgur.com/QwE0MKU.png');
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Room`
--

DROP TABLE IF EXISTS `Room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Room` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `turn` enum('LOBBY','DAY','VOTE','NIGHT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOBBY',
  `turnNumber` int NOT NULL DEFAULT '0',
  `startedAt` datetime(3) DEFAULT NULL,
  `hasVote` tinyint(1) NOT NULL,
  `voteAnon` tinyint(1) NOT NULL,
  `finished` tinyint(1) NOT NULL,
  `winner` enum('GOVERNMENT','REBEL','SOLO') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soloWinner` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actualTurnStartedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Room`
--

LOCK TABLES `Room` WRITE;
/*!40000 ALTER TABLE `Room` DISABLE KEYS */;
/*!40000 ALTER TABLE `Room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('34d84e26-e192-4932-bc89-ce6eb8b1c7a6','henrique@gmail.com','$2b$10$lMmqkfavM3A3gZ7db3glne8a/9LRb6aCUZjqUGZw5Rt6f/V97shZS','2023-10-27 19:58:05.351'),('3ef1ad99-3c0a-4c97-be5d-6967281dfa22','henrique2@gmail.com','$2b$10$PTFEloa9SN0rj/xBo/OTb.Xz.h37cfmnex5LEM7WTc1TPHOFc8ixe','2023-10-27 19:58:09.506'),('4287d6a9-f045-409b-96a9-32d2c4326a12','henrique4@gmail.com','$2b$10$Q4VCfvQlFKAGqvWIMPEKse2OVQYwO2aE2xTC1NPgT26cqHbit6PAC','2023-10-27 19:58:17.803'),('9a07ab54-c02f-4b89-837d-25c8a1783334','henrique5@gmail.com','$2b$10$wi.6K3fPLG5HwLHLiHOP2uEXQwRC0FkuoAh5g2uRpOnMEPZG1dbiq','2023-10-27 19:58:22.368'),('cf1fa42b-93cc-40bc-86cd-1bec03615e4b','henrique3@gmail.com','$2b$10$TVE.5ptZdHmtUHjz7uPPE.YIijkvgCNo2C9pfwkW84aCQwmC7l0hW','2023-10-27 19:58:13.887'),('daa086f5-f139-40be-abaa-c2c3ceac4d4e','larissa@gmail.com','$2b$10$TuSE2/KIP/YQE0bpdtdQ/e0URKMjumzQQzzYRbgbihHMb0bzKdX3e','2023-10-27 19:58:38.494');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-27 19:58:43
