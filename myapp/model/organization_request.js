const db = require('./db.js');

module.exports = {
    // Method to get all organization requests
    getAll: function(callback) {
        const sql = `
            SELECT 
                o.request_id AS request_id, 
                o.name AS organization_name, 
                o.siren AS siren, 
                o.type AS type, 
                o.headquarters AS headquarters, 
                u.last_name AS recruiter_last_name, 
                u.first_name AS recruiter_first_name, 
                u.email AS recruiter_email 
            FROM 
                organization_request o 
            JOIN 
                recruiter r ON o.recruiter_id = r.recruiter_id 
            JOIN 
                users u ON r.recruiter_id = u.user_id
        `;
        db.query(sql, function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to get an organization request by its ID
    getById: function(requestId, callback) {
        const sql = `
            SELECT 
                o.request_id AS request_id, 
                o.name AS organization_name, 
                o.siren AS siren, 
                o.type AS type, 
                o.headquarters AS headquarters, 
                u.last_name AS recruiter_last_name, 
                u.first_name AS recruiter_first_name, 
                u.email AS recruiter_email 
            FROM 
                organization_request o 
            JOIN 
                recruiter r ON o.recruiter_id = r.recruiter_id 
            JOIN 
                users u ON r.recruiter_id = u.user_id 
            WHERE 
                o.request_id = ?
        `;
        db.query(sql, [requestId], function(err, results) {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },
    
    // Method to get organization requests by a specific recruiter ID
    getByRecruiter: function(recruiterId, callback) {
        const sql = "SELECT * FROM organization_request WHERE recruiter_id = ?";
        db.query(sql, [recruiterId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }, 

    // Method to filter organization requests
    filterOrganizationRequest: function(organizationName, recruiterLastName, type, callback) {
        const sql = `
            SELECT 
                organization_name, 
                recruiter_last_name, 
                type, 
                siren, 
                headquarters, 
                recruiter_last_name, 
                recruiter_first_name, 
                recruiter_email
            FROM (
                SELECT 
                    o.name AS organization_name, 
                    o.siren AS siren, 
                    o.type AS type, 
                    o.headquarters AS headquarters, 
                    u.last_name AS recruiter_last_name, 
                    u.first_name AS recruiter_first_name, 
                    u.email AS recruiter_email 
                FROM 
                    organization_request o 
                JOIN 
                    recruiter r ON o.recruiter_id = r.recruiter_id 
                JOIN 
                    users u ON r.recruiter_id = u.user_id
            ) AS subquery 
            WHERE 
                (organization_name = ? OR ? = '') 
                AND (recruiter_last_name = ? OR ? = '') 
                AND (type = ? OR ? = '')
        `;
        
        db.query(sql, [organizationName, organizationName, recruiterLastName, recruiterLastName, type, type], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }, 
    
    // Method to get all recruiter requests
    getAllRecruiterRequests: function(callback) { 
        const sql = `
            SELECT 
                u.last_name AS last_name, 
                u.first_name AS first_name 
            FROM 
                organization_request o 
            JOIN 
                users u ON o.recruiter_id = u.user_id;
        `; 
        db.query(sql, function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }, 

    // Method to create a new organization request
    create: function(siren, name, type, headquarters, recruiterId, callback) {
        const sql = "INSERT INTO organization_request (siren, name, type, headquarters, recruiter_id) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [siren, name, type, headquarters, recruiterId], function(err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },

    // Method to delete an organization request by its ID
    deleteById: function(requestId, callback) {
        const sql = "DELETE FROM organization_request WHERE request_id = ?";
        db.query(sql, [requestId], function(err, result) {
            if (err) return callback(err); 
            callback(null, result.affectedRows > 0); 
        });
    },
};
