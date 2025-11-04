# **App Name**: QRender

## Core Features:

- QR Code Generation: Generate QR codes from user-supplied text or URLs via the backend API.
- User Authentication: Enable user registration and login using JWT for secure access.
- QR Code History: Allow authenticated users to view and manage their history of generated QR codes, stored in MongoDB.
- Customizable QR Codes: Offer options to customize the color of the QR codes.
- Downloadable QR Codes: Allow users to download generated QR codes as image files.
- API Endpoint for QR Generation: Provide a backend API endpoint to generate QR codes from text input. API to create POST 	/api/generate to generate and return QR code as Base64 image.

## Style Guidelines:

- Primary color: Sky blue (#87CEEB) to bring a fresh, digital aesthetic.
- Background color: Light gray (#F0F0F0) to ensure contrast and readability.
- Accent color: Electric purple (#8F00FF) to draw attention to CTAs.
- Body and headline font: 'Inter' for a clean, modern interface.
- Use minimalist icons from a set like FontAwesome to represent various functionalities and QR code types.
- Implement a responsive, grid-based layout to ensure the application is accessible and functional across devices.
- Use subtle, fade-in animations when generating and displaying QR codes to enhance the user experience.