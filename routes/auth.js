const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { getAuthUrl, getTokensFromCode } = require('../services/googleCalendar');
const { upsertUser } = require('../services/firebase');

router.get('/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) return res.redirect('/?error=auth_denied');
  if (!code) return res.redirect('/?error=no_code');

  try {
    const tokens = await getTokensFromCode(code);
    req.session.tokens = tokens;

    // Fetch basic Google profile info
    const { createOAuthClient } = require('../services/googleCalendar');
    const client = createOAuthClient();
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });

    const userInfo = await oauth2.userinfo.get();
    const profile = {
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
    };

    req.session.uid = userInfo.data.id;
    req.session.userInfo = profile;

    // Save/update user in Firestore (non-blocking failure)
    await upsertUser(userInfo.data.id, profile).catch(() => { });

    res.redirect('/?auth=success');
  } catch (err) {
    console.error('OAuth error:', err.message);
    res.redirect('/?error=auth_failed');
  }
});

router.get('/status', (req, res) => {
  res.json({
    authenticated: !!req.session.tokens,
    user: req.session.userInfo || null,
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
