# TODO: Convert QR Code Generation to API Route

## Steps to Complete

- [x] Create API Route: Add `src/app/api/generate/route.ts` with a POST handler that handles the QR code generation logic (moved from `actions.ts`).
- [x] Update Client Component: Modify `src/components/qr-code-generator.tsx` to use `fetch` for form submission instead of server actions, and manage state accordingly.
- [x] Remove Server Action: Remove the `generateQrCode` function from `src/lib/actions.ts` since it will be replaced by the API route.
- [x] Test API Route: Test the API route by making a POST request to ensure it works.
- [x] Verify Form Submission: Verify the form submission works and QR code generates correctly.
- [x] Ensure No Regressions: Ensure no regressions in other functionalities.

## Progress Tracking

- Started: [Date/Time]
- Completed: [Date/Time]
