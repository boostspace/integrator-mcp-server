# Integrator MCP Server (legacy)

A Model Context Protocol server that enables Integrator scenarios to be utilized as tools by AI assistants. This integration allows AI systems to trigger and interact with your Integrator automation workflows.

> **Note**: This project is a fork of software originally developed by **Make** (MIT licensed).  
> It has been modified and is maintained by **Boost.space**.

## How It Works

The MCP server:

-   Connects to your Integrator account and identifies all scenarios configured with "On-Demand" scheduling
-   Parses and resolves input parameters for each scenario, providing AI assistants with meaningful parameter descriptions
-   Allows AI assistants to invoke scenarios with appropriate parameters
-   Returns scenario output as structured JSON, enabling AI assistants to properly interpret the results

## Benefits

-   Turn your Integrator scenarios into callable tools for AI assistants
-   Maintain complex automation logic in Integrator while exposing functionality to AI systems
-   Create bidirectional communication between your AI assistants and your existing automation workflows

## Usage with Claude Desktop

### Prerequisites

-   NodeJS
-   MCP Client (like Claude Desktop App)
-   Integrator API Key with `scenarios:read` and `scenarios:run` scopes

### Installation

To use this server with the Claude Desktop app, add the following configuration to the "mcpServers" section of your `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "integrator": {
            "command": "npx",
            "args": ["-y", "@boostspace/mcp-server"],
            "env": {
                "INTEGRATOR_API_KEY": "<your-api-key>",
                "INTEGRATOR_TEAM": "<your-team-id>"
            }
        }
    }
}
```

-   `INTEGRATOR_API_KEY` - You can generate an API key in your Integrator profile.
-   `INTEGRATOR_TEAM` - You can find the ID in the URL of the Team page.
