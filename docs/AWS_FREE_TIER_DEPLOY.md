# Amigo AWS Free Tier Deployment

This guide gets Amigo onto AWS with **$0/month at prototype scale** using free-tier services.

## What You Get

| Service | Free tier | Used for |
| --- | --- | --- |
| AWS Amplify Hosting | Build + hosting allowance | React app |
| Amazon Cognito | 50,000 MAUs/month | Login / sign-up |
| Amazon DynamoDB | On-demand free tier | XP, streaks, profile |
| AWS Lambda | 1M requests/month | Sync API |
| API Gateway HTTP API | 1M requests/month (12 months) | Secure API |

Avoid for now: EC2, SageMaker, always-on GPU, SMS auth, WAF.

## Recommended Region

Use **`ap-southeast-1` (Singapore)** — closest to the Philippines.

Set a **Billing Budget alert** in AWS Billing before you deploy.

---

## Phase 1 — Host the App on Amplify (fastest win)

This puts the app on AWS immediately. Progress still saves in the browser until Phase 2.

### 1. Push your code to GitHub

Make sure `amigo-language-app` is on GitHub (`lokeyyron/amigo-language-app`).

### 2. Open AWS Amplify

1. Sign in to [AWS Console](https://console.aws.amazon.com/)
2. Search for **Amplify**
3. Click **Create new app** → **Host web app**
4. Connect **GitHub** and pick `amigo-language-app`
5. Branch: `main`
6. Build settings: Amplify should detect `amplify.yml` automatically
7. Click **Save and deploy**

First deploy takes a few minutes. You’ll get a URL like:

`https://main.xxxxx.amplifyapp.com`

That alone is a valid AWS demo.

---

## Phase 2 — Add Cognito + DynamoDB Sync (still free tier)

This adds real accounts and cloud-saved progress.

### 1. Install AWS CLI + SAM CLI (one time)

On macOS:

```bash
brew install awscli aws-sam-cli
aws configure
```

Use an IAM user with admin access for the first deploy, or ask your instructor for credentials.

### 2. Install Lambda dependencies

```bash
cd infra/lambda/sync
npm install
cd ../../..
```

### 3. Deploy the backend

```bash
cd infra
sam build
sam deploy --guided
```

Suggested answers:

- Stack name: `amigo-backend`
- Region: `ap-southeast-1`
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`

When it finishes, copy the **Outputs**:

- `UserPoolId`
- `UserPoolClientId`
- `ApiUrl`

### 4. Add env vars in Amplify

In Amplify Console → your app → **Hosting** → **Environment variables**:

```txt
VITE_AMIGO_SYNC_MODE=aws-amplify
VITE_AWS_REGION=ap-southeast-1
VITE_COGNITO_USER_POOL_ID=<UserPoolId>
VITE_COGNITO_CLIENT_ID=<UserPoolClientId>
VITE_AMIGO_API_URL=<ApiUrl>
```

Then click **Redeploy this version**.

### 5. Test

1. Open your Amplify URL
2. Sign up with email + password
3. Confirm the verification email from Cognito
4. Log in, complete a lesson, refresh the page
5. XP/streak/profile should persist from DynamoDB

---

## Phase 3 — Optional: Audio on S3

If MP3 files get large, upload them to S3 instead of bundling in the repo.

1. Create bucket `amigo-audio-demo` in `ap-southeast-1`
2. Enable public read on `audio/*` or use CloudFront later
3. Upload files from `public/audio/bisaya/`
4. Point `src/assets.ts` / phrase audio URLs to the S3 URLs

For a hackathon demo, bundled audio in `public/` is fine and costs nothing extra.

---

## Local Development

Copy env values locally:

```bash
cp .env.example .env
```

For local-only demo:

```txt
VITE_AMIGO_SYNC_MODE=local-prototype
```

For testing AWS sync locally:

```txt
VITE_AMIGO_SYNC_MODE=aws-amplify
VITE_AWS_REGION=ap-southeast-1
VITE_COGNITO_USER_POOL_ID=...
VITE_COGNITO_CLIENT_ID=...
VITE_AMIGO_API_URL=...
```

Then:

```bash
npm install
npm run dev
```

---

## Presentation Script

> “Amigo runs on AWS Amplify for hosting, Amazon Cognito for authentication, and DynamoDB for learner progress through a Lambda API on API Gateway. We stayed inside AWS free tier for the prototype, and the same architecture scales when we add AI translation or pronunciation scoring later.”

---

## Troubleshooting

**Build fails on Amplify**
- Check build logs for missing env vars or TypeScript errors
- Run `npm run build` locally first

**Login works but data does not sync**
- Confirm all 5 `VITE_*` variables are set in Amplify
- Redeploy after changing env vars
- Check Lambda logs in CloudWatch for `/sync` errors

**CORS errors**
- Redeploy SAM stack — template allows browser calls from any origin for the demo

**Costs**
- Stay on Amplify Hosting + Cognito + DynamoDB on-demand + Lambda
- Do not launch EC2, SageMaker, or GPU instances

---

## Delete Everything Later

To avoid charges after the demo:

1. Amplify → App settings → Delete app
2. CloudFormation → delete stack `amigo-backend`
3. Remove any S3 buckets you created manually
