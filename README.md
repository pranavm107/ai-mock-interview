# PrepPilot AI

PrepPilot AI is an AI-powered mock interview application designed to help candidates prepare for their next big job opportunity. Engage in realistic mock interviews, receive intelligent feedback, and track your progress—all in one place.

## Features

- **User Authentication**: Secure and seamless sign-up and login via Clerk.
- **Interview Management**: A central dashboard to manage, schedule, and review mock interviews.
- **Customizable Interviews**: Tailor your mock interviews by job role, experience level, and specific skills.
- **AI Feedback**: Receive detailed, actionable feedback from AI on your interview performance.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Routing**: React Router

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranavm107/ai-mock-interview.git
   cd ai-mock-interview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the `.env.example` file to `.env.local` and add your Clerk API keys (and any other required keys).
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Screenshots

*(Coming soon!)*

## Architecture Diagram

*(Coming soon!)*

## Folder Structure

```text
ai-mock-interview/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/              # Application views/pages
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── .env.example            # Example environment variables
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```
