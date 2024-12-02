const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const jobOfferModel = require('../model/job_offer.js');
const applicationModel = require('../model/application.js');
const jobDescriptionModel = require('../model/job_description.js');
const documentModel = require('../model/document.js');
const applicationFileModel = require('../model/folder.js');

// Helper function to check and create directory
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
    } else {
        console.log(`Directory already exists: ${dir}`);
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        ensureDirExists(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        console.log('Received file:', file);
        const filename = file.originalname;
        console.log(`Saving file as: ${filename}`);
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });

// Serve static files from the "uploads" directory
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route for submitting an application with multiple documents
router.post('/dashboard/apply', upload.array('documents'), function(req, res, next) {
    const jobOfferId = req.body.job_offer_id;
    const applicationDate = new Date();
    const userId = req.session.userId;

    if (!jobOfferId) {
        return res.status(400).send('Job Offer ID is required');
    }

    applicationModel.insert(applicationDate, jobOfferId, userId, function(insertId) {
        const files = req.files;

        if (files && files.length > 0) {
            files.forEach(file => {
                documentModel.create(file.filename, function(documentId) {
                    applicationFileModel.insert(insertId, documentId, function() {
                        // All files processed
                    });
                });
            });
        }

        req.flash('success_msg', 'Application submitted successfully');
        res.redirect('/candidate/dashboard');
    });
});

// Candidate Dashboard: List of available job offers
router.get('/dashboard', function(req, res, next) {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    jobOfferModel.getAllExceptUserApplications(userId, function(jobOffers) {
        jobDescriptionModel.getAllDistinctLocations(function(locations) {
            jobDescriptionModel.getAllDistinctOrganizations(function(organizations) {
                jobDescriptionModel.getAllDistinctJobs(function(jobTitles) {
                    res.render('candidate_dashboard', { 
                        title: 'Job Offers',
                        jobOffers: jobOffers,
                        locations: locations,
                        organizations: organizations,
                        jobTitles: jobTitles, 
                        status: req.session.status, 
                        success_msg: req.flash('success_msg'), 
                    });
                });
            });
        });
    });
});

// Route to view job description
router.post('/job_description', function(req, res, next) {
    const jobOfferId = req.body.job_offer_id;
    jobDescriptionModel.getDescriptionByJobOfferId(jobOfferId, function(jobDescription) {
        res.render('candidate_job_description', { 
            title: 'Job Description', 
            jobDescription: jobDescription, 
            status: req.session.status 
        });
    });
});

// List of applications by the logged-in user
router.get('/applications', function(req, res, next) {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    applicationModel.getAllByUser(userId, function(applications) {
        jobDescriptionModel.getAllDistinctLocations(function(locations) {
            jobDescriptionModel.getAllDistinctOrganizations(function(organizations) {
                jobDescriptionModel.getAllDistinctJobs(function(jobTitles) {
                    res.render('candidate_applications', { 
                        title: 'Your Applications',
                        applications: applications,
                        locations: locations,
                        organizations: organizations,
                        jobTitles: jobTitles, 
                        status: req.session.status, 
                        success_msg: req.flash('success_msg'), 
                    });
                });
            });
        });
    });
});

// Route for filtering job offers
router.post('/filter-job-offers', function(req, res, next) {
    const organizationId = req.body.organization || '';
    const keyword = req.body.search || '';
    const location = req.body.location || '';
    const remoteWork = req.body.remote_work || '';
    const jobTitle = req.body.job_title || '';
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    jobOfferModel.filterOfferWithOrganization(organizationId, keyword, location, jobTitle, remoteWork, function(result) {
        jobDescriptionModel.getAllDistinctLocations(function(locations) {
            jobDescriptionModel.getAllDistinctOrganizations(function(organizations) {
                jobDescriptionModel.getAllDistinctJobs(function(jobTitles) {
                    res.render('candidate_dashboard', {
                        title: 'Job Offers',
                        jobOffers: result,
                        locations: locations,
                        organizations: organizations,
                        jobTitles: jobTitles,
                        keyword: keyword,
                        status: req.session.status,
                        success_msg: '',
                    });
                });
            });
        });
    });
});

// Route for filtering candidate applications
router.post('/applications/filter-job-offers', function(req, res, next) {
    const organizationId = req.body.organization || '';
    const keyword = req.body.search || '';
    const location = req.body.location || '';
    const remoteWork = req.body.remote_work || '';
    const jobTitle = req.body.job_title || '';
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    jobOfferModel.filterOfferApplications(organizationId, keyword, location, jobTitle, remoteWork, userId, function(applications) {
        jobDescriptionModel.getAllDistinctLocations(function(locations) {
            jobDescriptionModel.getAllDistinctOrganizations(function(organizations) {
                jobDescriptionModel.getAllDistinctJobs(function(jobTitles) {
                    res.render('candidate_applications', {
                        title: 'Your Applications',
                        applications: applications,
                        locations: locations,
                        organizations: organizations,
                        jobTitles: jobTitles,
                        keyword: keyword,
                        status: req.session.status,
                        success_msg: '',
                    });
                });
            });
        });
    });
});

// Delete an application
router.get('/delete-application/:id', function(req, res, next) {
    const applicationId = req.params.id;
    applicationModel.delete(applicationId, function(result) {
        res.redirect('/candidate/applications');
    });
});

module.exports = router;
