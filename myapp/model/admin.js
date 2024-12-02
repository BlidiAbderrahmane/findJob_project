const db = require('./db.js');

module.exports = {
    // Method to delete an admin by their ID
    deleteById: function(adminId, callback) {
        let sql = "DELETE FROM admin WHERE admin_id = ?";
        db.query(sql, adminId, function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0);
        });
    },

    // Method to get an admin by their ID
    getById: function(adminId, callback) {
        let sql = "SELECT * FROM admin WHERE admin_id = ?";
        db.query(sql, adminId, function(err, result) {
            if (err) throw err;
            callback(result[0]); 
        });
    },

    // Method to retrieve all admins
    getAll: function(callback) {
        let sql = "SELECT * FROM admin";
        db.query(sql, function(err, results) {
            if (err) throw err;
            callback(results); 
        });
    },  
    
    // Method to create a new admin entry
    create: function(userId, callback) {
        let sql = "INSERT INTO admin (admin_id) VALUES (?)";
        db.query(sql, userId, function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0);
        });
    },
};
