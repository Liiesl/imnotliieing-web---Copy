export default {
  async fetch(request, env, ctx) {
    try {
      // Check if the request method is POST
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Add CORS headers if needed
          },
        });
      }

      // Parse the incoming request body
      let body;
      try {
        body = await request.json();
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      const fileUrl = body.fileurl; // URL of the QR code image
      const fileData = body.file;   // Base64-encoded file data

      // Validate input
      if (!fileUrl && !fileData) {
        return new Response(JSON.stringify({ error: 'No fileurl or file provided' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      const QR_SERVER_API_URL = 'https://api.qrserver.com/v1/read-qr-code/';
      let apiResponse;

      // Case 1: Use fileurl parameter
      if (fileUrl) {
        const targetUrl = new URL(QR_SERVER_API_URL);
        targetUrl.searchParams.append('fileurl', fileUrl);

        apiResponse = await fetch(targetUrl.toString(), {
            method: 'GET' // qrserver read API uses GET for fileurl
        });
      }
      // Case 2: Use file parameter (base64-encoded file data)
      else if (fileData) {
        // Decode the base64 file data
        // Remove data URI prefix if present: "data:image/png;base64,"
        const base64Cleaned = fileData.replace(/^data:image\/\w+;base64,/, '');
        const binaryString = atob(base64Cleaned); // Decodes base64 to a binary string
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // Create a Blob from the Uint8Array
        const imageBlob = new Blob([bytes], { type: 'image/png' }); // Assuming PNG, adjust if necessary

        const formData = new FormData();
        formData.append('file', imageBlob, 'qr-code.png'); // filename is optional but good practice

        apiResponse = await fetch(QR_SERVER_API_URL, {
          method: 'POST',
          body: formData, // fetch API handles multipart/form-data headers automatically
        });
      }

      if (!apiResponse) {
         // Should not happen if validation is correct, but as a fallback
        return new Response(JSON.stringify({ error: 'Internal logic error' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }

      const responseData = await apiResponse.json();

      return new Response(JSON.stringify(responseData), {
        status: apiResponse.status, // Forward the status from the QR server API
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });

    } catch (error) {
      console.error('QR Scanner Worker Error:', error.stack || error);
      return new Response(JSON.stringify({ error: 'Failed to scan QR code' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }
  },
};

/*
Notes:
- This worker does not require any environment variables itself unless you plan
  to make the QR_SERVER_API_URL configurable, for instance.
- CORS: Added 'Access-Control-Allow-Origin': '*' to all responses. Adjust this
  to your specific domain for better security in production.
- Error Handling: Catches errors during body parsing, API calls, and unexpected issues.
- Base64 to Blob: The process involves `atob` to get a binary string, then converting
  that to a `Uint8Array`, and finally creating a `Blob` which is suitable for `FormData`.
*/