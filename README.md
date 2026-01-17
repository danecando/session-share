# session-share

A Claude Code plugin to share agent sessions to a public URL.

[https://share.crapola.ai](https://share.crapola.ai)

## Warning

The plugin does not currently scrub the contents of your session to redact sensitive information. Make sure that you don't share any sessions that
contain sensitive information.

## Install Plugin

```bash
# Add the marketplace
/plugin marketplace add danecando/session-share

# Install the plugin
/plugin install share-session@danecando
```

## Usage

Once installed, use the `/share-session:share` command in Claude Code to share your current session:

```bash
❯ /share-session:share

⏺ Bash("/plugin/scripts/share-session.sh" "/.claude/pro…)
  ⎿  https://share.crapola.ai/xarNTVnFbi

⏺ Your session has been shared: https://share.crapola.ai/xarNTVnFbi
```

This packages your session transcript and uploads it to [share.crapola.ai](https://share.crapola.ai), returning a shareable URL.
