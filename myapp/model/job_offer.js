const db = require('./db.js');
const { getAllDistinctLocations } = require('./job_description.js');
const organizationModel = require('./organization.js');

module.exports = {
    // Method to retrieve a job offer by its ID
    getById: function(offerId, callback) {
        db.query("SELECT * FROM job_offer WHERE offer_id = ?", [offerId], function(err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    },

    // Method to retrieve all job offers
    getAll: function(callback) {
        db.query("SELECT * FROM job_offer", function(err, results) {
            callback(results);
        });
    },

    // Method to retrieve all job offers the user has not applied for
    getAllExceptUserApplications: function(userId, callback) {
        const sql = `
            SELECT * FROM job_offer jo
            WHERE jo.offer_id NOT IN (
                SELECT a.offer_id FROM application a WHERE a.user_id = ? 
            ) AND jo.status = 'published'; 
        `;
        db.query(sql, [userId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to create a new job offer
    create: function(status, validationDate, notes, documentCount, descriptionId, description, callback) {
        const sql = "INSERT INTO job_offer (status, validation_date, notes, document_count, description_id, description) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [status, validationDate, notes, documentCount, descriptionId, description], function(err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },

    // Method to update a job offer
    update: function(offerId, status, validationDate, notes, documentCount, description, descriptionId, callback) {
        const sql = "UPDATE job_offer SET status = ?, validation_date = ?, notes = ?, document_count = ?, description = ?, description_id = ? WHERE offer_id = ?";
        db.query(sql, [status, validationDate, notes, documentCount, description, descriptionId, offerId], function(err, result) {
            if (err) throw err;
            if (typeof callback === 'function') {
                callback(result.affectedRows > 0); // Returns true if at least one row was affected
            } else {
                console.error("Callback is not a function");
            }
        });
    },
    
    // Method to delete a job offer by its ID
    deleteById: function(offerId, callback) {
        const sql = "DELETE FROM job_offer WHERE offer_id = ?";
        db.query(sql, offerId, function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Retrieve title and ID of job descriptions created by a recruiter
    getDescriptionsByRecruiterId: function(recruiterId, callback) {
        const sql = `
            SELECT job_description.description_id, job_description.title 
            FROM job_description 
            WHERE job_description.recruiter_id = ?
        `;
        db.query(sql, [recruiterId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to filter job offers based on multiple criteria
    filterOffer: function(recruiterId, notes, location, jobTitle, remoteWork, callback) {
        console.log('Filter parameters:', { recruiterId, indication, location, job, remoteWork });

        const sql = `
        SELECT 
            job_offer.*, 
            job_offer.notes, 
            job_description.location, 
            job.title AS job_title, 
            job_description.remote_work
        FROM 
            job_offer
        JOIN 
            job_description ON job_offer.description_id = job_description.description_id
        JOIN
            job ON job_description.job_id = job.job_id
        WHERE 
            (job_description.recruiter_id = ? OR ? = '')
            AND (job_offer.notes LIKE ? OR ? = '')
            AND (job_description.location = ? OR ? = '')
            AND (job.title = ? OR ? = '')
            AND (job_description.remote_work = ? OR ? = '')
        `;
       
        const params = [
            recruiterId, recruiterId, 
            notes, notes,
            location, location, 
            jobTitle, jobTitle, 
            remoteWork, remoteWork
        ];
        
        db.query(sql, params, function(err, results) {
            if (err) {
                console.error('Database query error:', err);
                return callback(err);
            } // Pass error to callback
            callback(null, results); // Pass results with no error
        });
    },

    // Method to retrieve a job description by job offer ID
    getDescriptionByOfferId: function(offerId, callback) {
        const sql = `
            SELECT *
            FROM job_description
            WHERE description_id = (
                SELECT description_id
                FROM job_offer
                WHERE offer_id = ?
            )
        `;
        db.query(sql, offerId, function(err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        });
    },

    // Method to filter job offers including organization information
    filterOfferWithOrganization: function(organizationName, notes, location, jobTitle, remoteWork, callback) {
        const sql = `
        SELECT 
            jo.*, 
            jo.notes, 
            jd.location, 
            j.title AS job_title, 
            jd.remote_work
        FROM 
            job_offer jo
        JOIN 
            job_description jd ON jo.description_id = jd.description_id
        JOIN
            job j ON jd.job_id = j.job_id
        JOIN
            recruiter r ON jd.recruiter_id = r.recruiter_id
        JOIN
            organization o ON r.organization_id = o.organization_id
        WHERE 
            (o.name = ? OR ? = '')
            AND (jo.notes LIKE ? OR ? = '')
            AND (jd.location = ? OR ? = '')
            AND (j.title = ? OR ? = '')
            AND (jd.remote_work = ? OR ? = '')
        `;
    
        const params = [
            organizationName, organizationName,
            `%${notes}%`, notes,
            location, location, 
            jobTitle, jobTitle, 
            remoteWork, remoteWork
        ];
    
        db.query(sql, params, function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },  
    
    // Method to filter job offers with organization and user's applications
    filterOfferApplications: function(organizationName, notes, location, jobTitle, remoteWork, userId, callback) {
        const sql = `
        SELECT 
            jo.*, 
            jo.notes, 
            jd.location, 
            j.title AS job_title, 
            jd.remote_work,
            a.application_date 
        FROM 
            job_offer jo
        JOIN 
            job_description jd ON jo.description_id = jd.description_id
        JOIN
            job j ON jd.job_id = j.job_id
        JOIN
            recruiter r ON jd.recruiter_id = r.recruiter_id
        JOIN
            organization o ON r.organization_id = o.organization_id
        JOIN
            application a ON jo.offer_id = a.offer_id 
        WHERE 
            (o.name = ? OR ? = '')
            AND (jo.notes LIKE ? OR ? = '')
            AND (jd.location = ? OR ? = '')
            AND (j.title = ? OR ? = '')
            AND (jd.remote_work = ? OR ? = '')
            AND a.user_id = ? 
        `;
    
        const params = [
            organizationName, organizationName,
            `%${notes}%`, notes,
            location, location, 
            jobTitle, jobTitle, 
            remoteWork, remoteWork,
            userId
        ];
    
        db.query(sql, params, function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },    
};    
