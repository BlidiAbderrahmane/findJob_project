document.addEventListener("DOMContentLoaded", function() {
    const loginRadio = document.getElementById("login");
    const signupRadio = document.getElementById("signup");
    const signupForm = document.querySelector(".signup");
    const loginText = document.querySelector(".title-text .login");
    const loginForm = document.querySelector("form.login");
    const loginBtn = document.querySelector("label.login");
    const signupBtn = document.querySelector("label.signup");
    const signupLink = document.querySelector("form .signup-link a");
    signupBtn.onclick = (()=>{
      loginForm.style.marginLeft = "-50%";
      loginText.style.marginLeft = "-50%";
    });
    loginBtn.onclick = (()=>{
      loginForm.style.marginLeft = "0%";
      loginText.style.marginLeft = "0%";
    });
    signupLink.onclick = (()=>{
      signupBtn.click();
      return false;
    });

    signupRadio.addEventListener("change", function() {
        if (signupRadio.checked) {
            loginForm.style.display = "none";
            signupForm.style.display = "block";
            // Show signup input fields
            document.querySelectorAll('.form.signup').forEach(function(elem) {
                elem.style.display = 'block';
            });
            // Hide login input fields
            document.querySelectorAll('.form.login').forEach(function(elem) {
                elem.style.display = 'none';
            });
        }
    });

    loginRadio.addEventListener("change", function() {
        if (loginRadio.checked) {
            signupForm.style.display = "none";
            loginForm.style.display = "block";
            // Show login input fields
            document.querySelectorAll('.form.login').forEach(function(elem) {
                elem.style.display = 'block';
            });
            // Hide signup input fields
            document.querySelectorAll('.form.signup').forEach(function(elem) {
                elem.style.display = 'none';
            });
        }
    });
});
