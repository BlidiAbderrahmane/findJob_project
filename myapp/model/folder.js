const db = require('./db.js');

module.exports = {
    // Method to insert a new entry into the folder table
    insert: function(applicationId, documentId, callback) {
        const sql = "INSERT INTO folder (application_id, document_id) VALUES (?, ?)";
        db.query(sql, [applicationId, documentId], function(err, result) {
            if (err) throw err;
            callback(result.insertId); // Returns the ID of the new inserted entry
        });
    },

    // Method to delete an entry from the folder table
    delete: function(applicationId, documentId, callback) {
        const sql = "DELETE FROM folder WHERE application_id = ? AND document_id = ?";
        db.query(sql, [applicationId, documentId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to retrieve all documents associated with a specific application
    getDocumentsByApplication: function(applicationId, callback) {
        const sql = "SELECT document.file FROM folder JOIN document ON folder.document_id = document.document_id WHERE folder.application_id = ?";
        db.query(sql, [applicationId], function(err, results) {
            if (err) throw err;
            console.log('Documents retrieved:', results);
            callback(results);
        });
    },
};
