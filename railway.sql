USE railway;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    regNo VARCHAR(50),
    password VARCHAR(100),
    role VARCHAR(20) DEFAULT 'student',
    INDEX(email)
);

CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    marks INT,
    duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    question TEXT,
    option1 VARCHAR(255),
    option2 VARCHAR(255),
    option3 VARCHAR(255),
    option4 VARCHAR(255),
    correctAnswer INT,

    FOREIGN KEY (exam_id) REFERENCES exams(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    exam_id INT,
    score INT,
    total INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);
-- insertion of questions
INSERT INTO questions
(exam, question, option1, option2, option3, option4, correctAnswer)
VALUES
('Database', 'Which SQL command is used to retrieve data from a table?', 'SELECT', 'INSERT', 'DELETE', 'UPDATE', 0),
('Database', 'Which key uniquely identifies each record in a table?', 'Foreign Key', 'Primary Key', 'Candidate Key', 'Composite Key', 1),
('Database', 'Which SQL clause is used to filter records?', 'ORDER BY', 'GROUP BY', 'WHERE', 'HAVING', 2),
('Database', 'Which command is used to remove a table from a database?', 'DELETE', 'REMOVE', 'DROP', 'TRUNCATE', 2),
('Database', 'Which normal form removes partial dependency?', '1NF', '2NF', '3NF', 'BCNF', 1),
('Database', 'Which join returns only matching records from both tables?', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 2),
('Database', 'Which SQL command is used to modify existing data?', 'UPDATE', 'ALTER', 'CHANGE', 'MODIFY', 0),
('Database', 'Which constraint ensures that a column cannot have NULL values?', 'UNIQUE', 'NOT NULL', 'DEFAULT', 'CHECK', 1),
('Database', 'Which command is used to permanently save a transaction?', 'ROLLBACK', 'SAVE', 'COMMIT', 'STORE', 2),
('Database', 'Which SQL keyword is used to sort records?', 'WHERE', 'ORDER BY', 'GROUP BY', 'SORT', 1);

INSERT INTO questions
(exam, question, option1, option2, option3, option4, correctAnswer)
VALUES
('AICT','What does AI stand for?','Artificial Intelligence','Automated Internet','Advanced Information','Artificial Interface',0),
('AICT','Which of the following is a branch of AI?','Machine Learning','Database','Networking','Compiler Design',0),
('AICT','Which language is commonly used in AI development?','Python','HTML','CSS','SQL',0),
('AICT','What is Machine Learning?','Learning from data','Creating websites','Managing databases','Computer networking',0),
('AICT','Which AI technique mimics human decision making?','Expert System','Compiler','Router','Firewall',0),
('AICT','What is the full form of NLP?','Natural Language Processing','Network Layer Protocol','New Learning Process','Natural Logic Program',0),
('AICT','Which company developed ChatGPT?','OpenAI','Google','Microsoft','IBM',0),
('AICT','What is Deep Learning based on?','Neural Networks','Databases','Operating Systems','Cloud Storage',0),
('AICT','Which of the following is an AI application?','Chatbot','Keyboard','Monitor','Printer',0),
('AICT','What is the main goal of Artificial Intelligence?','Make machines intelligent','Increase internet speed','Store data','Design websites',0);

INSERT INTO questions
(exam, question, option1, option2, option3, option4, correctAnswer)
VALUES
('Information Security','What does CIA in information security stand for?','Confidentiality, Integrity, Availability','Control, Information, Access','Cryptography, Integrity, Authentication','Confidential, Internet, Access',0),
('Information Security','Which of the following is a type of malware?','Virus','Firewall','Router','Switch',0),
('Information Security','Which method is used to make data unreadable for unauthorized users?','Encryption','Compression','Backup','Replication',0),
('Information Security','Which attack involves intercepting communication between two parties?','Man-in-the-middle','Phishing','Brute Force','DoS',0),
('Information Security','What is the primary purpose of a firewall?','Control incoming and outgoing network traffic','Store passwords','Scan viruses','Compress files',0),
('Information Security','Two-factor authentication typically combines:','Password + Token/Code','Username + Password','IP + Password','Email + Phone number',0),
('Information Security','Which protocol is used for secure web traffic?','HTTPS','HTTP','FTP','SMTP',0),
('Information Security','Social engineering attacks target:','Human behavior','Software only','Hardware only','Databases only',0),
('Information Security','Which of the following is a strong password practice?','Use combination of letters, numbers, symbols','Use "password"','Use birthday','Use sequential numbers',0),
('Information Security','What does phishing usually attempt to steal?','User credentials','CPU','Bandwidth','RAM',0);
SELECT * FROM users;
SHOW TABLES;
SHOW COLUMNS FROM exams;
SELECT * FROM results;

-- insertion of exams
INSERT INTO exams(name,marks,duration)
VALUES ('Computer network',10,420);

    -- LIKE use for serach as showed only name start with A   
SELECT * FROM users
WHERE name LIKE 'A%';

-- Between uses for check Range of score
SELECT * FROM results
WHERE score BETWEEN 2 AND 10;

-- IN use for multiple values
SELECT * FROM exams
WHERE name IN ('AICT', 'Database');

-- --------------------------------
--          JOINS SECION
-- --------------------------------


-- inner join (only grab matching records)
SELECT users.name, results.score
FROM users
INNER JOIN results
ON users.regNo = results.regNo;

-- left join (grab all data of left + matching with right one)
SELECT 
    users.name,
    users.regNo,
    results.score,
    results.exam
FROM users
LEFT JOIN results
ON users.regNo = results.regNo;

-- Right join (grab all data of right + matching with left data)
SELECT users.name,users.regNo, results.score
FROM users
RIGHT JOIN results
ON users.regNo = results.regNo;

-- union combine both
SELECT users.name, users.regNo, results.score
FROM users
LEFT JOIN results
ON users.regNo = results.regNo

UNION

SELECT users.name, users.regNo,  results.score
FROM users
RIGHT JOIN results
ON users.regNo = results.regNo;

-- group by tell us individual student how many quiz gave
SELECT regNo, COUNT(*) AS total_exams
FROM results
GROUP BY regNo;

-- group by + sum total score of student
SELECT regNo, SUM(score) AS total_score
FROM results
GROUP BY regNo;

-- avg score
SELECT regNo, AVG(score) AS avg_score
FROM results
GROUP BY regNo;

-- highest scorer student
SELECT regNo, SUM(score) AS total_score
FROM results
GROUP BY regNo
ORDER BY total_score DESC
LIMIT 1;

-- top 3 scorer
SELECT regNo, SUM(score) AS total_score
FROM results
GROUP BY regNo
ORDER BY total_score DESC
LIMIT 3;

SELECT users.name, results.regNo, SUM(results.score) AS total_score
FROM results
JOIN users ON users.regNo = results.regNo
GROUP BY results.regNo, users.name
ORDER BY total_score DESC;

-- -------------------------------
--      SUB QURIES SECTION
-- -------------------------------

-- grab the student have highest scored
SELECT name
FROM users
WHERE regNo IN (
    SELECT regNo
    FROM results
    WHERE score = (SELECT MAX(score) FROM results)
);

-- grab the student whi get marks above the avg
SELECT *
FROM results
WHERE score > (
    SELECT AVG(score) FROM results
);

-- grab the students only who gave the exam
SELECT *
FROM users
WHERE regNo IN (
    SELECT DISTINCT regNo FROM results
);

-- grab the student who don't gave the exam
SELECT *
FROM users
WHERE regNo NOT IN (
    SELECT regNo FROM results
);

-- grab the student marks who is on second
SELECT MAX(score) AS second_highest
FROM results
WHERE score < (
    SELECT MAX(score) FROM results
);

-- --------------------------------
--       STORED PROCEDURES
-- --------------------------------

-- simple for grab all the users
DELIMITER $$

CREATE PROCEDURE GetAllUsers()
BEGIN
    SELECT * FROM users;
END $$

DELIMITER ;

CALL GetAllUsers();

DELIMITER $$

-- Procedures with parameters
CREATE PROCEDURE GetStudent(IN rNo VARCHAR(50))
BEGIN
    SELECT * 
    FROM users
    WHERE regNo = rNo;
END $$

DELIMITER ;
CALL GetStudent('CS-241216');


DELIMITER $$
-- simple for see all exams
CREATE PROCEDURE GetExams()
BEGIN
    SELECT * FROM exams;
END $$

DELIMITER ;

CALL GetExams();

DELIMITER $$

-- top student
CREATE PROCEDURE TopStudent()
BEGIN
    SELECT 
        users.name,
        results.regNo,
        SUM(results.score) AS total_score
    FROM results
    JOIN users ON users.regNo = results.regNo
    GROUP BY results.regNo, users.name
    ORDER BY total_score DESC
    LIMIT 1;
END $$

DELIMITER ;
CALL TopStudent();
-- ---------------------------
--           INDEXES
-- ---------------------------

CREATE INDEX idx_email
ON users(email);

CREATE INDEX idx_regNo
ON users(regNo);

CREATE INDEX idx_exam
ON results(exam);

CREATE INDEX idx_user_exam
ON results(regNo, exam);

SHOW INDEX FROM results;
 
 -- index + join
 SELECT users.name, results.score
FROM users
JOIN results ON users.regNo = results.regNo;

-- inserted new user just for testing.
INSERT INTO users(name, email, regNo, password)
VALUES ('Ali', 'ali@gmail.com', '101', '1234');

-- -----------------------------------
--             TRIGGERS
-- -----------------------------------
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- insert Delete trigger
DELIMITER $$

CREATE TRIGGER after_result_insert
AFTER INSERT ON results
FOR EACH ROW
BEGIN
    INSERT INTO logs(message)
    VALUES (CONCAT('Result added for regNo: ', NEW.regNo));
END $$

DELIMITER ;


-- After Delete trigger
DELIMITER $$

CREATE TRIGGER after_result_delete
AFTER DELETE ON results
FOR EACH ROW
BEGIN
    INSERT INTO logs(message)
    VALUES (CONCAT('Result deleted for regNo: ', OLD.regNo));
END $$

DELIMITER ;

-- update Delete trigger
DELIMITER $$

DROP TRIGGER after_score_update;
CREATE TRIGGER after_score_update
AFTER UPDATE ON results
FOR EACH ROW
BEGIN
    INSERT INTO logs(message)
    VALUES (
        CONCAT(
            'Score updated for regNo: ',
            OLD.regNo,
            ' → ',
            NEW.score
        )
    );
END $$

DELIMITER ;


-- trigger after_score_update
INSERT INTO results (regNo, exam, score, total)
VALUES ('CS241218', 'Database', 5, 10);
SELECT * FROM logs;

UPDATE results
SET score = 7
WHERE regNo = 'CS241218';

DELETE FROM users
WHERE regNo = 'CS241218';
SHOW TRIGGERS;
SHOW CREATE TRIGGER after_result_insert;
SELECT * FROM users WHERE regNo = 'CS241218';


-- login log saving trigger
CREATE TABLE login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- triger give output when new user login mean jese user table main update hoga then yahn bhi.
DELIMITER $$

CREATE TRIGGER after_user_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO login_logs(user_id)
    VALUES (NEW.id);
END $$

DELIMITER ;
SHOW CREATE TRIGGER after_user_login;
SELECT * FROM login_logs;

-- exam creation trigger.
CREATE TABLE exam_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- exam insertion logs
DELIMITER $$

CREATE TRIGGER after_exam_insert
AFTER INSERT ON exams
FOR EACH ROW
BEGIN
    INSERT INTO exam_logs(message)
    VALUES (CONCAT('New exam created: ', NEW.name));
END $$

DELIMITER ;

INSERT INTO exams(name, marks, duration)
VALUES ('General knowledge', 10, 480);
SELECT * FROM exam_logs;

-- check result after insertion pass/fail h\show in logs
DELIMITER $$

CREATE TRIGGER check_result_status
AFTER INSERT ON results
FOR EACH ROW
BEGIN
    IF NEW.score >= 50 THEN
        INSERT INTO logs(message)
        VALUES (CONCAT('PASS: regNo ', NEW.regNo));
    ELSE
        INSERT INTO logs(message)
        VALUES (CONCAT('FAIL: regNo ', NEW.regNo));
    END IF;
END $$

DELIMITER ;

INSERT INTO results(regNo, exam, score, total)
VALUES ('CS24785', 'Database', 4, 10);
SELECT * FROM logs ORDER BY id DESC; -- show fail/pass in logs through this trigger