const db = require('./db.js');

module.exports = {
    // Method to retrieve an organization by its ID
    getById: function(organizationId, callback) {
        db.query("SELECT * FROM organization WHERE organization_id = ?", [organizationId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve all organizations
    getAll: function(callback) {
        db.query("SELECT * FROM organization", function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve an organization by its name
    getByName: function(organizationName, callback) {
        db.query("SELECT * FROM organization WHERE name = ?", [organizationName], function(err, results) {
            if (err) {
                callback(err, null);
                return;
            }
            if (results.length > 0) {
                callback(null, results[0]);
            } else {
                callback(null, null);
            }
        });
    },

    // Method to create a new organization
    create: function(siren, name, type, headquarters, addedById, callback) {
        const sql = "INSERT INTO organization (siren, name, type, headquarters, added_by) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [siren, name, type, headquarters, addedById], function(err, result) {
            if (err) throw err;
            callback(result.insertId);  
        });
    },

    // Method to update an organization
    update: function(organizationId, siren, name, type, headquarters, callback) {
        const sql = "UPDATE organization SET siren = ?, name = ?, type = ?, headquarters = ? WHERE organization_id = ?";
        db.query(sql, [siren, name, type, headquarters, organizationId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to delete an organization by its ID
    deleteById: function(organizationId, callback) {
        const sql = "DELETE FROM organization WHERE organization_id = ?";
        db.query(sql, [organizationId], function(err, result) {
            if (err) return callback(err); 
            callback(null, result.affectedRows > 0); 
        });
    },

    // Method to retrieve the headquarters of an organization by ID
    getHeadquarters: function(organizationId, callback) {
        db.query("SELECT headquarters FROM organization WHERE organization_id = ?", [organizationId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }, 

    // Method to retrieve recruiters associated with organizations
    getRecruiters: function(callback) {
        const sql = `
            SELECT 
                u.user_id AS recruiter_id, 
                u.last_name AS recruiter_last_name, 
                u.first_name AS recruiter_first_name, 
                u.email AS recruiter_email 
            FROM 
                organization o 
            JOIN 
                recruiter r ON o.added_by = r.recruiter_id 
            JOIN 
                users u ON r.recruiter_id = u.user_id
        `;
        db.query(sql, function(err, results) {
            if (err) throw err;
            console.log("Recruiters fetched:", results);
            callback(results);
        });
    },

    // Method to filter organizations by name, type, and recruiter
    filterOrganization: function(name, type, recruiterId, callback) {
        const sql = `
            SELECT * 
            FROM organization 
            WHERE 
                (name = ? OR ? = '') 
                AND (type = ? OR ? = '') 
                AND (added_by = ? OR ? = '')
        `;
        db.query(sql, [name, name, type, type, recruiterId, recruiterId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to filter job offers based on various criteria
    filterOffer: function(recruiterId, location, type, remoteWork, organizationId, callback) {
        const sql = `
            SELECT 
                job_offer.*, 
                job_description.location, 
                job_description.level AS type, 
                job_description.remote_work
            FROM 
                job_offer
            JOIN 
                job_description ON job_offer.description_id = job_description.description_id
            WHERE 
                (job_description.recruiter_id = ? OR ? = '')
                AND (job_description.location = ? OR ? = '')
                AND (job_description.level = ? OR ? = '')
                AND (job_description.remote_work = ? OR ? = '')
                AND (job_description.organization_id = ? OR ? = '')
        `;
        
        db.query(sql, [
            recruiterId, recruiterId, 
            location, location, 
            type, type, 
            remoteWork, remoteWork, 
            organizationId, organizationId
        ], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }
};
