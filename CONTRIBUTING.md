# Contributing to Easy Backlinks

Thank you for your interest in contributing to Easy Backlinks! Contributions from the community are welcome. Feel free to submit issues, feature requests, or pull requests. For more information on how to contribute, please see the guidelines below.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Committing Guidelines](#committing-guidelines)
- [Release Process](#release-process)
- [Resources](#resources)
- [License](#license)

## Getting Started

Create a fork of the repository and clone it to your local machine.

### 1. Clone Repository

```bash
git clone https://github.com/njobnz/joplin-plugin-easy-backlinks.git
cd joplin-plugin-easy-backlinks
```

### 2. Install Dependencies

```bash
npm install
```

## Development Workflow

### Build the Plugin

```bash
npm run dist
```

## Release Process

- Versioning is automated with [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version). 
- To bump version, update changelog, and create a Git tag, run: 

```bash
npm run release
```

- Pushing a `release` tag triggers GitHub Actions workflow to build and publish the plugin to npm:

```bash
git push origin tag release --force
```

## Committing Guidelines

- Use [Conventional Commit](https://www.conventionalcommits.org) for all commit messages.
- Example: `feat: add settings dialog` or `fix: correct backlink parsing`.
- Each commit should be atomic and address a single concern.

## More Information

- [Joplin Plugin API](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin Data API](https://joplinapp.org/help/api/references/rest_api)
- [Joplin Plugin Manifest](https://joplinapp.org/api/references/plugin_manifest/)
- Ask for help on the [forum](https://discourse.joplinapp.org/) or our [Discord channel](https://discord.gg/VSj7AFHvpq)

## License

This project is licensed under the [MIT License](https://github.com/njobnz/joplin-plugin-easy-backlinks/blob/main/LICENSE.md). See `LICENSE.md` for details.