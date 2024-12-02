const db = require('./db.js');

module.exports = {
    // Method to insert a new application into the application table
    insert: function(applicationDate, offerId, userId, callback) {
        let sql = "INSERT INTO application (application_date, offer_id, user_id) VALUES (?, ?, ?)";
        db.query(sql, [applicationDate, offerId, userId], function(err, result) {
            if (err) throw err;
            callback(result.insertId); 
        });
    },

    // Method to delete an application from the application table
    delete: function(applicationId, callback) {
        let sql = "DELETE FROM application WHERE application_id = ?";
        db.query(sql, applicationId, function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to retrieve all applications
    getAll: function(callback) {
        let sql = `
            SELECT application.*, 
                   users.last_name AS user_last_name, 
                   users.first_name AS user_first_name, 
                   users.email AS user_email, 
                   users.phone AS user_phone, 
                   job_offer.status AS offer_status, 
                   job_offer.validation_date AS offer_validation_date, 
                   job_offer.notes AS offer_notes, 
                   job_offer.document_count AS offer_document_count, 
                   job_offer.description AS offer_description 
            FROM application 
            JOIN users ON application.user_id = users.user_id 
            JOIN job_offer ON application.offer_id = job_offer.offer_id
        `;
        db.query(sql, function(err, results) {
            if (err) throw err;
            callback(results); 
        });
    },

    // Method to retrieve applications related to job offers of a specific recruiter
    getApplicationsByRecruiterId: function(recruiterId, callback) {
        let sql = `
            SELECT application.*, 
                   users.last_name AS user_last_name, 
                   users.first_name AS user_first_name, 
                   users.email AS user_email, 
                   users.phone AS user_phone, 
                   job_offer.status AS offer_status, 
                   job_offer.validation_date AS offer_validation_date, 
                   job_offer.notes AS offer_notes, 
                   job_offer.document_count AS offer_document_count, 
                   job_offer.description AS offer_description 
            FROM application 
            JOIN users ON application.user_id = users.user_id 
            JOIN job_offer ON application.offer_id = job_offer.offer_id 
            JOIN job_description ON job_offer.description_id = job_description.description_id 
            WHERE job_description.recruiter_id = ?
        `;
        db.query(sql, [recruiterId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve all job offers by a recruiter's ID
    getOffersByRecruiterId: function(recruiterId, callback) {
        let sql = `
            SELECT job_offer.*
            FROM job_offer
            JOIN job_description ON job_offer.description_id = job_description.description_id
            WHERE job_description.recruiter_id = ?
        `;
        db.query(sql, [recruiterId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to filter applications
    filterApplication: function(applicationDate, userLastName, userFirstName, offerId, callback) {
        let sql = `
        SELECT 
            application.*, 
            users.last_name AS user_last_name,
            users.first_name AS user_first_name,
            job_offer.notes AS offer_notes
        FROM 
            application
        JOIN 
            users ON application.user_id = users.user_id
        JOIN
            job_offer ON application.offer_id = job_offer.offer_id
        WHERE 
            (DATE(application.application_date) = ? OR ? = '')
            AND (users.last_name LIKE ? OR ? = '')
            AND (users.first_name LIKE ? OR ? = '')
            AND (application.offer_id = ? OR ? = '')
        `;

        const params = [
            applicationDate, applicationDate,
            `%${userLastName}%`, userLastName,
            `%${userFirstName}%`, userFirstName,
            offerId, offerId
        ];

        db.query(sql, params, function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve all applications by a specific user
    getAllByUser: function(userId, callback) {
        db.query(`
            SELECT a.*, j.notes AS notes, j.description AS description 
            FROM application a
            JOIN job_offer j ON a.offer_id = j.offer_id
            WHERE a.user_id = ?
        `, [userId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },
};
