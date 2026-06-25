# Amigo

Amigo is a gamified language-learning app built to help preserve indigenous and endangered Philippine languages, starting with Bisaya/Cebuano for the current prototype. It is inspired by apps like Duolingo, but focused on mother tongue learning, cultural preservation, and beginner-friendly lessons for Filipino learners.

Live demo: [https://main.d22xlvblvnzppa.amplifyapp.com/](https://main.d22xlvblvnzppa.amplifyapp.com/)

## Project Goal

Many indigenous and regional languages are at risk as younger learners use their mother tongue less often because of modernization, globalization, and social pressure. Amigo aims to make language learning feel fun, familiar, and rewarding through short lessons, XP, streaks, audio, and friendly progress tracking.

The prototype currently focuses on Bisaya/Cebuano, while showing future paths for other Mindanao languages.

## Current Prototype Features

- Mobile-first learning interface
- AWS Amplify Hosting deployment
- AWS Amplify account authentication for login, signup, and logout
- Bisaya/Cebuano lesson path
- XP and streak tracking
- Progress page for completed lessons
- Profile page with editable profile details
- Friends list, friend streaks, badges, and leaderboard-style UI
- Alerts and settings modals
- Lesson audio playback using recorded MP3 files
- Speaking/pronunciation practice for selected phrases
- Dictionary-style English to Bisaya translator
- Bottom navigation for Home, Translate, Progress, and Profile
- Language cards for Bisaya, Maguindanaon, Maranao, Tausug, Dabawenyo, and Chavacano

Only Bisaya is currently playable. The other language cards are included as planned future content.

## Current Lessons

The prototype includes 8 Bisaya lessons:

| Lesson | Phrase | Meaning |
| --- | --- | --- |
| Greetings & Introduction | Maayong buntag | Good morning |
| Checking In | Kumusta ka? | How are you? |
| Where Are You From? | Taga asa ka? | Where are you from? |
| Pronunciation Practice | Maayong buntag | Good morning |
| Polite Words | Salamat | Thank you |
| Asking Nicely | Palihug | Please |
| Family Words | Pamilya | Family |
| Daily Check-in | Maayo ko | I am good |

## Current Translator Demo

The translator is currently a curated dictionary-style prototype. It is made for reliable demo use, not full real-time AI translation yet.

Supported English inputs include:

| English | Bisaya |
| --- | --- |
| Good morning | Maayong buntag |
| How are you? | Kumusta ka? |
| Where are you from? | Taga asa ka? |
| Thank you / Thanks | Salamat |
| Please | Palihug |
| Family | Pamilya |
| I am good / I'm good / I am fine | Maayo ko |
| Good afternoon | Maayong hapon |
| Good evening | Maayong gabii |
| What is your name? | Unsa imong ngalan? |

## Tech Stack

- React
- TypeScript
- Vite
- AWS Amplify Hosting
- AWS Amplify Auth
- Browser speech recognition for prototype speaking practice
- Local/static audio assets for phrase playback

## AWS Status

The project is currently deployed online through AWS Amplify:

[https://main.d22xlvblvnzppa.amplifyapp.com/](https://main.d22xlvblvnzppa.amplifyapp.com/)

The current AWS integration covers hosting and account authentication. Lesson progress, XP, streaks, profile details, friends, and leaderboard data still need a real backend database connection to sync across devices and user accounts.

Suggested future AWS services:

- Amazon DynamoDB for user progress, XP, streaks, profiles, friends, and leaderboards
- AWS Lambda or AWS AppSync for secure backend APIs
- Amazon S3 for larger audio assets and future media storage
- Amazon Cognito through Amplify Auth for account management
- AWS Budgets to monitor free-tier usage and avoid surprise costs

AWS can support the app infrastructure, but it cannot fully solve endangered-language translation by itself. Accurate Bisaya and indigenous language translation will require curated datasets, fluent speaker review, community validation, or custom language models.

## Future Features

- Cloud saving for XP, streaks, progress, profile, and friends
- Real leaderboard backed by a database
- More Bisaya lessons and daily challenges
- Unlockable paths for Maguindanaon, Maranao, Tausug, Dabawenyo, and Chavacano
- More native-speaker audio recordings
- Better pronunciation scoring
- Microphone-based translator input
- Offline-first lesson access
- Android APK build through Capacitor
- Admin or teacher dashboard for adding lessons
- Community review system for translations and pronunciation
- AI-assisted lesson generation using reviewed language datasets

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build

```bash
npm run build
```

## Team

- Ethan Jeff Mernilo - Team Leader
- Luke Aaron Velasquez - Head Developer
- Carlos Ysmael Minoza
- Keith Zheddrick Siao
- Andrew Earl Andres

## Notes

Amigo is currently a hackathon prototype. The app is designed to demonstrate the learning experience, visual direction, AWS authentication, and future technical path. Some features are simulated or stored locally until the backend database and full cloud sync are connected.
