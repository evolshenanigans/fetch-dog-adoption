# Fetch Dog Adoption App

A web application to help users search through a database of shelter dogs to find their perfect match.

## Features

- User authentication with email and name
- Browse and search for dogs with multiple filters:
  - Filter by breed
  - Filter by age range
  - Filter by ZIP code
- Paginated results for better performance
- Sort results by breed, name, or age (ascending or descending)
- Add favorite dogs to a list
- Generate a perfect match from your favorites

## Technologies Used

- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS (for styling)
- API provided by Fetch

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fetch-dog-adoption.git
   cd fetch-dog-adoption
   Install dependencies:
bashCopynpm install
# or
yarn install

Create a Next.js config file to allow images from the API:
jsCopy// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['frontend-take-home-service.fetch.com', 'frontend-take-home.fetch.com'],
  },
}

module.exports = nextConfig

Start the development server:
bashCopynpm run dev
# or
yarn dev

Open your browser and navigate to http://localhost:3000