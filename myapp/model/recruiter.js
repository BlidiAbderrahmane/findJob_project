const db = require('./db.js');

module.exports = {
    // Method to retrieve a recruiter by their ID
    getById: function(recruiterId, callback) {
        db.query("SELECT * FROM recruiter WHERE recruiter_id = ?", [recruiterId], function(err, results) {
            if (err) {
                console.error('Error fetching recruiter:', err);
                return callback(err);
            }
            callback(null, results);
        });
    },

    // Method to retrieve all recruiters
    getAll: function(callback) {
        db.query("SELECT * FROM recruiter JOIN users ON recruiter.recruiter_id = users.user_id", 
        function(err, results) {
            if (err) throw err;
            callback(results);
        });
    }, 

    // Method to create a new recruiter
    create: function(validatedBy, organizationId, userId, callback) {
        const sql = "INSERT INTO recruiter (validated_by, organization_id, recruiter_id) VALUES (?, ?, ?)";
        db.query(sql, [validatedBy, organizationId, userId], function(err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },

    // Method to update the validation status of a recruiter
    updateValidity: function(recruiterId, validatedBy, callback) {
        const sql = "UPDATE recruiter SET validated_by = ? WHERE recruiter_id = ?";
        db.query(sql, [validatedBy, recruiterId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to delete a recruiter by their ID
    deleteById: function(recruiterId, callback) {
        const sql = "DELETE FROM recruiter WHERE recruiter_id = ?";
        db.query(sql, [recruiterId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },
};
