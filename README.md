# Life, Sorted — How to put it on your phone

This guide takes about 20 minutes and you don't need any coding experience.
At the end you'll have "Life, Sorted" as an app icon on your Android home screen.

---

## What you'll need

- A computer (Mac or Windows)
- Your Android phone
- An internet connection

---

## Step 1 — Install Node.js (one-time setup, ~5 mins)

Node.js is a free tool that lets you build the app.

1. Go to: **https://nodejs.org**
2. Click the big green **"LTS"** button to download
3. Open the downloaded file and install it like any normal program
4. When it's done, you won't see anything open — that's fine, it runs in the background

---

## Step 2 — Unzip the app folder

1. Find the **life-sorted.zip** file you downloaded
2. Double-click it to unzip
3. You'll get a folder called **life-sorted** — put it somewhere easy to find, like your Desktop

---

## Step 3 — Build the app (~5 mins)

This is the only slightly techy part, but just copy and paste exactly.

**On Mac:**
1. Open the **Terminal** app (search for it in Spotlight with ⌘+Space)
2. Type this and press Enter: `cd ~/Desktop/life-sorted`
   *(If you put the folder somewhere else, adjust the path)*
3. Type this and press Enter: `npm install`
   → Wait about 1 minute. You'll see a lot of text scroll — that's normal.
4. Type this and press Enter: `npm run build`
   → Wait about 30 seconds. When it says "built in X.Xs", you're done.

**On Windows:**
1. Open the **Command Prompt** app (search for it in the Start menu)
2. Type: `cd %USERPROFILE%\Desktop\life-sorted` and press Enter
3. Type: `npm install` and press Enter → wait ~1 minute
4. Type: `npm run build` and press Enter → wait ~30 seconds

A new folder called **dist** will appear inside life-sorted. That's your finished app.

---

## Step 4 — Put it online with Netlify (free, ~5 mins)

1. Go to: **https://netlify.com**
2. Click **"Sign up"** → sign up with your email (it's free, no card needed)
3. Once logged in, you'll see a big area that says **"drag and drop your site folder here"**
4. Open your **life-sorted** folder on your computer
5. Drag the **dist** folder (not the whole life-sorted folder — just dist) into that area on Netlify
6. Wait about 10 seconds
7. Netlify gives you a URL like `https://amazing-name-123.netlify.app` — that's your live app!

Optional: Click "Domain settings" to give it a nicer name like `life-sorted.netlify.app`

---

## Step 5 — Install it on your Android phone

1. Open **Chrome** on your Android phone
2. Go to the URL Netlify gave you
3. Tap the **three dots** (⋮) in the top right corner
4. Tap **"Add to Home screen"** or **"Install app"**
5. Tap **"Install"**

That's it. "Life, Sorted" now appears on your home screen like a real app. 🎉

---

## Keeping your data

Right now the app saves data while it's open, but resets if you close it.
To make data save permanently, message me and I'll add that feature — it takes
about 30 minutes and uses a free database called Firebase.

---

## Got stuck?

If anything goes wrong at any step, just copy the error message you see
and paste it into your Claude chat. I'll help you fix it.
