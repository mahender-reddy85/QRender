# TODO: Correct Errors and Remove Duplicates

## Errors to Fix
- [x] Fix TypeScript errors in auth forms: update login and register function signatures in actions.ts to accept `state: AuthState | null`
- [x] Fix incomplete onChange in qr-code-generator.tsx: replace `setNaN` with `setColor(e.target.value)` - already fixed in file
- [x] Run TypeScript check again to ensure no errors remain
- [x] Fix server component import issue in page.tsx by making it server component and removing client-side hooks
- [x] Fix React useFormState deprecation warning - updated to useActionState from 'react'
- [x] Hide login/signup buttons when user is logged in - redirect to dashboard

## Duplicates to Remove
- [x] No duplicates found in codebase
- [x] Removed temp.html file

## Followup
- [x] Test the app to ensure fixes work correctly - App started successfully on http://localhost:9002
- [x] Set up MySQL database with Prisma instead of SQLite
- [x] Run Prisma migrations and generate client
- [x] Update database connection to MySQL
- [x] Create database tables using Prisma db push
- [x] All tasks completed successfully

## New Issues from User Feedback
- [x] Fix QR code display: Add a proper title "QR Code for [text]" in the QRCodeDisplay component box
- [x] Implement dashboard page at /dashboard for logged-in users to view QR history
- [x] Add edit title functionality for QR codes in dashboard
- [x] Add delete QR code functionality in dashboard
- [x] Update header to include dashboard link for logged-in users
- [x] Add server actions for updating QR code title and deleting QR codes
