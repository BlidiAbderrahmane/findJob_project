-- 1. Insert Data into users Table

INSERT INTO users (email, last_name, first_name, phone, active, creation_date, status, password)
VALUES
    ('admin@example.com', 'Admin', 'User', '1234567890', TRUE, NOW(), 'admin', 'password123'),
    ('recruiter@example.com', 'Smith', 'John', '0987654321', TRUE, NOW(), 'recruiter', 'recruiterPass'),
    ('candidate@example.com', 'Doe', 'Jane', '5555555555', TRUE, NOW(), 'candidate', 'candidatePass');

-- 2. Insert Data into admin Table
-- Assuming the admin user has a `user_id` of 1
INSERT INTO admin (admin_id)
VALUES
    (1);

-- 3. Insert Data into organization Table
-- Assuming the admin has an `admin_id` of 1
INSERT INTO organization (siren, NAME, TYPE, headquarters, added_by)
VALUES
    ('123456789', 'Tech Corp', 'sarl', '123 Tech Avenue', 1),
    ('987654321', 'Green Org', 'association', '456 Green St', 1);

-- 4. Insert Data into recruiter Table
-- Assuming `recruiter_id` in `users` for the recruiter user is 2 and `organization_id` in `organization` is 1
INSERT INTO recruiter (recruiter_id, validated_by, organization_id)
VALUES
    (2, 1, 1);

-- 5. Insert Data into job Table
INSERT INTO job (title)
VALUES
    ('Software Engineer'),
    ('Data Analyst'),
    ('Product Manager');

-- 6. Insert Data into job_description Table
-- Assuming `organization_id` is 1, `recruiter_id` is 2, and `job_id` is 1 (for Software Engineer)
INSERT INTO job_description (title, LEVEL, supervisor, location, hours_per_week, remote_work, organization_id, recruiter_id, job_id)
VALUES
    ('Junior Software Engineer', 'non-executive', 'Senior Developer', 'New York', 40, FALSE, 1, 2, 1),
    ('Data Analyst', 'executive', 'Data Science Lead', 'San Francisco', 35, TRUE, 1, 2, 2);

-- 7. Insert Data into job_offer Table
-- Assuming `description_id` for Junior Software Engineer in `job_description` is 1
INSERT INTO job_offer (status, validation_date, notes, document_count, description_id, description)
VALUES
    ('published', NOW(), 'Looking for a junior software engineer', 3, 1, 'This is a full-time position.'),
    ('published', NOW(), 'Data analyst position available', 2, 2, 'Remote work is available.');

-- 8. Insert Data into application Table
-- Assuming `user_id` for candidate is 3 and `offer_id` for the first job offer is 1
INSERT INTO application (application_date, user_id, offer_id)
VALUES
    (NOW(), 3, 1),
    (NOW(), 3, 2);

-- 9. Insert Data into document Table
INSERT INTO document (FILE)
VALUES
    ('dummy document content 1'),
    ('dummy document content 2'),
    ('dummy document content 3');

-- 10. Insert Data into folder Table
-- Assuming `application_id` is 1 for the first application and `document_id` values are 1, 2, and 3
INSERT INTO folder (application_id, document_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3);

-- 11. Insert Data into organization_request Table
-- Assuming `recruiter_id` is 2
INSERT INTO organization_request (NAME, TYPE, headquarters, siren, recruiter_id)
VALUES
    ('New Org', 'sarl', '789 New Ave', '555555555', 2),
    ('Eco Corp', 'association', '321 Green Blvd', '444444444', 2);


-- 12. Insert Data into recruiter_request Table
-- Assuming `organization_id` is 1 and `user_id` is 3
INSERT INTO recruiter_request (organization_id, user_id)
VALUES
    (1, 3);