# QR Code Generator

A modern, responsive QR code generator built with Next.js, React, and Tailwind CSS. Generate QR codes for various types of content including websites, text, vCards, WiFi credentials, locations, emails, phone numbers, SMS, and file uploads (PDF, images, videos, and music).

## Features

- 🎨 Multiple QR code content types:
  - Website URLs
  - Plain text
  - vCards (contact information)
  - WiFi network credentials
  - Geographic locations
  - Email addresses
  - Phone numbers
  - SMS messages
  - File uploads (PDF, images, videos, music)
- 🖌️ Customizable QR code appearance:
  - Color customization
  - Background color
  - Size adjustment
- 📱 Responsive design that works on all devices
- 🎯 3D flip animation between input and QR code display
- 📥 Easy download functionality

## Getting Started

### Prerequisites

- Node.js 14.6.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/qrender.git
   cd qrender
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   # For file uploads (if implemented)
   NEXT_PUBLIC_UPLOAD_PRESET=your_cloudinary_upload_preset
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Select the type of content you want to generate a QR code for from the sidebar
2. Fill in the required information
3. Customize the appearance (color, background color, size)
4. Click "Generate QR Code"
5. View your QR code and download it if needed
6. Click "Create Another" to generate a new QR code

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icon toolkit
- [QR Server API](https://goqr.me/api/) - For QR code generation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [QR Server API](https://goqr.me/api/)
- [Lucide Icons](https://lucide.dev/)

