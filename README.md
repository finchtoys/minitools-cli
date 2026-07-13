# @finchtoys/minitools

The official CLI for installing and managing Finch extensions.

## Installation

Run the CLI directly with npm:

```bash
npx @finchtoys/minitools add <package>
```

## Usage

```bash
# Install an extension from npm
npx @finchtoys/minitools add @scope/my-finch-extension

# List installed extensions
npx @finchtoys/minitools list

# Update an extension
npx @finchtoys/minitools update my-extension

# Enable or disable an extension
npx @finchtoys/minitools enable my-extension
npx @finchtoys/minitools disable my-extension

# Diagnose the local extension environment
npx @finchtoys/minitools doctor
```

Extensions add agent tools, MCP integrations, and native UI capabilities to Finch. See the [Finch documentation](https://finchwork.app/docs/extensions) to build an extension.

## License

MIT
