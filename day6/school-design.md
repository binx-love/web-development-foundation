# School Database Design

## Students Table

The `students` table stores information about each student in the school system. Each student has a unique `student_id`, a name and an email address. The student ID is the primary key, while the email address is also unique so that two students cannot register using the same email address.

## Courses Table

The `courses` table stores information about courses offered by the school. Each course has a unique `course_id` as its primary key and a `course_name` that identifies the course.

## Enrolments Table

The `enrolments` table records the fact that a student is enrolled on a particular course. It contains foreign keys linking to both the `students` and `courses` tables. It also stores the student's grade for that course.

## Relationships

There is a one-to-many relationship between `students` and `enrolments`. One student can have many enrolment records, while each enrolment belongs to one student.

There is also a one-to-many relationship between `courses` and `enrolments`. One course can have many enrolment records, while each enrolment belongs to one course.

Overall, `students` and `courses` have a many-to-many relationship because one student can take many courses and one course can have many students. The `enrolments` table is needed as a join table to represent this relationship. Each row in `enrolments` represents one student taking one course and can also store information about that enrolment, such as the student's grade. The `UNIQUE (student_id, course_id)` rule prevents the same student from being enrolled on the same course more than once.

## Index

I would add an index on `enrolments.student_id` because the database will frequently need to find all courses belonging to a particular student. An index on this column would make those searches and joins faster, especially as the number of students and enrolments increases.

## SQL or NoSQL?

I would choose SQL for this school system because the data has clear relationships between students, courses and enrolments. Students and courses have a many-to-many relationship that is naturally represented using a relational join table. SQL also provides primary keys, foreign keys, unique constraints and structured queries such as JOIN, GROUP BY and LEFT JOIN, which are useful for maintaining data accuracy and retrieving related information. A NoSQL database could work for a less structured system, but SQL is a better fit for this highly structured and relational data.