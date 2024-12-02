const express = require('express');
const router = express.Router();
const userModel = require('../model/user.js');
const adminModel = require('../model/admin.js');
const organizationModel = require('../model/organization.js');
const organizationRequestModel = require('../model/organization_request.js');
const recruiterRequestModel = require('../model/recruiter_request.js');

// Get all users
router.get('/users', function (req, res, next) {
    userModel.readAll(function(result) {
        res.render('admin_users', { users: result, alertMessage: '' });
    });
});

// Get all organizations and associated recruiters
router.get('/organizations', function(req, res, next) {
    organizationModel.getAll(function(orgResult) {
        organizationModel.getRecruiters(function(recruitersResult) {
            res.render('admin_manage_organizations', { 
                organizations: orgResult, 
                recruiters: recruitersResult, 
                alertMessage: '',
            });
        });
    });
});

// Get all organization requests
router.get('/organization-requests', function(req, res, next) {
    organizationRequestModel.getAll(function(result) {
        organizationRequestModel.getAllRecruiterRequests(function(recruitersResult) {
            res.render('admin_organizations', {
                organization_requests: result,
                recruiters: recruitersResult, 
                alertMessage: ''
            });
        });    
    }); 
});

// Get all recruiter requests
router.get('/recruiter-requests', function(req, res, next) {
    recruiterRequestModel.getAll(function(result) {
        organizationModel.getAll(function(organizationsResult) {
            res.render('admin_recruiters', { 
                recruiter_requests: result,
                organizations: organizationsResult, 
                alertMessage: ''
            });
        });
    }); 
});

// Filter users based on criteria
router.post('/filter-users', function (req, res, next) {
    const { status, active, username } = req.body;

    userModel.filterUser(status || '', active || '', username || '', function(result) {
        res.render('admin_users', { users: result, alertMessage: '' });
    });
});

// Filter organizations based on criteria
router.post('/filter-organizations', function (req, res, next) {
    const { name, type, recruiter } = req.body;

    organizationModel.filterOrganization(name || '', type || '', recruiter || '', function(result) {
        organizationModel.getRecruiters(function(recruitersResult) {
            res.render('admin_manage_organizations', { 
                organizations: result, 
                recruiters: recruitersResult,
                alertMessage: ''
            });
        });
    });
});

// Filter recruiter requests
router.post('/filter-recruiter-requests', function (req, res, next) {
    const { organization_name, recruiter_name } = req.body;

    recruiterRequestModel.filterRecruiterRequest(organization_name || '', recruiter_name || '', function(result) {
        organizationModel.getAll(function(organizationsResult) {
            res.render('admin_recruiters', { 
                recruiter_requests: result,
                organizations: organizationsResult,
                alertMessage: ''
            });
        });
    }); 
}); 

// Filter organization requests
router.post('/filter-organization-requests', function (req, res, next) {
    const { organization_name, recruiter_name, type } = req.body;

    organizationRequestModel.filterOrganizationRequest(organization_name || '', recruiter_name || '', type || '', function(result) {
        organizationRequestModel.getAllRecruiterRequests(function(recruitersResult) {
            res.render('admin_organizations', {
                organization_requests: result,
                recruiters: recruitersResult, 
                alertMessage: ''
            });
        });
    }); 
});

// Add a new organization
router.post('/add-organization', function (req, res, next) {
    const { siren, name, type, headquarters } = req.body;

    organizationModel.create(siren, name, type, headquarters, 1, function(err, result) {
        if (err) {
            const alertMessage = err.code === 'ER_DUP_ENTRY' ? 'duplicate' : 'error';
            organizationModel.getAll(function(result) {
                organizationModel.getRecruiters(function(recruitersResult) {

                    console.log("Inside if (err) ",{
                        organizations: result,
                        recruiters: recruitersResult,
                        alertMessage: err ? alertMessage : 'success',
                    });

                    res.render('admin_manage_organizations', { 
                        organizations: result, 
                        recruiters: recruitersResult,
                        alertMessage
                    });
                });
            });
        } else {
            organizationModel.getAll(function(result) {
                organizationModel.getRecruiters(function(recruitersResult) {

                    console.log("In else  ",{
                        organizations: result,
                        recruiters: recruitersResult,
                        alertMessage: err ? alertMessage : 'success',
                    });

                    res.render('admin_manage_organizations', { 
                        organizations: result, 
                        recruiters: recruitersResult,
                        alertMessage: 'success'
                    });
                });
            });
        }
    });
});

// Delete an organization
router.get('/delete-organization/:id', function (req, res, next) {
    const organizationId = req.params.id;

    organizationModel.deleteById(organizationId, function(err, success) {
        const alertMessage = err ? 'error' : (success ? 'deleted' : 'not_found');
        organizationModel.getAll(function(result) {
            organizationModel.getRecruiters(function(recruitersResult) {
                res.render('admin_manage_organizations', { 
                    organizations: result, 
                    recruiters: recruitersResult,
                    alertMessage
                });
            });
        });
    });
});

// Accept an organization request
router.get('/accept-organization/:id', function (req, res, next) {
    const requestId = req.params.id;

    organizationRequestModel.getById(requestId, function(err, request) {
        organizationModel.create(request.siren, request.organization_name, request.type, request.headquarters, 1, function(insertId) {
            if (insertId) {
                organizationRequestModel.deleteById(requestId, function(err, success) {
                    fetchAndRenderWithMessage(res, 'accepted');
                });
            } 
        });
    });
});

// Helper function to fetch and render with a message
function fetchAndRenderWithMessage(res, message) {
    organizationRequestModel.getAll(function(result) {
        organizationRequestModel.getAllRecruiterRequests(function(recruitersResult) {
            res.render('admin_organizations', {
                organization_requests: result,
                recruiters: recruitersResult,
                alertMessage: message
            });
        });
    });
}

// Deny an organization request
router.get('/deny-organization/:id', function (req, res, next) {
    const requestId = req.params.id;

    organizationRequestModel.deleteById(requestId, function(err, success) {
        const alertMessage = err ? 'error' : 'denied';
        organizationRequestModel.getAll(function(result) {
            organizationRequestModel.getAllRecruiterRequests(function(recruitersResult) {
                res.render('admin_organizations', {
                    organization_requests: result,
                    recruiters: recruitersResult,
                    alertMessage
                });
            });
        });
    });
});

// Add a new user
router.post('/add-user', function (req, res, next) {
    const { email, lastName, firstName, phone, password } = req.body;

    userModel.create(email, password, lastName, firstName, phone, function(err, result) {
        const alertMessage = err ? (err.code === 'ER_DUP_ENTRY' ? 'duplicate' : 'error') : 'success';
        userModel.readAll(function(result) {
            res.render('admin_users', { users: result, alertMessage });
        });
    }); 
});

// Activate a user
router.get('/activate-user/:id', function (req, res, next) {
    const userId = req.params.id;

    userModel.activate(userId, function(success) {
        const alertMessage = success ? 'activated' : 'error';
        userModel.readAll(function(result) {
            res.render('admin_users', { users: result, alertMessage });
        });
    });
}); 

// Deactivate a user
router.get('/deactivate-user/:id', function (req, res, next) {
    const userId = req.params.id;

    userModel.deactivate(userId, function(success) {
        const alertMessage = success ? 'deactivated' : 'error';
        userModel.readAll(function(result) {
            res.render('admin_users', { users: result, alertMessage });
        });
    });
});


// Update user information
router.post('/update-user', function (req, res, next) {
    let userId = req.body.userId; // Retrieve user ID from the request
    let lastName = req.body.nom; // Retrieve last name from the request
    let firstName = req.body.prenom; // Retrieve first name from the request
    let phone = req.body.telephone; // Retrieve phone number from the request
    let password = req.body.password; // Retrieve password from the request (if provided)

    // If no password is provided, update only the other fields
    if (password == null || password == "") {
        userModel.update(userId, null, lastName, firstName, phone, function(success) {
            if (success) {
                userModel.readAll(function(result) {
                    res.render('admin_users', { users: result, alertMessage: 'updated' });
                });
            } else {
                userModel.readAll(function(result) {
                    res.render('admin_users', { users: result, alertMessage: 'error' });
                });
            }
        });
    } else {
        // If a password is provided, update all fields including the password
        userModel.update(userId, password, lastName, firstName, phone, function(success) {
            if (success) {
                userModel.readAll(function(result) {
                    res.render('admin_users', { users: result, alertMessage: 'updated' });
                });
            } else {
                userModel.readAll(function(result) {
                    res.render('admin_users', { users: result, alertMessage: 'error' });
                });
            }
        });
    }
});

// Assign admin role
router.get('/set-admin/:id', function (req, res, next) {
    let userId = req.params.id;

    userModel.setAdmin(userId, function(success) {
        if (success) {
            adminModel.create(userId, function(success) {
                if (success) {
                    userModel.readAll(function(result) {
                        res.render('admin_users', { users: result, alertMessage: 'admin' });
                    });
                } else {
                    userModel.readAll(function(result) {
                        res.render('admin_users', { users: result, alertMessage: 'error' });
                    });
                }
            });
        } else {
            userModel.readAll(function(result) {
                res.render('admin_users', { users: result, alertMessage: 'error' });
            });
        }
    });
});

// Update organization
router.post('/update-organization', function (req, res, next) {
    const organizationId = req.body.organizationId; // Organization ID
    const siren = req.body.siren; // Organization SIREN
    const name = req.body.name; // Organization Name
    const type = req.body.type; // Organization Type
    const headquarters = req.body.headquarters; // Organization Headquarters

    organizationModel.update(organizationId, siren, name, type, headquarters, function(success) {
        if (success) {
            // Fetch updated organizations and recruiters to re-render the admin page
            organizationModel.getAll(function(organizationsResult) {
                organizationModel.getRecruiters(function(recruitersResult) {
                    res.render('admin_manage_organizations', { 
                        organizations: organizationsResult, 
                        recruiters: recruitersResult,
                        alertMessage: 'updated' // Show success alert
                    });
                });
            });
        } else {
            // If update fails, fetch organizations and recruiters again to show the error
            organizationModel.getAll(function(organizationsResult) {
                organizationModel.getRecruiters(function(recruitersResult) {
                    res.render('admin_manage_organizations', { 
                        organizations: organizationsResult, 
                        recruiters: recruitersResult,
                        alertMessage: 'error' // Show error alert
                    });
                });
            });
        }
    });
});



module.exports = router;