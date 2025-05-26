
# 🎬 reelnn - A Streaming Web App Based on TG

**reelnn** (short form of **reel-inn**) is a full-stack entertainment web application that allows users to stream and access videos directly from Telegram. Built with Next.js for the frontend and Python for the backend, it utilizes Telegram as a file storage system—eliminating the need for traditional hosting infrastructure for video files.

## 🌐 Demo

[reelnn.vercel.app](https://reelnn.vercel.app)


## 🚀 Features

* 📂 **Storage** : Streams video files directly from Telegram, using Telegram bots/channels as a file CDN.

* 🍿**TMDB** : Scans video to retrive metadata from **TheMovieDatabase**.

* 🔎 **Search & Discover** : Quickly find movies or TV shows with a responsive search interface.

* ⚡ **Fast & Lightweight** : Built with Next.js for blazing-fast performance.

* 🔐 **Secure Access** : Secured API endpoints using Next.js api features.

* 🎥 **Embedded Player** : Smooth in-browser video streaming experience.

* 🔄️ **Cache** : Uses a creative approch to cache video files and its metadata for faster page loading.

* 🎚️ **Customization** : A Content Manager to customize homepage contents (more incoming)

* ⬇️ **Download** : Users can download contents from both web browser or telegram.

* 👤 **User Account** : Users can for login / register. `#Todo`

* 🗄️ **Database** : MongoDB for simple and fast database access.

* 🔖 **Shortner Support** : Support fooor urll shortners to shorten the long tokenized links.

* ➕➕ more features coming soon





## 🧠 How It Works

* **Storage**: You upload your media files to a private Telegram channel or group.

* **Indexing**: The backend fetches file metadata from Telegram and stores it in your DB or in-memory.

* **Frontend Requests** : Users search or browse movies, triggering API requests to the Python backend.

* **Streaming** : The backend generates a direct streaming link via Telegram’s getFile endpoint and streams it to the frontend.

* **Access Control** : Add checks (if needed) to allow only specific users or Telegram-verified accounts. `#Todo`
## 🛠️ Installation

### 1. Prerequisites

To use reelnn you have to deploy [reelnn-backend](https://github.com/rafsanbasunia/reelnn-backend/) first. After you've successfully deployed your backend and you've the `BACKEND_URL`, then goto step 2.

### 2. Deployment
#### 2.1 🌐 Deploy Using Vercel
* Fork this repository.
* Create an account or Login in [Vercel](https://vercel.com). Connect your github account and import your forked repository.
* Add the following environment varriables:
- Mandatory variables:
`BACKEND_URL` = The url of your backend without the `/` at the end. Ex. `https://- backend-abcd123.herokuapp.com`

`SITE_SECRET` = Use the same SITE_SECRET you used to deploy backend.
 
`NEXT_PUBLIC_TELEGRAM_BOT_NAME` = Your Telegram Bot username which will forward the files to the users

`NEXT_PUBLIC_SITE_NAME` = Your Site Name


- Optional variables:

`NEXT_PUBLIC_FOOTER_DESC` = Site Footer Description

`NEXT_PUBLIC_FOOTER_CONTACT` = Contact Info

`SHORTENER_API_KEY` = Api key if you want to use your shortner

`SHORTENER_API_URL` = Api url if you want to use your shortner

- After adding all the variables, click deploy.


#### 2.2 Local Deployment Guide
coming soon ...


## 🤝 Contributing

PRs are welcome! For major changes, please open an issue first to discuss what you’d like to change or what's not working.


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Screenshots
- Hero Slider
![Hero Slider](https://i.ibb.co/N6nd9GWs/image.png)
- Home Sections
![Hero Slider](https://i.ibb.co/KQFpK0J/image.png)
- Content Section
![Hero Slider](https://i.ibb.co/5XyFqvMS/image.png)
- Video Player
![Hero Slider](https://i.ibb.co/Wv2LcRy2/image.png)
- Downlaod Section
![Hero Slider](https://i.ibb.co/2Ydckkh9/image.png)

