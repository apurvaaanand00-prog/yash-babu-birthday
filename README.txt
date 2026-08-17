YASH BABU — PRIVATE BIRTHDAY PORTAL
===================================

This is a small password-protected Node.js website. It serves the photos only after the family password is accepted.

REQUIREMENTS
- Node.js 18+ (Node 20+ recommended)
- No npm packages required.

RUN LOCALLY (Windows PowerShell)
1. Open PowerShell in this folder.
2. Set a private password for this session:
   $env:YASH_PASSWORD="choose-a-private-password"
3. Start:
   node server.js
4. Open http://localhost:3000

IMPORTANT PRIVACY NOTE
- The password is enforced by the server, not only by JavaScript.
- The default password is YashBabu13; change it before sharing.
- For an internet deployment, use HTTPS and set YASH_PASSWORD as a server environment variable. Do not put a real family password inside index.html.
- No website can prevent an authorized viewer from taking screenshots.
- The site includes no analytics or third-party tracking.

PHOTO NOTE
The 19 JPG files in public/photos were extracted from the uploaded PDF for use in this private site.
