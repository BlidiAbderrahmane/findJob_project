const db = require('./db.js');

module.exports = {
    // Method to retrieve a job by its ID
    getById: function(jobId, callback) {
        db.query("SELECT * FROM job WHERE job_id = ?", [jobId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to retrieve all jobs
    getAll: function(callback) {
        db.query("SELECT * FROM job ORDER BY title", function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to create a new job
    create: function(title, callback) {
        const sql = "INSERT INTO job (title) VALUES (?)";
        db.query(sql, [title], function(err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },

    // Method to update a job
    update: function(jobId, title, callback) {
        const sql = "UPDATE job SET title = ? WHERE job_id = ?";
        db.query(sql, [title, jobId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to delete a job by its ID
    deleteById: function(jobId, callback) {
        const sql = "DELETE FROM job WHERE job_id = ?";
        db.query(sql, [jobId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to retrieve a job by its title
    getByTitle: function(title, callback) {
        db.query("SELECT * FROM job WHERE title = ?", [title], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },
};
