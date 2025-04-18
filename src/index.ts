#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Integrator } from 'src/integrator.js';
import { remap } from './utils.js';

const server = new Server(
    {
        name: 'Boost.space',
        version: '0.1.0',
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

if (!process.env.INTEGRATOR_API_KEY) {
    console.error('Please provide INTEGRATOR_API_KEY environment variable.');
    process.exit(1);
}
if (!process.env.INTEGRATOR_TEAM) {
    console.error('Please provide INTEGRATOR_TEAM environment variable.');
    process.exit(1);
}

const integrator = new Integrator(process.env.INTEGRATOR_API_KEY);
const teamId = parseInt(process.env.INTEGRATOR_TEAM);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    const scenarios = await integrator.scenarios.list(teamId);
    return {
        tools: await Promise.all(
            scenarios
                .filter(scenario => scenario.scheduling.type === 'on-demand')
                .map(async scenario => {
                    const inputs = (await integrator.scenarios.interface(scenario.id)).input;
                    return {
                        name: `run_scenario_${scenario.id}`,
                        description: scenario.name + (scenario.description ? ` (${scenario.description})` : ''),
                        inputSchema: remap({
                            name: 'wrapper',
                            type: 'collection',
                            spec: inputs,
                        }),
                    };
                }),
        ),
    };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
    if (/^run_scenario_\d+$/.test(request.params.name)) {
        try {
            const output = (
                await integrator.scenarios.run(parseInt(request.params.name.substring(13)), request.params.arguments)
            ).outputs;

            return {
                content: [
                    {
                        type: 'text',
                        text: output ? JSON.stringify(output, null, 2) : 'Scenario executed successfully.',
                    },
                ],
            };
        } catch (err: unknown) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: String(err),
                    },
                ],
            };
        }
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
