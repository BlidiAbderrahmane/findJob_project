const db = require('./db.js');

module.exports = {
    // Method to retrieve a document by its ID
    getById: function(documentId, callback) {
        db.query("SELECT * FROM document WHERE document_id = ?", [documentId], function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },
    
    // Method to retrieve all documents
    getAll: function(callback) {
        db.query("SELECT * FROM document", function(err, results) {
            if (err) throw err;
            callback(results);
        });
    },

    // Method to create a new document
    create: function(file, callback) {
        const sql = "INSERT INTO document (file) VALUES (?)";
        db.query(sql, [file], function(err, result) {
            if (err) throw err;
            callback(result.insertId);
        });
    },

    // Method to update a document
    update: function(documentId, file, callback) {
        const sql = "UPDATE document SET file = ? WHERE document_id = ?";
        db.query(sql, [file, documentId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    },

    // Method to delete a document by its ID
    deleteById: function(documentId, callback) {
        const sql = "DELETE FROM document WHERE document_id = ?";
        db.query(sql, [documentId], function(err, result) {
            if (err) throw err;
            callback(result.affectedRows > 0); // Returns true if at least one row was affected
        });
    }
};
