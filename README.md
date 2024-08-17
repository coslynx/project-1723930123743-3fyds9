# FitTrack: Social Fitness Goal Tracker

<h1 align="center">
<img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
<br>FitTrack MVP</h1>
<h4 align="center">A social fitness platform for setting goals, tracking progress, and connecting with friends.</h4>
<h4 align="center">Developed with the software and tools below.</h4>
<p align="center">
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>
<p align="center">
<img src="https://img.shields.io/github/last-commit/spectra-ai-codegen/fittrack-mvp?style=flat-square&color=5D6D7E" alt="git-last-commit" />
<img src="https://img.shields.io/github/commit-activity/m/spectra-ai-codegen/fittrack-mvp?style=flat-square&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/languages/top/spectra-ai-codegen/fittrack-mvp?style=flat-square&color=5D6D7E" alt="GitHub top language" />
</p>

## 📑 Table of Contents
- 📍 Overview
- 📦 Features
- 📂 Repository Structure
- 💻 Installation
- 🚀 Usage
- 🌐 Deployment
- 📄 License
- 👥 Contributors

## 📍 Overview
FitTrack is a comprehensive web application designed to revolutionize the way fitness enthusiasts approach their health and wellness journey. This platform seamlessly integrates personal goal setting, progress tracking, and social interaction to create a holistic fitness experience. Built with Next.js, React, and Node.js, FitTrack empowers users to take control of their fitness goals while fostering a supportive community environment.

## 📦 Features
|    | Feature | Description |
|----|---------|-------------|
| ⚙️ | **User Authentication** | Secure login and registration system with JWT and OAuth options |
| 🎯 | **Goal Setting** | Intuitive interface for creating and managing personalized fitness goals |
| 📊 | **Progress Tracking** | Comprehensive tools for logging and visualizing fitness progress |
| 🤝 | **Social Sharing** | Ability to connect with friends and share achievements |
| 📱 | **Responsive Design** | Fully responsive UI that works seamlessly across devices |
| 🔒 | **Data Privacy** | Robust data protection measures to ensure user information security |
| 📈 | **Analytics Dashboard** | Insightful analytics to help users understand their fitness trends |
| 🔔 | **Notifications** | Custom alerts for goal reminders and friend activities |
| 🔄 | **API Integration** | Ready for future integrations with fitness devices and health apps |
| 🚀 | **Performance Optimized** | Efficient codebase ensuring fast load times and smooth user experience |

## 📂 Repository Structure

```sh
└── /
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── GoalForm.tsx
    │   ├── ProgressTracker.tsx
    │   ├── SocialFeed.tsx
    │   └── UserProfile.tsx
    ├── pages/
    │   ├── index.tsx
    │   ├── dashboard.tsx
    │   ├── goals.tsx
    │   ├── progress.tsx
    │   ├── social.tsx
    │   └── profile.tsx
    ├── api/
    │   ├── auth/
    │   │   └── [...nextauth].ts
    │   ├── goals.ts
    │   ├── progress.ts
    │   └── users.ts
    ├── styles/
    │   └── globals.css
    ├── utils/
    │   ├── api.ts
    │   └── helpers.ts
    ├── types/
    │   ├── goal.ts
    │   ├── progress.ts
    │   └── user.ts
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useGoals.ts
    ├── store/
    │   └── index.ts
    ├── prisma/
    │   └── schema.prisma
    ├── public/
    │   ├── favicon.ico
    │   └── logo.png
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

## 💻 Installation

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

### Setup Instructions
1. Clone the repository:
   ```
   git clone https://github.com/spectra-ai-codegen/fittrack-mvp.git
   ```
2. Navigate to the project directory:
   ```
   cd fittrack-mvp
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
4. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/fittrack"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```
5. Set up the database:
   ```
   npx prisma migrate dev
   ```

## 🚀 Usage

### Running the Development Server
1. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

### Examples

- **Creating a New Goal**: 
  Navigate to the Goals page and click on "Add New Goal". Fill in the goal details such as title, description, and target date.

- **Tracking Progress**: 
  From the Dashboard, click on a goal to view its details. Use the "Log Progress" button to add new entries and track your progress over time.

- **Connecting with Friends**: 
  Visit the Social page to find and connect with friends. You can search for users, send friend requests, and view your friends' recent activities.

## 🌐 Deployment

### Vercel Deployment
1. Fork this repository to your GitHub account.
2. Sign up for a Vercel account at https://vercel.com.
3. Click on "Import Project" in your Vercel dashboard.
4. Choose "Import Git Repository" and select your forked repository.
5. Configure your environment variables in the Vercel dashboard.
6. Click "Deploy" and Vercel will handle the rest!

### Environment Variables
Ensure these environment variables are set in your production environment:
- `DATABASE_URL`: Your PostgreSQL database connection string
- `NEXTAUTH_SECRET`: A secret key for NextAuth.js
- `NEXTAUTH_URL`: The canonical URL of your website

## 📄 License
This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

## 👥 Contributors
- **Spectra.codes Team** - [Spectra.codes](https://spectra.codes)
- **DRIX10** - [GitHub Profile](https://github.com/Drix10)

<p align="center">
  <h1 align="center">🌐 Spectra.Codes</h1>
</p>
<p align="center">
  <em>Why only generate Code? When you can generate the whole Repository!</em>
</p>
<p align="center">
<img src="https://img.shields.io/badge/Developer-Drix10-red" alt="">
<img src="https://img.shields.io/badge/Website-Spectra.codes-blue" alt="">
<img src="https://img.shields.io/badge/Backed_by-Google,_Microsoft_&_Amazon_for_Startups-red" alt="">
<img src="https://img.shields.io/badge/Finalist-Backdrop_Build_v4-black" alt="">
<p>