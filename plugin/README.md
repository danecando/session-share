# share-session-plugin

A Claude Code plugin that lets you share your sessions via shareable URLs.

## Installation

### GitHub (Marketplace)

```bash
# Add the marketplace
/plugin marketplace add danecando/session-share

# Install the plugin
/plugin install share-session@crapola
```

### Local

```bash
# Add the marketplace
/plugin marketplace add ./.claude-plugin/marketplace.json

# Install the plugin
/plugin install share-session@crapola
```

## Usage

Run the share command in any Claude Code session:

```bash
/share-session:share
```

The plugin will:

1. Find your current session transcript
2. Package it with any referenced images
3. Upload to the sharing service
4. Return a shareable URL

## How It Works

The plugin packages your session's JSONL transcript along with any images into a gzipped tarball and uploads it to the session sharing service. The service parses and stores the session, returning a URL where anyone can view it.

## License

MIT
