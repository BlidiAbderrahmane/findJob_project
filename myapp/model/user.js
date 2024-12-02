const db = require('./db.js');

module.exports = {
    // Method to retrieve all users
    readAll: function(callback) {
        db.query("SELECT * FROM users ORDER BY first_name, last_name", function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to filter users by status, active status, and username
    filterUser: function(status, active, username, callback) {
        const sql = `
            SELECT * 
            FROM users 
            WHERE 
                (status = ? OR ? = '') 
                AND (active = ? OR ? = '') 
                AND (last_name = ? OR ? = '')
        `;
        db.query(sql, [status, status, active, active, username, username], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to create a new user with default status 'candidate'
    create: function(email, password, lastName, firstName, phone, callback) {
        const sql = "INSERT INTO users (email, password, last_name, first_name, phone, status) VALUES (?, ?, ?, ?, ?, 'candidate')";
        db.query(sql, [email, password, lastName, firstName, phone], function(err, result) {
            if (err) return callback(err);  
            callback(null, result.insertId);  
        });
    },

    // Method to activate a user
    activate: function(id, callback) {
        const sql = "UPDATE users SET active = 1 WHERE user_id = ?";
        db.query(sql, [id], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0);
        });
    },

    // Method to deactivate a user
    deactivate: function(id, callback) {
        const sql = "UPDATE users SET active = 0 WHERE user_id = ?";
        db.query(sql, [id], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0);
        });
    },

    // Method to set a user as admin
    setAdmin: function(userId, callback) {
        const sql = "UPDATE users SET status = 'admin' WHERE user_id = ?";
        db.query(sql, [userId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0);
        });
    },

    // Method to set a user as recruiter
    setRecruiter: function(userId, callback) {
        const sql = "UPDATE users SET status = 'recruiter' WHERE user_id = ?";
        db.query(sql, [userId], function(err, result) {
            if (err) {
                console.error("Error updating user role to recruiter:", err);
                return callback(false);
            }
            callback(result.affectedRows > 0);
        });
    },

    // Method to check if a user is active by email
    isActive: function(email, callback) {
        const sql = "SELECT active FROM users WHERE email = ?";
        db.query(sql, [email], function(err, result) {
            if (err) throw err;
            callback(result[0].active);
        });
    },

    // Method to retrieve a user by their ID
    getById: function(id, callback) {
        const sql = "SELECT * FROM users WHERE user_id = ?";
        db.query(sql, [id], function(err, results) {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },

    // Method to update a user's information
    update: function(id, password, last_name, first_name, phone, callback) {
        if (!password) {
            const sql = "UPDATE users SET last_name = ?, first_name = ?, phone = ? WHERE user_id = ?";
            db.query(sql, [last_name, first_name, phone, id], function(err, result) {
                if (err) throw err;
                callback(result.affectedRows > 0);
            });
        } else {
            const sql = "UPDATE users SET password = ?, last_name = ?, first_name = ?, phone = ? WHERE user_id = ?";
            db.query(sql, [password, last_name, first_name, phone, id], function(err, result) {
                if (err) throw err;
                callback(result.affectedRows > 0);
            });
        }
    },

    // Method to find a user by email
    findByEmail: function(email, callback) {
        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email], function(err, results) {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);
            callback(null, results[0]);
            
        });
    }
};
