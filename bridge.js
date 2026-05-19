/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   StreamElements Chat Bridge  —  bridge.js              ║
 * ║   Connects to Twitch chat via ComfyJS and forwards      ║
 * ║   every event to the overlay via a local WebSocket.     ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * SETUP (one-time):
 *   npm install comfy.js ws
 *
 * RUN:
 *   node bridge.js
 *   (or just double-click start.bat on Windows)
 */

// ── CONFIG ────────────────────────────────────────────────────
const TWITCH_CHANNEL = 'capnceedee';   // ← your Twitch channel name
const WS_PORT        = 7474;           // must match BRIDGE_PORT in overlay HTML
// ─────────────────────────────────────────────────────────────

const ComfyJS = require('comfy.js');
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);
  console.log(`[Bridge] Overlay connected  (${clients.size} client(s))`);
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[Bridge] Overlay disconnected (${clients.size} client(s))`);
  });
});

function broadcast(payload) {
  const str = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === 1 /* OPEN */) ws.send(str);
  }
}

// ── Twitch chat message ───────────────────────────────────────
ComfyJS.onChat = (user, message, flags, self, extra) => {
  // Build a badge list compatible with the overlay's SE format
  const badges = buildBadges(flags, extra);

  broadcast({
    type: 'chat',
    user,
    message,
    color:       extra.userColor || '#FFFFFF',
    displayName: extra.displayName || user,
    userId:      extra.userId,
    msgId:       extra.id,
    isAction:    extra.messageType === 'action',
    flags,
    badges,
    // Emotes — ComfyJS gives us a map of { emoteId: [positions] }
    // We convert to the SE-style array the overlay expects
    emotes: buildEmotes(extra.messageEmotes),
  });
};

// ── Mod actions ───────────────────────────────────────────────
ComfyJS.onMessageDeleted = (id, extra) => {
  broadcast({ type: 'delete-message', msgId: id });
};

ComfyJS.onBan = (bannedUsername, extra) => {
  broadcast({ type: 'delete-messages', userId: extra.bannedUserId || bannedUsername });
};

ComfyJS.onTimeout = (timedOutUsername, duration, extra) => {
  broadcast({ type: 'delete-messages', userId: extra.timedOutUserId || timedOutUsername });
};

// ── Alerts ────────────────────────────────────────────────────
ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  broadcast({ type: 'sub', user, amount: 1, name: user });
};

ComfyJS.onResub = (user, count, message, subTierInfo, extra) => {
  broadcast({ type: 'sub', user, amount: count, name: user });
};

ComfyJS.onSubGift = (gifterUser, streak, recipient, subTierInfo, extra) => {
  broadcast({ type: 'gift-subs', user: gifterUser, amount: 1, name: gifterUser });
};

ComfyJS.onSubMysteryGift = (gifterUser, numbOfSubs, subTierInfo, extra) => {
  broadcast({ type: 'gift-subs', user: gifterUser, amount: numbOfSubs, name: gifterUser });
};

ComfyJS.onCheer = (user, message, bits, flags, extra) => {
  broadcast({ type: 'cheer', user, amount: bits, name: user });
};

ComfyJS.onRaid = (user, viewers, extra) => {
  broadcast({ type: 'raid', user, amount: viewers, name: user });
};

// ── Connect ───────────────────────────────────────────────────
ComfyJS.Init(TWITCH_CHANNEL);

console.log(`\n🎮  StreamElements Chat Bridge started`);
console.log(`    Channel : #${TWITCH_CHANNEL}`);
console.log(`    WS port : ws://localhost:${WS_PORT}`);
console.log(`    Waiting for the overlay to connect...\n`);


// ── Helpers ───────────────────────────────────────────────────

/**
 * Convert ComfyJS flags + extra into an SE-style badge array.
 * Badge image URLs are the standard Twitch CDN paths.
 */
function buildBadges(flags, extra) {
  const badges = [];

  if (flags.broadcaster) {
    badges.push({ type: 'broadcaster', url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3', description: 'Broadcaster' });
  } else if (flags.mod) {
    badges.push({ type: 'mod', url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3', description: 'Moderator' });
  }

  if (flags.vip) {
    badges.push({ type: 'vip', url: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3', description: 'VIP' });
  }

  if (flags.subscriber) {
    badges.push({ type: 'subscriber', url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3', description: 'Subscriber' });
  }

  return badges;
}

/**
 * Convert ComfyJS emote map  { "id": ["start-end", ...] }
 * into the SE-style emote array the overlay's attachEmotes() expects.
 * Note: ComfyJS gives us IDs and positions but not names — the overlay
 * handles Twitch emotes by position so names are not needed here.
 */
function buildEmotes(messageEmotes) {
  if (!messageEmotes) return [];
  return Object.entries(messageEmotes).flatMap(([id, positions]) => {
    return positions.map(pos => {
      const [start, end] = pos.split('-').map(Number);
      return {
        type: 'twitch',
        name: '',   // name not available from ComfyJS; overlay uses position
        id,
        gif:  false,
        urls: {
          1: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/1.0`,
          2: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/2.0`,
          4: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/3.0`,
        },
        start,
        end,
      };
    });
  });
}
