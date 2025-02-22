# Multiple Auth Collections Example

This example demonstrates how to use multiple authentication collections in a single application.

## Overview

This project leverages two authentication collections:

- **customers**: For general users
- **admins**: For administrative users

Each collection has its own configuration, endpoints, and auth workflows.

## Configuration

- Customers authentication configuration is located in `src/auth.customers.config.ts` and its handlers are setup in `src/auth.customers.ts`.
- Admins authentication configuration is located in `src/auth.admins.config.ts` and its handlers are setup in `src/auth.admins.ts`.
- In the Payload CMS configuration (`src/payload.config.ts`) we have two separate `payload-authjs` plugins, one for each collection.

## Setup

1. Rename the `.env.example` file to `.env` and update the values with your secrets
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`
