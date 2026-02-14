# X Clipper

Clip X post contents as markdown. You need an X API account with app-only auth enabled and a Bearer Token.

![readme-screenshot](https://github.com/user-attachments/assets/a8d34af0-a072-44d6-aaf3-1ff790a4dd32)

## Setup

### 1. Get Your X API Bearer Token

1. Visit [X Developer Portal](https://console.x.com/)
2. Create or select an existing app
3. Under **App-Only Authentication**, copy your **Bearer Token**

### 2. Install the plugin

1. Open Obsidian settings
2. Go to **Community Plugins** and install and enable X Clipper
3. Open the X Clipper plugin settings
4. Add your Bearer Token in the **X API bearer token** field

### 3. Clip an X Post

**Option 1: Using the paperclip icon**
- Click the paperclip icon in the left ribbon

**Option 2: Using the command**
- Open the command palette (Cmd/Ctrl + P)
- Search for "Clip X post"
- Press Enter

## License

0-BSD — See LICENSE for details.

## Development

To develop this plugin locally:

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Feedback

If you caught an issue or bug or have any feedback (let me know on X)[https://x.com/c14_mx].