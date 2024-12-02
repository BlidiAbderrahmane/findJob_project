const express = require('express');
const router = express.Router();

const jobDescriptionModel = require('../model/job_description.js');
const jobOfferModel = require('../model/job_offer.js');
const applicationModel = require('../model/application.js');
const organizationRequestModel = require('../model/organization_request.js');
const organizationModel = require('../model/organization.js');
const recruiterRequestModel = require('../model/recruiter_request.js');
const jobModel = require('../model/job.js');
const recruiterModel = require('../model/recruiter.js');
const folderModel = require('../model/folder.js');

const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

// Download application folder
router.get('/download/:applicationId', function (req, res, next) {
    const applicationId = req.params.applicationId;
    console.log('Application ID:', applicationId);
    folderModel.getDocumentsByApplication(applicationId, function (documents) {
        if (documents.length === 0) {
            return res.status(404).json({ message: 'No documents found for this application.' });
        }

        const fileNames = documents.map(doc => doc.file);
        const zip = new AdmZip();
        let filesAdded = 0;

        fileNames.forEach(fileName => {
            const filePath = path.join(__dirname, './uploads/', fileName);
            if (fs.existsSync(filePath)) {
                zip.addLocalFile(filePath);
                filesAdded++;
            }
        });

        if (filesAdded === 0) {
            return res.status(404).json({ message: 'No valid documents found for this application.' });
        }

        const downloadName = `application_documents_${applicationId}.zip`;
        const data = zip.toBuffer();

        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename=${downloadName}`);
        res.set('Content-Length', data.length);
        res.send(data);
    });
});

// Recruiter dashboard
router.get('/', function (req, res, next) {
    res.render('recruiter', { title: 'Recruiter Access' });
});

// Recruiter home
router.get('/home', function (req, res, next) {
    res.render('recruiter_home', { title: 'Recruiter Home' });
});

// Manage job offers
router.get('/manage-offers', function (req, res, next) {
    const recruiterId = req.session.userId;

    jobOfferModel.getAll(function (offers) {
        jobDescriptionModel.getAllDistinctLocationsByRecruiterId(recruiterId, function (cities) {
            jobDescriptionModel.getAllDistinctJobsByRecruiter(recruiterId, function (jobs) {
                res.render('recruiter_manage_offers', { 
                    title: 'Manage Job Offers', 
                    offers, 
                    cities, 
                    jobs 
                });
            });
        });
    });
});

// Manage applications
router.get('/manage-applications', function (req, res, next) {
    const recruiterId = req.session.userId;

    applicationModel.getApplicationsByRecruiterId(recruiterId, function (applications) {
        applicationModel.getOffersByRecruiterId(recruiterId, function (offers) {
            res.render('recruiter_manage_applications', { 
                title: 'Manage Applications', 
                applications, 
                offers 
            });
        });
    });
});

// Filter applications
router.post('/filter-applications', function (req, res, next) {
    const recruiterId = req.session.userId;

    const applicationDate = req.body.application_date || '';
    const userLastName = req.body.user_last_name || '';
    const userFirstName = req.body.user_first_name || '';
    const offerId = req.body.offer_id || '';

    applicationModel.filterApplication(applicationDate, userLastName, userFirstName, offerId, function (filteredApplications) {
        applicationModel.getOffersByRecruiterId(recruiterId, function (offers) {
            res.render('recruiter_manage_applications', { 
                title: 'Filtered Applications', 
                applications: filteredApplications, 
                offers 
            });
        });
    });
});

// List job descriptions
router.get('/job-postings', function (req, res, next) {
    const recruiterId = req.session.userId;

    jobDescriptionModel.getAllByRecruiterId(recruiterId, function (jobDescriptions) {
        res.render('job_descriptions', { 
            title: 'Job Descriptions', 
            jobDescriptions 
        });
    });
});

// Route to filter job offers
router.post('/filter-offer', function (req, res, next) {
    const recruiterId = req.session.userId; // Recruiter ID from session
    const indication = req.body.indication || ''; // Filter by indication
    const location = req.body.location || ''; // Filter by location
    const remoteWork = req.body.remoteWork || ''; // Filter by remote work
    const job = req.body.job || ''; // Filter by job

    // Call the model to filter offers
    jobOfferModel.filterOffer(recruiterId, indication, location, job, remoteWork, function (err, filteredOffers) {
        if (err) return next(err);

        // Get distinct locations and job categories for the recruiter
        jobDescriptionModel.getAllDistinctLocationsByRecruiterId(recruiterId, function (err, locations) {
            if (err) return next(err);

            jobDescriptionModel.getAllDistinctJobsByRecruiter(recruiterId, function (err, jobs) {
                if (err) return next(err);

                // Render the filtered offers with additional data for filtering
                res.render('recruiter_manage_offers', {
                    offres: filteredOffers || [], // Ensure offers is always an array
                    alertMessage: '', // No alert messages for now
                    title: 'Filtered Job Offers',
                    villes: locations || [], // Ensure locations is always an array
                    metiers: jobs || [], // Ensure jobs is always an array
                    indication: indication // Preserve the filter input
                });
            });
        });
    });
});

// View a single job description
router.post('/job-description', function (req, res, next) {
    const offerId = req.body.offerId;

    jobOfferModel.getDescriptionByOfferId(offerId, function (err, jobDescription) {
        if (err) {
            console.error("Error: Unable to fetch job description.", err);
            return res.status(500).send("Error retrieving job description.");
        }

        console.log("Job description found:", jobDescription);
        res.render('recruiter_job_description', { description: jobDescription });
    });
});

// Route to delete a job offer
router.post('/delete-job-offer', function (req, res, next) {
    const offerId = req.body.offerId; // Retrieve the offer ID from the form

    jobOfferModel.deleteById(offerId, function (success) {
        if (success) {
            res.redirect('/recruiter/manage-offers'); // Redirect back to the "Manage Offers" page
        } else {
            console.error('Error deleting job offer.');
            res.status(500).send('Error deleting job offer.');
        }
    });
});


// Create a job description
router.get('/create-job-description', function (req, res, next) {
    jobModel.getAll(function (jobs) {
        res.render('recruiter_create_job_description', { 
            title: 'Create Job Description', 
            jobs 
        });
    });
});

router.post('/create-job-description', function (req, res, next) {
    const { title, level, supervisor, job, location, hoursPerWeek, remoteWork } = req.body;
    const recruiterId = req.session.userId;

    recruiterModel.getById(recruiterId, function (err, recruiter) {
        if (err) {
            console.error('Error fetching recruiter:', err);
            return next(err);
        }

        if (recruiter.length === 0) {
            return res.status(404).send('Recruiter not found.');
        }

        const organizationId = recruiter[0].organization;
        jobDescriptionModel.create(title, level, supervisor, job, location, hoursPerWeek, remoteWork, organizationId, recruiterId, function (insertId) {
            if (insertId) {
                res.redirect('/recruiter/job-postings');
            } else {
                res.status(500).send('Error creating job description.');
            }
        });
    });
});

// Create an organization
router.post('/create-organization', function (req, res, next) {
    const { siren, name, type, headquarters } = req.body;
    const addedById = req.session.userId;

    organizationRequestModel.create(siren, name, type, headquarters, addedById, function (insertId) {
        if (insertId) {
            res.redirect('/recruiter/home');
        } else {
            res.status(500).send('Error creating organization.');
        }
    });
});

// Join an organization
router.post('/organization-request', function (req, res, next) {
    const organizationName = req.body.organizationName;

    organizationModel.getByName(organizationName, function (err, organization) {
        if (err) {
            res.status(500).send('Error searching for the organization.');
            return;
        }

        if (organization) {
            const userId = req.session.userId;

            recruiterRequestModel.create(organization.organization_id, userId, function (insertId) {
                if (insertId) {
                    res.render('recruiter', { success: 'Request sent successfully!' });
                } else {
                    res.status(500).send('Error creating recruiter request.');
                }
            });
        } else {
            res.render('recruiter', { success: 'This organization does not exist.' });
        }
    });
});

// Add a job offer
router.get('/add-offer', function (req, res, next) {
    const recruiterId = req.session.userId;

    jobOfferModel.getDescriptionsByRecruiterId(recruiterId, function (jobDescriptions) {
        res.render('recruiter_add_offer', { 
            title: 'Add Job Offer', 
            jobDescriptions 
        });
    });
});

router.post('/add-offer', function (req, res, next) {
    const { status, validationDate, notes, documentCount, description, descriptionDetails } = req.body;

    jobOfferModel.create(status, validationDate, notes, documentCount, description, descriptionDetails, function (insertId) {
        if (insertId) {
            res.redirect('/recruiter/manage-offers');
        } else {
            res.status(500).send('Error creating job offer.');
        }
    });
});

// Modify an existing job offer
router.post('/modify-offer', function (req, res, next) {
    const offerId = req.body.offerId;

    jobOfferModel.getById(offerId, function (err, offer) {
        

        const recruiterId = req.session.userId; // Logged-in recruiter ID
        jobOfferModel.getById(recruiterId, function (err, jobDescriptions) {
            if (err || !offer) {
                console.error("Error fetching job offer for modification:", err);
                return res.status(500).send("Error retrieving job offer.");
            }

            res.render('recruiter_edit_offer', { 
                title: 'Modify Job Offer', 
                offer: offer, 
                jobDescriptions: jobDescriptions 
            });
        });
    });
});


// Submit changes to the job offer
router.post('/modify-offer-submit', function (req, res, next) {
    const { offerId, status, validationDate, notes, documentCount, descriptionId, description } = req.body;

    // Validate all required fields
    if (!offerId || !status || !validationDate || !notes || !documentCount || !descriptionId || !description) {
        return res.status(400).send("All required fields must be filled.");
    }

    jobOfferModel.update(
        offerId,
        status,
        validationDate,
        notes,
        documentCount,
        description,
        descriptionId,
        function (success) {
            if (success) {
                res.redirect('/recruiter/manage-offers');
            } else {
                console.error("Error updating job offer.");
                res.status(500).send("Error updating job offer.");
            }
        }
    );
});





module.exports = router;
