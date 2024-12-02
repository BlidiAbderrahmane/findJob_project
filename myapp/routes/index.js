const express = require('express');
const bcrypt = require('bcrypt');
const session = require('../session'); // Ensure the correct path
const flash = require('connect-flash');
const router = express.Router();
const userModel = require('../model/user.js'); // Ensure this matches your `userModel` file name and structure



// Homepage route
router.get('/', (req, res) => {
  res.render('home', { title: 'Find a Job' });
});

// Login page route
router.get('/connexion', (req, res) => {
  const alertMessage = req.flash('alertMessage');
  res.render('connexion', { alertMessage });
});

// Signup route
router.post('/signup', (req, res, next) => {
  const { email, password, last_name, first_name, phone } = req.body;

  userModel.create(email, password, last_name, first_name, phone, (err, userId) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        req.flash('alertMessage', 'Email already exists.');
      } else {
        req.flash('alertMessage', 'An error occurred while creating your account.');
      }
    } else {
      req.flash('alertMessage', 'Account created successfully!');
    }
    res.redirect('/connexion');
  });
});


// User authentication (login) route
router.post('/connexion', (req, res, next) => {
  const { email, password } = req.body;

  userModel.findByEmail(email, (err, user) => {
    if (err) {
      req.flash('alertMessage', 'Internal server error.');
      return res.redirect('/connexion');
  }
  if (!user) {
      req.flash('alertMessage', 'Invalid email or password.');
      return res.redirect('/connexion');
  }

  if (user.password !== password) {
      console.log('Password mismatch:', { input: password, db: user.password });
      req.flash('alertMessage', 'Invalid email or password.');
      return res.redirect('/connexion');
  }
    session.createSession(req.session, user.user_id, user.last_name, user.first_name, user.email, user.status, user.phone, user.active);
    if (user.status === 'admin') return res.redirect('/admin/users');
    if (user.status === 'recruiter') return res.redirect('/recruiter/home');
    if (user.status === 'candidate') return res.redirect('/candidate/dashboard');
  });
});


// Logout route
router.get('/logout', (req, res) => {
  session.deleteSession(req.session);
  res.redirect('/');
});


// User settings page
router.get('/settings', (req, res) => {
  const successMessage = req.flash('success');
  const errorMessage = req.flash('error');
  const alertMessage = successMessage.length > 0 ? successMessage : errorMessage;

  res.render('user_settings', {
    title: 'Settings',
    session: req.session,
    alertMessage: alertMessage.length > 0 ? alertMessage[0] : null
  });
});

// Update user profile
router.post('/settings', (req, res) => {
  const userId = req.session.userId;
  const { last_name, first_name, phone, password } = req.body;

  const updatedPassword = password || req.session.password; // Use the existing password if none is provided

  userModel.update(userId, updatedPassword, last_name, first_name, phone, (success) => {
    if (success) {
      // Update session data to reflect changes
      req.session.last_name = last_name;
      req.session.first_name = first_name;
      req.session.phone = phone;

      req.flash('success', 'Profile updated successfully!');
      res.redirect('/settings');
    } else {
      req.flash('error', 'Error updating profile.');
      res.redirect('/settings');
    }
  });
});



module.exports = router;
