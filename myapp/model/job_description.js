const db = require('./db.js');

module.exports = {
    // Method to retrieve a job description by its ID
    getById: function(descriptionId, callback) {
        db.query("SELECT * FROM job_description WHERE description_id = ?", [descriptionId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve all job descriptions
    getAll: function(callback) {
        db.query("SELECT * FROM job_description", function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve all job descriptions by recruiter ID
    getAllByRecruiterId: function(recruiterId, callback) {
        const sql = `
            SELECT 
                job_description.description_id, 
                job_description.title, 
                job_description.level, 
                job_description.supervisor, 
                job_description.job_id, 
                job_description.location, 
                job_description.hours_per_week, 
                job_description.remote_work, 
                job_description.organization_id 
            FROM 
                job_description 
            WHERE 
                job_description.recruiter_id = ?
        `;
        db.query(sql, [recruiterId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to create a new job description
    create: function(title, level, supervisor, jobId, location, hoursPerWeek, remoteWork, organizationId, recruiterId, callback) {
        const sql = `
            INSERT INTO job_description (title, level, supervisor, job_id, location, hours_per_week, remote_work, organization_id, recruiter_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [title, level, supervisor, jobId, location, hoursPerWeek, remoteWork, organizationId, recruiterId];

        db.query(sql, params, function(err, result) {
            if (err) {
                console.error('Error executing SQL query:', err);
                return callback(err);
            }

            callback(null, result.insertId);
        });
    },

    // Method to update a job description
    update: function(descriptionId, title, level, supervisor, jobId, location, hoursPerWeek, remoteWork, organizationId, callback) {
        const sql = `
            UPDATE job_description 
            SET title = ?, level = ?, supervisor = ?, job_id = ?, location = ?, hours_per_week = ?, remote_work = ?, organization_id = ? 
            WHERE description_id = ?
        `;
        const params = [title, level, supervisor, jobId, location, hoursPerWeek, remoteWork, organizationId, descriptionId];

        db.query(sql, params, function(err, result) {
            if (err) return callback(err, null);
            callback(null, result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to delete a job description by its ID
    deleteById: function(descriptionId, callback) {
        const sql = "DELETE FROM job_description WHERE description_id = ?";
        db.query(sql, [descriptionId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to retrieve all distinct locations
    getAllDistinctLocations: function(callback) {
        const sql = "SELECT DISTINCT location FROM job_description ORDER BY location";
        db.query(sql, function(err, result) {
            if (err) throw err;
            callback(result);
        });
    },

    // Method to retrieve all distinct locations by recruiter ID
    getAllDistinctLocationsByRecruiterId: function(recruiterId, callback) {
        const sql = "SELECT DISTINCT location FROM job_description WHERE recruiter_id = ?";
        db.query(sql, [recruiterId], function(err, results) {
            if (err) {
                console.error('Database query error (locations):', err);
                return callback(err, null);
            }
            console.log('Locations fetched:', results);
            callback(results);
        });
    },

    // Method to retrieve all distinct organizations with job descriptions
    getAllDistinctOrganizations: function(callback) {
        const sql = "SELECT DISTINCT organization.name FROM job_description JOIN organization ON job_description.organization_id = organization.organization_id";
        db.query(sql, function(err, result) {
            if (err) throw err;
            callback(result);
        });
    },

    // Method to retrieve all distinct jobs
    getAllDistinctJobs: function(callback) {
        const sql = "SELECT DISTINCT j.title FROM job_description d JOIN job j ON d.job_id = j.job_id"; 
        db.query(sql, function(err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(results);
        });
    },
    
    // Method to retrieve all distinct jobs by recruiter ID
    getAllDistinctJobsByRecruiter: function(recruiterId, callback) {
        const sql = "SELECT DISTINCT j.title FROM job_description d JOIN job j ON d.job_id = j.job_id WHERE d.recruiter_id = ?"; 
        db.query(sql, [recruiterId], function(err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(results);
        });
    },

    // Method to retrieve the job description by job offer ID
    getDescriptionByOfferId: function (offerId, callback) {
        const sql = `
            SELECT *
            FROM job_description
            WHERE description_id = (
                SELECT description_id
                FROM job_offer
                WHERE offer_id = ?
            )
        `;
    
        db.query(sql, [offerId], function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]); // Return the first record if found
        });
    }
};
