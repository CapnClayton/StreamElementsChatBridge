# StreamElements Bridged Chat Overlay

---

## Me!
I stream over @ https://twitch.tv/capnceedee and am always happy to talk coding and RPGs!

## The Suite

You have 4 files in your `overlay` folder:

| File | Purpose |
|---|---|
| `overlay.html` | The actual chat overlay OBS displays |
| `bridge.js` | Node.js server that connects to Twitch chat and pipes it to the overlay |
| `start.bat` | Double-click launcher for the bridge (Windows) |
| `package.json` | Lists the Node.js dependencies (`comfy.js`, `ws`) |

---

## Starting the bridge
Double-click `start.bat`. The first time it opens, it will install dependencies automatically — this takes about 30 seconds. After that it's instant. You should see:

```
🎮  StreamElements Chat Bridge started
    Channel : #<channel>
    WS port : ws://localhost:7474
    Waiting for the overlay to connect...
```

Keep this window open the entire stream. Closing it kills the chat connection.

---

## Testing Without Streaming

Open `overlay.html?dev=1` in Chrome (drag the file into Chrome, then add `?dev=1` to the URL bar). Two buttons appear in the bottom-right corner:

- **Test Message** — cycles through 7 fake messages with different badge types
- **Demo** — fires all 7 with a 3-second gap between them

OBS uses an older version of Chromium so the dev site's CSS may make it look as if the SVGs are mis-aligned, but they will not be in OBS (as of May 19, 2026).

---

## Customizing

### Settings (`CONFIG` block near the top of `overlay.html`)

| Setting | What it does |
|---|---|
| `channelName` | Your Twitch username |
| `messagesLimit` | Max messages visible at once |
| `hideAfter` | Seconds before a message fades (999 = never) |
| `hideCommands` | Hide `!command` messages |
| `ignoredUsers` | Array of usernames to never show |
| `botNames` | Array of bot usernames |
| `badgeDisplay` | Show/hide badges |
| `ShowAlerts` | Show/hide sub/raid/etc alerts |
| `*AlertMessage` | Text for each alert type (`$User`, `$Amount`) |

### Appearence/CSS Tweaks

You likely will want to tweak these values to fit your setup

| Element | Property | What it does |
|---|---|---|
| `.main-container` | `padding-left` | Moves everything left/right |
| `.message-bubble` | `width` | Controls bubble width (Messages) |
| `.alert-container` | `width` | Controls sword width (Cheers) |

