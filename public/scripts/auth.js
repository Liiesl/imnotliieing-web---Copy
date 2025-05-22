// scripts/auth.js
import { auth } from './firebase-auth.js'; // This auth object will be initialized by the updated firebase-auth.js

async function signIn() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  if (!auth) { // Add a guard clause in case auth failed to initialize
    alert('Authentication service is not available. Please try again later.');
    console.error('signIn: Auth service not initialized.');
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Check if the user's email is verified
    if (user.emailVerified) {
      alert('Login successful!');
      window.location.href = '/'; // Redirect to home page
    } else {
      // If email is not verified, sign out the user and prompt them to verify their email
      await auth.signOut();
      alert('Please verify your email address before logging in. Check your inbox for the verification link.');
    }
  } catch (error) {
    console.error('Error during sign-in:', error);
    alert(error.message);
  }
}

async function signUp() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const confirmPassword = document.getElementById('auth-password-confirm').value;

  if (!email || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  if (!auth) { // Add a guard clause
    alert('Authentication service is not available. Please try again later.');
    console.error('signUp: Auth service not initialized.');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Send email verification
    await user.sendEmailVerification();
    alert('Account created! Please check your email to activate your account.');

    // Redirect to home page or login page
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Error during sign-up:', error);
    alert(error.message);
  }
}


function signInWithGoogle() {
  if (!auth) { // Add a guard clause
    alert('Authentication service is not available. Please try again later.');
    console.error('signInWithGoogle: Auth service not initialized.');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      // const user = result.user; // user variable not used, can be removed if not needed later
      alert('Login successful!');
      window.location.href = '/'; // Redirect to home page
    })
    .catch((error) => {
      console.error('Error during Google sign-in:', error);
      alert(error.message);
    });
}

function signOut() {
  const modal = document.getElementById('logout-modal');
  const confirmLogout = document.getElementById('confirm-logout');
  const cancelLogout = document.getElementById('cancel-logout');

  if (!modal || !confirmLogout || !cancelLogout) {
    console.error('Logout modal elements not found in the DOM');
    // Attempt to sign out even if modal is missing, if auth is available
    if (auth) {
        auth.signOut().then(() => {
            alert('Logged out!');
            window.location.href = '/';
        }).catch(error => {
            console.error('Error during direct sign-out:', error);
            alert(error.message);
        });
    }
    return;
  }

  if (!auth) { // Add a guard clause
    alert('Authentication service is not available. Please try again later.');
    console.error('signOut: Auth service not initialized.');
    modal.style.display = 'none'; // Hide modal if auth is not working
    return;
  }

  // Show the modal
  modal.style.display = 'flex';

  // Handle confirm logout
  confirmLogout.onclick = () => {
    auth.signOut()
      .then(() => {
        alert('Logged out!');
        window.location.href = '/'; // Redirect to home page
      })
      .catch((error) => {
        console.error('Error during sign-out:', error);
        alert(error.message);
      })
      .finally(() => {
        modal.style.display = 'none'; // Hide the modal
      });
  };

  // Handle cancel logout
  cancelLogout.onclick = () => {
    modal.style.display = 'none'; // Hide the modal
  };
}

function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  if (!passwordField) return; // Guard if field not found
  const toggleIconContainer = passwordField.parentElement.querySelector('.toggle-password'); // Assuming icon is a sibling or in a specific container

  if (!toggleIconContainer) return; // Guard if icon container not found
  const toggleIcon = toggleIconContainer.querySelector('i'); // Assuming the icon is an <i> tag
  if (!toggleIcon) return;


  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordField.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
}

// Attach the function to the window object
window.togglePassword = togglePassword;


// Attach functions to the window object
window.signIn = signIn;
window.signUp = signUp;
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut; // This is already assigned to logoutButton.onclick below

// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    // Ensure auth is initialized before signOut can be called
    // initializeAuth from firebase-auth.js is already called on DOMContentLoaded
    // So, auth should be available, or an error handled.
    logoutButton.onclick = signOut;
  }

  // Event listeners for togglePassword icons
  // This assumes your toggle icons have a common class e.g., 'toggle-password-icon'
  // and are next to the input field or have a data-target attribute
  // Example: <input id="auth-password"><span class="toggle-password-icon" data-target="auth-password"><i></i></span>
  // This is an improvement over the previous togglePassword which relied on nextElementSibling.nextElementSibling
  // For simplicity, I'll assume the current togglePassword structure and leave it as is,
  // but it's less robust than more explicit targeting.
});