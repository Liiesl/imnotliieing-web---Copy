export default {
  async fetch(request, env, ctx) {
    // env will contain your secrets/environment variables
    // set via wrangler.toml or the Cloudflare dashboard.

    const firebaseConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      databaseURL: env.FIREBASE_DATABASE_URL,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
      measurementId: env.FIREBASE_MEASUREMENT_ID // Can be undefined if not set
    };

    // Filter out undefined values if measurementId is optional and might not be set
    const filteredConfig = Object.fromEntries(
      Object.entries(firebaseConfig).filter(([_, v]) => v !== undefined)
    );

    return new Response(JSON.stringify(filteredConfig), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Add CORS headers if needed
      },
    });
  },
};

/*
How to set environment variables for this worker:

1. Using `wrangler.toml` (for local development and deployment):
   [vars]
   FIREBASE_API_KEY = "your_api_key"
   FIREBASE_AUTH_DOMAIN = "your_auth_domain"
   # ... and so on for all variables

2. Using the Cloudflare Dashboard:
   Go to your Worker > Settings > Variables > Add environment variables.
   Remember to add secrets as "Secret text".
*/