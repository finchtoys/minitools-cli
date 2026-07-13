# @finchtoys/minitools

The official CLI for installing and managing Finch minitools.

## Installation

Run the CLI directly with npm:

```bash
npx @finchtoys/minitools add <package>
```

## Usage

```bash
# Install an mini tool from npm
npx @finchtoys/minitools add @scope/my-finch-tool

# List installed mini tool extensions
npx @finchtoys/minitools list

# Update an mini tools
npx @finchtoys/minitools update my-tool

# Enable or disable an mini tool
npx @finchtoys/minitools enable my-tool
npx @finchtoys/minitools disable my-tool

# Diagnose the local mini tool environment
npx @finchtoys/minitools doctor
```

Mini tools add agent tools, MCP integrations, and native UI capabilities to Finch. See the [Finch documentation](https://finchwork.app/en/docs/minitools) to build an mini tool (extension）.

## License

MIT
