# @finchtoys/minitools

The official CLI for installing and managing Finch mini tools (shown in the app as Mini Programs).

## Installation

Run the CLI directly with npm:

```bash
npx @finchtoys/minitools add <package>
```

## Usage

```bash
# Install a mini tool from npm
npx @finchtoys/minitools add @scope/my-finch-tool

# Link a local mini tool for development (source files are not copied)
npx @finchtoys/minitools add ./my-finch-tool -d
npx @finchtoys/minitools add /absolute/path/to/my-finch-tool --dev

# List installed mini tools
npx @finchtoys/minitools list

# Update a mini tool
npx @finchtoys/minitools update my-tool

# Enable or disable a mini tool
npx @finchtoys/minitools enable my-tool
npx @finchtoys/minitools disable my-tool

# Diagnose a mini tool package before publishing
npx @finchtoys/minitools doctor ./my-finch-tool
```

## Install scopes

- Default: personal scope at `<FINCH_AGENT_HOME>/.finch/extensions/`.
- `--global`: runtime-global scope at `<FINCH_RUNTIME_HOME>/extensions/` (normally `~/.finch/extensions/`).
- Project scope is not supported for mini tools; `--cwd` is rejected.

When Finch launches the CLI, it supplies `FINCH_AGENT_HOME` and `FINCH_RUNTIME_HOME` so custom Agent homes and Dev/Prod runtimes remain isolated. Run `npx @finchtoys/minitools where` to inspect the resolved paths.

## Development links

`add <local-directory> -d` (or `--dev`) validates the mini tool and creates a directory symlink in the selected install scope. Finch reads the source directory directly, so rebuilding or editing the local project does not require reinstalling it.

- Development links are marked as `linked` by `list`.
- `update` refuses to overwrite a development link.
- `remove` deletes only the link and install record; it never deletes the source directory.
- Missing source directories are shown as `linked-broken`.
- `-d/--dev` does not accept npm packages, URLs, or archive files.

Mini tools add Agent tools, MCP integrations, and native UI capabilities to Finch. See the [Finch documentation](https://finchwork.app/en/docs/minitools) to build a mini tool.

## License

MIT
