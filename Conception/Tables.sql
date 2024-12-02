-- Drop existing tables if they exist
DROP TABLE IF EXISTS folder;
DROP TABLE IF EXISTS document;
DROP TABLE IF EXISTS application;
DROP TABLE IF EXISTS job_offer;
DROP TABLE IF EXISTS job_description;
DROP TABLE IF EXISTS job;
DROP TABLE IF EXISTS recruiter_request;
DROP TABLE IF EXISTS organization_request;
DROP TABLE IF EXISTS recruiter;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE,
    last_name VARCHAR(30) NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    creation_date TIMESTAMP,
    status ENUM
        ('candidate', 'recruiter', 'admin') NOT NULL DEFAULT 'candidate',
        password VARCHAR(30) NOT NULL
);
-- Create admin table
CREATE TABLE admin(
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    FOREIGN KEY(admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- Create organization table
CREATE TABLE organization(
    organization_id INT PRIMARY KEY AUTO_INCREMENT,
    siren VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL CHECK
        (
            type IN(
                'association',
                'eurl',
                'sarl',
                'sasu',
                'other'
            )
        ),
        headquarters VARCHAR(255) NOT NULL,
        added_by INT NOT NULL,
        FOREIGN KEY(added_by) REFERENCES admin(admin_id) ON DELETE CASCADE
);
-- Create recruiter table
CREATE TABLE recruiter(
    recruiter_id INT PRIMARY KEY AUTO_INCREMENT,
    validated_by INT NOT NULL,
    organization_id INT NOT NULL,
    FOREIGN KEY(organization_id) REFERENCES organization(organization_id) ON DELETE CASCADE,
    FOREIGN KEY(validated_by) REFERENCES admin(admin_id) ON DELETE CASCADE,
    FOREIGN KEY(recruiter_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- Create job table
CREATE TABLE job(
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL
);
-- Create job_description table
CREATE TABLE job_description(
    description_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(20) CHECK
        (
            level IN(
                'executive',
                'non-executive',
                'other'
            )
        ),
        supervisor VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        hours_per_week INT NOT NULL,
        remote_work BOOLEAN NOT NULL,
        organization_id INT NOT NULL,
        recruiter_id INT NOT NULL,
        job_id INT NOT NULL,
        FOREIGN KEY(organization_id) REFERENCES organization(organization_id) ON DELETE CASCADE,
        FOREIGN KEY(job_id) REFERENCES job(job_id) ON DELETE CASCADE,
        FOREIGN KEY(recruiter_id) REFERENCES recruiter(recruiter_id) ON DELETE CASCADE
);
-- Create job_offer table
CREATE TABLE job_offer(
    offer_id INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR
        (20) NOT NULL
    CHECK
        (
        status
            IN(
                'not published',
                'published',
                'expired'
            )
    ),
    validation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes VARCHAR(255) NOT NULL,
    document_count INT NOT NULL,
    description_id INT NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY(description_id) REFERENCES job_description(description_id) ON DELETE CASCADE
);
-- Create application table
CREATE TABLE application(
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id INT NOT NULL,
    offer_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY(offer_id) REFERENCES job_offer(offer_id) ON DELETE CASCADE
);
-- Create document table
CREATE TABLE document(
    document_id INT PRIMARY KEY AUTO_INCREMENT,
    file BLOB NOT NULL
);
-- Create folder table
CREATE TABLE folder(
    application_id INT,
    document_id INT,
    PRIMARY KEY(application_id, document_id),
    FOREIGN KEY(application_id) REFERENCES application(application_id) ON DELETE CASCADE,
    FOREIGN KEY(document_id) REFERENCES document(document_id) ON DELETE CASCADE
);
-- Create organization_request table
CREATE TABLE organization_request(
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL CHECK
        (
            type IN(
                'association',
                'eurl',
                'sarl',
                'sasu',
                'other'
            )
        ),
        headquarters VARCHAR(255) NOT NULL,
        siren VARCHAR(255) NOT NULL,
        recruiter_id INT NOT NULL,
        FOREIGN KEY(recruiter_id) REFERENCES recruiter(recruiter_id) ON DELETE CASCADE
);
-- Create recruiter_request table
CREATE TABLE recruiter_request(
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(organization_id) REFERENCES organization(organization_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);