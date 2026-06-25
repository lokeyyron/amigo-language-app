# Amigo

Amigo is a gamified language learning prototype for learning and preserving indigenous and endangered languages in Mindanao. The current demo focuses on Bisaya/Cebuano lessons with streaks, XP, profile progress, leaderboards, phrase audio, and speaking practice.

## Prototype Features

- Mobile-first language learning UI
- Bisaya lesson path with XP and streak tracking
- Translator demo for common English to Bisaya phrases
- MP3 playback for lesson and translator phrases
- Speaking practice using browser speech recognition
- Editable profile, friends, badges, progress, alerts, and settings
- AWS-ready local sync adapter for future Cognito/DynamoDB integration

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

## Asset Locations

Upload exported assets into `public/assets`.

Important files:

```txt
public/assets/ui/play-button.png
public/assets/icons/fire-inactive.png
public/assets/icons/league-timawa.png
public/audio/bisaya/maayong-buntag.mp3
public/audio/bisaya/kumusta-ka.mp3
public/audio/bisaya/taga-asa-ka.mp3
```

More asset placement notes are in `public/assets/README.md`.

## AWS Prototype Plan

This app is currently safe for local/demo use. It includes an AWS-ready adapter in `src/services/amigoCloud.ts` so the storage layer can later be connected to AWS Amplify, Cognito, DynamoDB, and S3 without rewriting the UI.

See [docs/AWS_PROTOTYPE.md](docs/AWS_PROTOTYPE.md).

## Deploy on AWS Free Tier

Step-by-step guide: [docs/AWS_FREE_TIER_DEPLOY.md](docs/AWS_FREE_TIER_DEPLOY.md)

Quick path:

1. Connect the GitHub repo to **AWS Amplify Hosting** (uses `amplify.yml`)
2. Deploy backend with **SAM** from `infra/template.yaml` (Cognito + DynamoDB + Lambda)
3. Add `VITE_*` env vars in Amplify and redeploy

## Notes

The current translator is a local dictionary for a reliable demo. Real translation and speech scoring can be connected later through a backend model or AWS service, but that may require paid compute.
