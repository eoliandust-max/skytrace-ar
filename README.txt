SkyTrace AR 0.3

IMPORTANT: This version needs Netlify Functions. A simple drag-and-drop ZIP deployment may only publish static files and NOT the server function.

Recommended deployment: create a GitHub repository containing index.html, netlify.toml, and netlify/functions/aircraft.js, then import the repository in Netlify as a new project. Set publish directory to '.' and functions directory to 'netlify/functions' (already configured in netlify.toml). Deploy, then open the HTTPS URL in Safari.

Camera and compass require permission. Aircraft API depends on third-party airplanes.live service availability and permitted usage. No guaranteed complete flight histories. Trails are locally collected while app runs and can be cleared when browser data is cleared.
