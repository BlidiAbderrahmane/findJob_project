const db = require('./db.js');

module.exports = {
    // Method to get all recruiter requests
    getAll: function(callback) {
        const sql = `
            SELECT 
                rr.request_id AS request_id, 
                o.name AS organization_name, 
                u.last_name AS user_last_name, 
                u.user_id AS recruiter_id, 
                u.first_name AS user_first_name, 
                u.email AS user_email, 
                u.phone AS user_phone 
            FROM 
                recruiter_request rr 
            JOIN 
                organization o ON rr.organization_id = o.organization_id 
            JOIN 
                users u ON rr.user_id = u.user_id
        `;
        db.query(sql, function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }, 

    // Method to filter recruiter requests based on organization and user names
    filterRecruiterRequest: function(organizationName, userName, callback) {
        const sql = `
            SELECT 
                organization_name, 
                user_last_name, 
                user_first_name, 
                user_email, 
                user_phone 
            FROM (
                SELECT 
                    o.name AS organization_name, 
                    u.last_name AS user_last_name, 
                    u.first_name AS user_first_name, 
                    u.email AS user_email, 
                    u.phone AS user_phone 
                FROM 
                    recruiter_request rr 
                JOIN 
                    organization o ON rr.organization_id = o.organization_id 
                JOIN 
                    users u ON rr.user_id = u.user_id
            ) AS subquery 
            WHERE 
                (organization_name = ? OR ? = '') 
                AND (user_last_name = ? OR ? = '')
        `;
        
        db.query(sql, [organizationName, organizationName, userName, userName], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to get organization ID by its name
    getOrganizationIdByName: function(name, callback) {
        const sql = "SELECT organization_id FROM organization WHERE name = ?";
        db.query(sql, [name], function(err, results) {
            if (err) throw err;
            if (results.length > 0) {
                callback(results[0].organization_id);
            } else {
                callback(null); // No result found
            }
        });
    },
    
    // Method to create a new recruiter request
    create: function(organizationId, userId, callback) {
        const sql = "INSERT INTO recruiter_request (organization_id, user_id) VALUES (?, ?)";
        db.query(sql, [organizationId, userId], function(err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    }, 

    // Method to delete a recruiter request by its ID
    deleteById: function(requestId, callback) {
        const sql = "DELETE FROM recruiter_request WHERE request_id = ?";
        db.query(sql, [requestId], function(err, result) {
            if (err) {
                console.error('Error executing delete query:', err);
                return callback(err, false);
            }
            callback(null, result.affectedRows > 0);
        });
    }, 
    
    // Method to get a recruiter request by its ID
    getById: function(requestId, callback) {
        const sql = `
            SELECT 
                rr.request_id AS request_id, 
                o.organization_id AS organization_id, 
                o.name AS organization_name, 
                u.last_name AS user_last_name, 
                u.user_id AS user_id, 
                u.first_name AS user_first_name, 
                u.email AS user_email, 
                u.phone AS user_phone 
            FROM 
                recruiter_request rr 
            JOIN 
                organization o ON rr.organization_id = o.organization_id 
            JOIN 
                users u ON rr.user_id = u.user_id 
            WHERE 
                rr.request_id = ?
        `;
        db.query(sql, [requestId], function(err, results) {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },
};
