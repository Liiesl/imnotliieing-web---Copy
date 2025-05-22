// scripts/firebase-auth.js
let auth;

// !! IMPORTANT: Replace this URL with your actual deployed Cloudflare Worker URL !!
const FIREBASE_CONFIG_WORKER_URL = 'https://firebase-config-worker.your-account.workers.dev'; 
// Example: 'https://firebase-config-worker.your-username.workers.dev' 
// Or your custom domain if you've set one up for the worker.

// Initialize Firebase and set up auth state listener
function initializeAuth() {
  // Fetch Firebase config from your Cloudflare Worker
  return fetch(FIREBASE_CONFIG_WORKER_URL) // <--- MODIFIED LINE
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Firebase config: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(firebaseConfig => {
      // Check if Firebase is already initialized
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      auth = firebase.auth();
      setupAuthStateListener();
      return auth; // Return the auth object for potential chaining or direct use
    })
    .catch(error => {
      console.error('Failed to load or initialize Firebase:', error);
      // Display a user-friendly error message on the page
      const errorDiv = document.getElementById('firebase-error-message'); // Assuming you have an element with this ID
      if (errorDiv) {
        errorDiv.textContent = 'Error initializing application. Please try again later.';
        errorDiv.style.display = 'block';
      }
      // Optionally, disable auth-related buttons if Firebase fails to load
      const loginButton = document.getElementById('login-button');
      const logoutButton = document.getElementById('logout-button');
      if (loginButton) loginButton.disabled = true;
      if (logoutButton) logoutButton.disabled = true;

      // Propagate the error if you want to handle it further up the chain
      // For instance, if other parts of your app depend on auth being initialized
      throw error; 
    });
}

// Set up auth state listener
function setupAuthStateListener() {
  if (!auth) {
    console.error("Auth object not initialized before setting up auth state listener.");
    return;
  }
  auth.onAuthStateChanged((user) => {
    updateAuthButtons(user);
    // You might want to trigger other UI updates here based on auth state
  });
}

// Update auth buttons visibility
function updateAuthButtons(user) {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');

  if (!loginButton || !logoutButton) {
    // It's okay if these buttons aren't on every page.
    // console.warn('Auth buttons not found in the DOM on this page.');
    return;
  }

  if (user) {
    // User is signed in.
    if (user.emailVerified) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
    } else {
      // User is signed in but email is not verified.
      // Depending on your app flow, you might still show logout or a "resend verification" option.
      // Forcing logout here can be disruptive if they just signed up.
      // Consider what happens after signup - they are signed in but email not verified.
      // The original code signed them out and alerted.
      // Let's keep the original behavior for now, but it's a point for UX review.
      alert('Please verify your email address to activate your account.');
      if (auth) auth.signOut(); // Ensure auth is available
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
    }
  } else {
    // No user is signed in.
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }
}

// Wait for the DOM to be fully loaded before initializing auth
document.addEventListener('DOMContentLoaded', () => {
  initializeAuth().catch(error => {
    // Catch errors from initializeAuth that weren't handled internally
    console.error("Auth initialization failed at DOMContentLoaded:", error);
    // Potentially show a global error message if not already handled
  });
});

export { auth, updateAuthButtons, initializeAuth }; // Export initializeAuth if you need to call it manually elsewhere