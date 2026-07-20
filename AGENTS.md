# Project Summary: Cemre Park E-Commerce Platform

This file contains the core summary and rules for the Cemre Park web project. **Agents must read and keep this summary in mind during all interactions.**

## Overview

Cemre Park is a modern e-commerce platform serving the fashion and hijab clothing sector. It includes both a customer-facing storefront and a comprehensive admin dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database / ORM**: Prisma (SQLite for development, PostgreSQL for production)
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js
- **UI Components**: SweetAlert2, Swiper, AOS, Recharts
- **Security**: bcrypt for password hashing

## Key Features

- **Frontend**: Homepage with banner management, product listing/details, shopping cart, favorites, user account, contact form, and corporate pages.
- **Admin Panel**: Dashboard, product management, order management, customer management, banner/slider management, page/settings management, and message management.

## Project Structure

- `src/app/`: Next.js App Router (includes `admin/` for the admin panel and `api/` for endpoints).
- `src/components/`: Reusable React components.
- `src/context/`: React context providers.
- `src/data/`, `src/lib/`, `src/utils/`: Helpers, static data, and utility functions.
- `prisma/`: Database schema.

## Agent Instructions

1. Always refer to this summary when making architectural or feature-level decisions.
2. Maintain this file and update the summary whenever significant architectural changes or new core features are added.
3. Prioritize aesthetic, modern web design principles (vibrant colors, smooth gradients, responsive layouts, micro-animations) in all frontend modifications.

## Multi-Agent Development Protocol

This project utilizes a collaborative five-agent workflow to maximize efficiency and code quality. The participating agents are:

- **Pi**: Strategic planning, architecture design, and workflow orchestration.
- **Devin.ai**: Complex feature implementation, full-stack development, and bug fixing.
- **OpenCode**: Codebase analysis, refactoring, and ensuring code quality/standards.
- **Copilot**: Rapid code generation, boilerplate creation, and inline assistance.
- **Cursor**: Context-aware code editing, UI/UX refinement, and real-time pair programming.

**Collaboration Guidelines for Agents:**

- Acknowledge your specific role within this multi-agent system when taking on tasks.
- Ensure clear communication and handoffs; document your changes, thoughts, and reasoning clearly so other agents can seamlessly continue the work.
- Focus on the current high-priority features: AI-driven ChatWidget, one-step checkout, Recharts-based Admin Analytics, and robust security/logging (AuditLog/LoginHistory).
