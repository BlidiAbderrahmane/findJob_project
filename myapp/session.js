const session = require('express-session');

module.exports = {
  // Initialize session middleware for the app
  init: (app) => {
    app.use(
      session({
        secret: 'kkkkALLLDjsncjdnsjncdsnkzakznjqnzjxznqjnzopahziyhdvoavcha',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 * 60 }, // 1 hour
      })
    );
  },

  // Create a session for the logged-in user
  createSession: function (session, userId, lastName, firstName, email, status, phone, active) {
    session.userId = userId;
    session.lastName = lastName;
    session.firstName = firstName;
    session.email = email;
    session.status = status;
    session.phone = phone;
    session.active = active;

    // Save the session
    session.save(function (err) {
      if (err) console.error('Error saving session:', err);
    });

    return session;
  },

  // Check if a user is connected
  isConnected: function (session) {
    if (
      !session.userId ||
      !session.lastName ||
      !session.firstName ||
      !session.email ||
      !session.status ||
      !session.active ||
      !session.phone
    ) {
      return false;
    }

    if (session.active === 0) {
      return false;
    }

    return true;
  },

  // Destroy a user session
  deleteSession: function (session) {
    session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
  },
};
