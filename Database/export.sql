-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: tripspark_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Current Database: `tripspark_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `tripspark_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `tripspark_db`;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `user_id` int NOT NULL,
  `vacation_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`vacation_id`),
  KEY `vacation_id` (`vacation_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`vacation_id`) REFERENCES `vacations` (`vacation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('User','Admin') DEFAULT 'User',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'TripSpark','Admin','admin@tripspark.com','$2b$10$J0jBB6dSEjtG.xRNgrs6p.sehmb8ecpIYWyHuPN/t2Z2kFhyFDcIe','Admin');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacations`
--

DROP TABLE IF EXISTS `vacations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacations` (
  `vacation_id` int NOT NULL AUTO_INCREMENT,
  `destination` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_name` varchar(255) NOT NULL,
  PRIMARY KEY (`vacation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacations`
--

LOCK TABLES `vacations` WRITE;
/*!40000 ALTER TABLE `vacations` DISABLE KEYS */;
INSERT INTO `vacations` VALUES (1,'רומא','גלו את ההיסטוריה של הפורום הרומי והקולוסיאום, ותיהנו מבתי הקפה התוססים ברחובות.','2026-11-01','2026-11-10',1250.00,'rome.jpg'),(2,'רודוס','הירגעו לצד הים הצלול וטיילו בעיר העתיקה מימי הביניים.','2026-11-05','2026-11-14',680.00,'rhodes.jpg'),(3,'טוקיו','גלו מקדשים עתיקים בין גורדי שחקים עתידניים ושווקי אוכל.','2026-11-12','2026-11-22',2100.00,'tokyo.jpg'),(4,'פריז','טיילו לאורך הסן, בקרו במוזיאונים מובילים ותיהנו ממאפים צרפתיים.','2026-11-18','2026-11-26',1450.00,'paris.jpg'),(5,'ניו יורק','חוו מופעי ברודוויי, טיולי סתיו בסנטרל פארק ונופים אייקוניים של קו הרקיע.','2026-11-25','2026-12-04',1850.00,'newyork.jpg'),(6,'ברצלונה','התרשמו מהאדריכלות של גאודי והירגעו לאורך חופי הים התיכון התוססים.','2026-12-01','2026-12-09',920.00,'barcelona.jpg'),(7,'לונדון','בקרו בארמונות היסטוריים, בגשרים אייקוניים ובהצגות תיאטרון ידועות בעולם.','2026-12-05','2026-12-14',1350.00,'london.jpg'),(8,'אמסטרדם','שוטו בתעלות ההיסטוריות וסיירו באוספי אמנות מובילים באופניים.','2026-12-10','2026-12-18',890.00,'amsterdam.jpg'),(9,'פראג','חצו את גשר קארל הציורי וטיילו ברחובות המרוצפים של העיר העתיקה.','2026-12-15','2026-12-23',640.00,'prague.jpg'),(10,'וינה','תיהנו מארמונות קיסריים, מאולמות קונצרטים קלאסיים ומבתי קפה מסורתיים.','2026-12-20','2026-12-28',980.00,'vienna.jpg'),(11,'אתונה','טפסו אל האקרופוליס ושקעו בהיסטוריה העתיקה של אגן הים התיכון.','2027-01-05','2027-01-14',710.00,'athens.jpg'),(12,'בודפשט','הירגעו במרחצאות התרמיים המפורסמים והתפעלו מהאדריכלות לאורך הדנובה.','2027-01-12','2027-01-20',580.00,'budapest.jpg');
/*!40000 ALTER TABLE `vacations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09  0:00:38
