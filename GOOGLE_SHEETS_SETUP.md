# Google Sheets API Configuration Guide
### OBC Form — Gujarati Data Collection System

> This document covers the **complete step-by-step process** to configure Google Sheets API integration for this form. Use this guide whenever you need to switch to a new Google account or re-configure the API from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Google Cloud Project](#2-create-a-google-cloud-project)
3. [Enable Google Sheets API](#3-enable-google-sheets-api)
4. [Create a Service Account](#4-create-a-service-account)
5. [Download the JSON Key File](#5-download-the-json-key-file)
6. [Create & Configure the Google Sheet](#6-create--configure-the-google-sheet)
7. [Share Sheet with Service Account](#7-share-sheet-with-service-account)
8. [Configure .env.local File](#8-configure-envlocal-file)
9. [Build & Restart the Server](#9-build--restart-the-server)
10. [Test the Integration](#10-test-the-integration)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have:

- ✅ A **Google Account** (the customer's Gmail account you want to use)
- ✅ Access to the server where this project is hosted
- ✅ The project running at `/var/www/html/formOBC/obc-form/`
- ✅ **2-Step Verification (2SV)** enabled on the Google account  
  *(Required by Google Cloud since May 13, 2025)*  
  Enable here: https://myaccount.google.com/security

---

## 2. Create a Google Cloud Project

1. Open **https://console.cloud.google.com/** and sign in with the target Gmail account.
2. Click the **project dropdown** at the top → **"New Project"**
3. Fill in:
   - **Project Name**: `obc-form` *(or any name you prefer)*
   - **Location**: No organisation *(default)*
4. Click **"Create"**
5. Make sure the new project is **selected** in the top dropdown before proceeding.

---

## 3. Enable Google Sheets API

1. In the left sidebar go to: **APIs & Services → Library**
2. In the search box type: `Google Sheets API`
3. Click on **"Google Sheets API"** from the results
4. Click the blue **"Enable"** button
5. Wait for it to redirect back — the API is now enabled ✅

> ⚠️ If you skip this step, you will get the error:  
> `[403] Google Sheets API has not been used in project ... before or it is disabled.`

---

## 4. Create a Service Account

A Service Account is a special non-human Google account that your application uses to authenticate with Google APIs — **no password needed, uses a secure JSON key instead.**

1. Go to: **APIs & Services → Credentials**
2. Click **"+ Create Credentials"** → Select **"Service Account"**
3. Fill in the details:
   - **Service account name**: `obc-form-writer` *(or any name)*
   - **Service account ID**: auto-fills from name *(leave as-is)*
   - **Description**: `Service account for OBC form Google Sheets access`
4. Click **"Create and Continue"**
5. Under **"Grant this service account access to project"**:
   - Click the **"Role"** dropdown
   - Search for and select **"Editor"**
6. Click **"Continue"** → Click **"Done"**

The service account is now created. You'll see it listed on the Credentials page.

---

## 5. Download the JSON Key File

1. On the **Credentials** page, click on the **service account email** you just created
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"** → Click **"Create"**
5. A `.json` file will **automatically download** to your computer

> 🔴 **IMPORTANT SECURITY RULES:**
> - Never commit this file to Git
> - Never share it publicly
> - Store it in a secure location
> - If compromised, delete the key from Google Cloud and generate a new one

### What the JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "obc-form-writer@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

**You will need these two values:**
- `client_email` → for `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → for `GOOGLE_PRIVATE_KEY`

---

## 6. Create & Configure the Google Sheet

1. Go to **https://sheets.google.com** → Click **"Blank spreadsheet"**
2. Name it: `OBC Data Gujarat` *(click the title at the top to rename)*
3. Add the following **column headers in Row 1** (A1 to R1) exactly as shown:

| Column | Header Text |
|--------|-------------|
| A | Timestamp |
| B | Email (ઈ-મેઇલ) |
| C | Mobile (મોબાઈલ નંબર) |
| D | House No (ઘર નંબર) |
| E | Society (સોસાયટી નું નામ) |
| F | District (જિલ્લો) |
| G | Taluka (તાલુકો) |
| H | Village/Ward (ગામ/વોર્ડ) |
| I | Department (વિભાગ) |
| J | Full Name (પૂરું નામ) |
| K | Sex (લિંગ) |
| L | Marital Status (વૈવાહિક સ્થિતિ) |
| M | Home Situation (ઘર ની પરિસ્થિતિ) |
| N | Date of Birth (જન્મ તારીખ) |
| O | Occupation (વ્યવસાય) |
| P | Job/Business Name (નોકરી/વ્યવસાય નું નામ) |
| Q | Education (શિક્ષણ) |
| R | Caste (જ્ઞાતિ - LC મુજબ) |

4. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  <<<SHEET_ID_IS_HERE>>>  /edit
   ```
   Example:
   ```
   https://docs.google.com/spreadsheets/d/1uhq-px5-p-KofmVuSfV9Hvq-Exks6v_pocmtx3njzsM/edit
   Sheet ID → 1uhq-px5-p-KofmVuSfV9Hvq-Exks6v_pocmtx3njzsM
   ```

---

## 7. Share Sheet with Service Account

The Service Account needs **Editor** access to write data into the sheet.

1. Open the Google Sheet you created
2. Click the **"Share"** button (top right corner)
3. In the **"Add people and groups"** field, paste the service account email:
   ```
   obc-form-writer@your-project-id.iam.gserviceaccount.com
   ```
   *(Copy this from the `client_email` field in your downloaded JSON file)*
4. Set permission to **"Editor"**
5. **Uncheck** "Notify people" *(service accounts don't have an inbox)*
6. Click **"Share"**

> ⚠️ If you skip this step, you will get a `403 Forbidden` or `You do not have permission` error when submitting the form.

---

## 8. Configure .env.local File

The `.env.local` file stores your credentials **securely on the server** and is never exposed to the browser or Git repository.

### File Location:
```
/var/www/html/formOBC/obc-form/.env.local
```

### Create / Update the file with:
```env
GOOGLE_SHEET_ID=your_sheet_id_here

GOOGLE_SERVICE_ACCOUNT_EMAIL=obc-form-writer@your-project-id.iam.gserviceaccount.com

GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
```

### How to fill each value:

**`GOOGLE_SHEET_ID`**
- From your Google Sheet URL (Step 6 above)

**`GOOGLE_SERVICE_ACCOUNT_EMAIL`**
- Copy the `client_email` field from the downloaded JSON file

**`GOOGLE_PRIVATE_KEY`**
- Copy the entire `private_key` value from the downloaded JSON file
- It starts with `-----BEGIN PRIVATE KEY-----`
- It ends with `-----END PRIVATE KEY-----\n`
- Paste it **inside double quotes** in `.env.local`
- Keep all `\n` characters exactly as they appear in the JSON — **do NOT replace them with real line breaks**

### Example of a completed `.env.local`:
```env
GOOGLE_SHEET_ID=1uhq-px5-p-KofmVuSfV9Hvq-Exks6v_pocmtx3njzsM

GOOGLE_SERVICE_ACCOUNT_EMAIL=obc-form-writer@obcform.iam.gserviceaccount.com

GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...(long key)...zbE=\n-----END PRIVATE KEY-----\n"
```

---

## 9. Build & Restart the Server

After updating `.env.local`, you **must rebuild and restart** the server for changes to take effect.

```bash
# Navigate to project directory
cd /var/www/html/formOBC/obc-form

# Load correct Node version
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use v22.19.0

# Build production bundle (picks up new .env.local)
npm run build

# Start production server on port 3001
npm start -- -p 3001
```

> ✅ You should see:
> ```
> ▲ Next.js 16.2.x
> - Local:    http://localhost:3001
> - Network:  http://YOUR_IP:3001
> - Environments: .env.local     ← confirms .env.local was loaded
> ✓ Ready in Xms
> ```

---

## 10. Test the Integration

1. Open the form at **http://YOUR_SERVER_IP:3001**
2. Fill in all required fields (marked with `*`)
3. Add at least one family member using the **＋ button**
4. Click **"ફોર્મ સબમિટ કરો"**
5. You should see a **green success message**
6. Open your Google Sheet — a new row should appear for each family member ✅

---

## 11. Troubleshooting

### ❌ `Server configuration error`
**Cause:** `.env.local` file is missing or has placeholder values  
**Fix:** Ensure `.env.local` exists at `/var/www/html/formOBC/obc-form/.env.local` with all 3 real values filled in

---

### ❌ `[403] Google Sheets API has not been used...`
**Cause:** Google Sheets API is not enabled in the Cloud project  
**Fix:** Go to → **APIs & Services → Library** → Search `Google Sheets API` → Click **Enable**

---

### ❌ `[403] The caller does not have permission`
**Cause:** The service account was not given Editor access to the Google Sheet  
**Fix:** Open the Sheet → Share → Add service account email → Set as **Editor**

---

### ❌ Page refreshes / clears on public URL
**Cause:** Running in development mode (`npm run dev`) which has Hot Module Reload  
**Fix:** Always use production mode for external access:
```bash
npm run build && npm start -- -p 3001
```

---

### ❌ `Google Cloud access blocked` (2SV error)
**Cause:** Google now requires 2-Step Verification on all Cloud accounts  
**Fix:** Enable 2SV at https://myaccount.google.com/security before accessing Google Cloud

---

### ❌ Private key error / authentication failed
**Cause:** The `\n` in private key was replaced with real line breaks  
**Fix:** The private key in `.env.local` must have literal `\n` characters (not real newlines). Copy directly from the JSON file value and keep it all on one line inside the quotes.

---

## 🔁 Quick Checklist for Future Account Switch

When switching to a new customer Gmail account, go through this checklist:

- [ ] Sign in to Google Cloud with new Gmail account
- [ ] Enable 2-Step Verification on the account
- [ ] Create a new Google Cloud Project
- [ ] Enable **Google Sheets API** in the project
- [ ] Create a **Service Account** with Editor role
- [ ] Download the **JSON key file**
- [ ] Create a new **Google Sheet** with the 18 column headers
- [ ] **Share the Sheet** with the service account email (Editor)
- [ ] Update `.env.local` with new `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
- [ ] Run `npm run build` to rebuild with new credentials
- [ ] Run `npm start -- -p 3001` to start production server
- [ ] Test form submission and verify data in Google Sheet ✅

---

*Document created: April 2026 | Project: OBC Form Gujarat*
