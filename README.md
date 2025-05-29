
# 🎬 reelnn - A Streaming Web App Based on TG

**reelnn** (**reel-inn**) is a full-stack entertainment web application that allows users to stream and access videos directly from Telegram. Built with Next.js for the frontend and Python for the backend, it utilizes Telegram as a file storage system—eliminating the need for traditional hosting infrastructure for video files.


IMPORTANT - This project is in active development. Bugs and glitches are expected. Join [reelnnUpdates](https://t.me/reelnnUpdates) for future updates.

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

### Prerequisites

To use reelnn you have to deploy [reelnn-backend](https://github.com/rafsanbasunia/reelnn-backend/) first. Follow the detailed instructions in [Wiki](https://github.com/rafsanbasunia/reelnn/wiki).

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

