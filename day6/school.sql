-- ============================================
-- Day 6 Assignment: School Database
-- SQLite
-- ============================================


-- ============================================
-- 1. Create tables
-- ============================================

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);


CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL
);


CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,

    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),

    UNIQUE (student_id, course_id)
);


-- ============================================
-- 2. Insert students
-- ============================================

INSERT INTO students (student_id, name, email)
VALUES
    (1, 'Bianca Omondi', 'bianca@example.com'),
    (2, 'Grace Wanjiku', 'grace@example.com'),
    (3, 'Daniel Mwangi', 'daniel@example.com'),
    (4, 'Brian Otieno', 'brian@example.com');


-- ============================================
-- 3. Insert courses
-- ============================================

INSERT INTO courses (course_id, course_name)
VALUES
    (1, 'Database Systems'),
    (2, 'Web Development'),
    (3, 'Geographic Information Systems');


-- ============================================
-- 4. Insert enrolments
-- ============================================

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade)
VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'B'),
    (4, 2, 3, 'A'),
    (5, 3, 2, 'A');


-- ============================================
-- 5. Query: All courses for one student
--    Search by student name
-- ============================================

SELECT
    students.name AS student_name,
    courses.course_name,
    enrolments.grade
FROM students
JOIN enrolments
    ON students.student_id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.course_id
WHERE students.name = 'Bianca Omondi';


-- ============================================
-- 6. Query: All students on one course
-- ============================================

SELECT
    courses.course_name,
    students.name AS student_name
FROM courses
JOIN enrolments
    ON courses.course_id = enrolments.course_id
JOIN students
    ON enrolments.student_id = students.student_id
WHERE courses.course_name = 'Database Systems';


-- ============================================
-- 7. Query: Number of students per course
-- ============================================

SELECT
    courses.course_name,
    COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments
    ON courses.course_id = enrolments.course_id
GROUP BY courses.course_id, courses.course_name;


-- ============================================
-- 8. Query: Students who have no enrolments
-- ============================================

SELECT
    students.student_id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments
    ON students.student_id = enrolments.student_id
WHERE enrolments.student_id IS NULL;


-- ============================================
-- 9. Update one enrolment's grade
-- ============================================

UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 3
  AND course_id = 2;