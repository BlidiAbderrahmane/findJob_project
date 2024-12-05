const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('./session'); // Session management file
const flash = require('connect-flash'); // Flash messages for alerts

const indexRouter = require('./routes/index');
const candidateRouter = require('./routes/candidate');
const recruiterRouter = require('./routes/recruiter');
const adminRouter = require('./routes/admin');

const app = express();

// Initialize session
session.init(app);

// Initialize flash messages
app.use(flash());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Function to check if a path matches any path in a list, accounting for dynamic segments
const pathMatches = (path, pathList) => {
  return pathList.some(pattern => {
    const regex = new RegExp(`^${pattern.replace(/:\w+/g, '\\w+')}$`);
    return regex.test(path);
  });
};

// Middleware for authorization and redirection
app.all('*', (req, res, next) => {
  const nonSecurePaths = ['/', '/signup', '/connexion', '/favicon.ico'];

  const adminPaths = [
    '/admin/users',
    '/admin/organizations',
    '/admin/organization-requests',
    '/admin/recruiter-requests',
    '/admin/filter-users',
    '/admin/filter-organizations',
    '/admin/filter-organization-requests',
    '/admin/filter-recruiter-requests',
    '/admin/add-organization',
    '/admin/delete-organization/:id',
    '/admin/accept-organization/:id',
    '/admin/deny-organization/:id',
    '/admin/accept-recruiter-request/:id',
    '/admin/deny-recruiter-request/:id',
    '/admin/add-user',
    '/admin/activate-user/:id',
    '/admin/deactivate-user/:id',
    '/logout',
    '/settings',
    '/admin/set-admin/:id',
    '/admin/update-organization',
    '/admin/update-user'
  ];

  const recruiterPaths = [
    "/recruiter", "/recruiter/manage-offers", "/recruiter/applications-list", 
    "/recruiter/manage-applications", "/recruiter/job-description", 
    "/recruiter/job-postings", "/recruiter/create-job-description", 
    "/recruiter/create-organization", "/recruiter/organization-request", 
    "/recruiter/add-offer", "/recruiter/add-offer-submit", 
    "/recruiter/filter-offer", "/logout", "/recruiter/filter-applications", 
    "/candidate/dashboard", "/candidate/profile", "/candidate/job-list",
    "/candidate/job-space", "/candidate/applications-list",
    "/candidate/applications", "/candidate/job-description", "/candidate/job-space/apply", 
    "/recruiter/delete-job-offer", "/recruiter/job-posting-details",
    "/recruiter/modify-offer", "/recruiter/modify-offer-submit",
    "/recruiter/home", "/settings", "/candidate/filter-job-offers", "/candidate/delete-application/:id", 
    "/recruiter/download/:applicationId", '/candidate/job_description',  
];


const candidatePaths = [
    '/candidate/dashboard',
    '/candidate/profile',
    '/candidate/jobs',
    '/candidate/applications',
    '/candidate/filter-job-offers',
    '/candidate/applications/filter-job-offers', 
    '/candidate/job_description',  
    '/candidate/dashboard/apply',  
    '/candidate/uploads',
    '/candidate/delete-application/:id',          
    '/logout',
    '/settings',
];

  // Allow non-secure paths
  if (nonSecurePaths.includes(req.path)) return next();

  // Check user authentication and role
  if (session.isConnected(req.session)) {
    if (req.session.status === 'admin') {
      if (pathMatches(req.path, adminPaths)) return next();
      return res.redirect('/admin/users');
    } else if (req.session.status === 'recruiter') {
      if (pathMatches(req.path, recruiterPaths)) return next();
      return res.status(403).render('error', { message: 'Unauthorized access', error: {} });
    } else if (req.session.status === 'candidate') {
      if (pathMatches(req.path, candidatePaths)) return next();
      return res.status(403).render('error', { message: 'Unauthorized access', error: {} });
    }
  } else {
    // Redirect to login if not authenticated
    console.log('User is not authenticated. Redirecting to /connexion.');
    return res.redirect('/connexion');
  }
});

// Define routes
app.use('/', indexRouter);
app.use('/candidate', candidateRouter);
app.use('/recruiter', recruiterRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler for 404
app.use((req, res, next) => {
  res.status(404).send('<h1>Not Found</h1>');
});

// General error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
