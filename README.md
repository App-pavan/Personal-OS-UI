# Zenith OS

Project Overview

Design and build a next-generation Personal Operating System (Personal OS) that feels like a premium Apple-designed application, combining the elegance of Apple Home, Notion, Arc Browser, Linear, Raycast, and modern luxury fintech apps.

This is not a collection of separate apps. It is a unified ecosystem where every feature (Tasks, Finance, Documents, Password Manager, NAS, Family, Projects, AI Assistant, Calendar, etc.) exists as a module inside one platform.

The platform must be designed from the ground up for:

 Mobile

 Tablet

 Desktop

 Web

using a responsive adaptive design system, not separate designs.

Overall Design Philosophy

The design language should feel:

 Ultra Premium

 Modern

 Minimal

 Elegant

 Calm

 Luxurious

 Highly polished

 Content-first

 Smooth

 Spacious

Imagine if Apple designed Notion, combined with Arc Browser, Apple Home, and a luxury fintech dashboard.

Every interaction should feel intentional.

Avoid looking like generic SaaS dashboards.

Avoid Material Design appearance.

Avoid Bootstrap style.

Avoid boxed enterprise UI.

Avoid heavy borders.

Avoid visual clutter.

Design Inspiration

Take inspiration from:

 Apple Home

 Apple Wallet

 Apple Health

 Apple Music

 Apple Photos

 Arc Browser

 Linear

 Notion

 Raycast

 Craft Docs

 Superhuman

 Things 3

 CleanShot X

 Mercury Weather

 One Password

 Ivory

 Cron Calendar

Use the attached UI image only as inspiration for:

 premium gradients

 glowing lighting

 depth

 luxury feeling

 floating cards

 immersive layout

Do not copy it directly.

Platform Concept

Personal OS consists of modules.

Example modules:

Dashboard

AI Assistant

Tasks

Projects

Finance

Documents

Knowledge

Calendar

Notes

Password Manager

NAS

Media

Recipes

Shopping

Health

Travel

Family

Home Automation

Settings

Each module should feel like a native part of the ecosystem.

Everything shares one design system.

Design System

Create a reusable design system.

Include:

Typography

Spacing

Corner radius

Elevation

Iconography

Buttons

Cards

Inputs

Sheets

Dialogs

Navigation

Charts

Lists

Tables

Status indicators

Notification components

Badges

AI message components

Command palette

Quick actions

Floating panels

Create reusable tokens.

Never hardcode styles.

Theme System

Support both themes from day one.

Default theme:

Light

Secondary:

Dark

The entire system must support instant theme switching.

Every component should have both light and dark variants.

Never design light first and dark later.

Both must feel equally polished.

Colors

Use neutral colors.

Very soft backgrounds.

Primary accent:

A premium cyan / aqua.

Secondary accent:

Warm orange.

Occasional subtle gradients.

Avoid loud colors.

Success

Warning

Danger

Info

should all be elegant.

Use color only when needed.

Glassmorphism

Use glass effects carefully.

Only for:

Floating controls

Navigation

Music player

Quick settings

Context menus

Never overuse blur.

Maintain readability.

Cards

Cards should feel alive.

Rounded corners

Soft shadows

Layered elevation

Subtle glow

Micro gradients

Depth

Premium spacing

No harsh borders.

Navigation

Mobile:

Bottom navigation

Floating quick action

Gesture friendly

Large touch targets

Tablet:

Adaptive navigation rail

Desktop:

Collapsible sidebar

Command palette

Quick search

Everything must transition smoothly.

Responsiveness

Design mobile-first.

The same codebase should scale naturally to:

Phone

Tablet

Large tablet

Desktop

Ultra-wide

Never simply stretch components.

Layouts should intelligently adapt.

Animations

Every interaction should be animated.

Use spring animations.

Smooth transitions.

Physics-based movement.

Subtle hover effects.

Soft fade transitions.

Animated page changes.

Expandable cards.

Shared element transitions.

Animated charts.

Animated statistics.

Nothing should instantly appear.

Motion should communicate hierarchy.

Keep animations premium and subtle.

Never excessive.

Dashboard

The Dashboard is the heart of Personal OS.

It should display:

Good Morning greeting

AI summary

Today's tasks

Calendar

Upcoming reminders

Finance snapshot

Recent documents

Projects

Family updates

NAS status

Storage

Quick notes

Weather

Recent activity

Pinned modules

Widgets should be movable in future.

Dashboard should never feel crowded.

Module Design

Every module should share the same layout.

Example:

Header

Search

Actions

Content

AI Assistant

Statistics

Timeline

Details

Floating actions

Everything should feel consistent.

AI Integration

AI should be integrated everywhere.

Every screen includes contextual AI.

Examples:

Summarize

Ask AI

Generate

Analyze

Explain

Suggest

Never hide AI in menus.

It should naturally belong in the interface.

Search

Universal search.

Accessible everywhere.

Similar to:

Raycast

Spotlight

Command + K

Should search:

Tasks

Documents

Projects

Files

Finance

Family

Notes

Calendar

Everything.

Typography

Use a modern sans-serif font.

Large headings.

Comfortable reading.

Excellent hierarchy.

Avoid tiny text.

Use generous spacing.

Icons

Use a consistent icon library.

Minimal.

Elegant.

Outlined style.

Filled style only when active.

Forms

Beautiful forms.

Large inputs.

Helpful validation.

Inline suggestions.

Premium dropdowns.

Segmented controls.

Smart date pickers.

Charts

Modern charts.

Rounded bars.

Smooth curves.

Animated loading.

Interactive.

Minimal gridlines.

Elegant tooltips.

Empty States

Never show blank pages.

Every empty state should include:

Illustration

Helpful message

Primary action

Secondary suggestion

Loading States

Use skeleton loading.

Avoid spinners whenever possible.

Use shimmer effects.

Accessibility

Keyboard navigation

Screen reader support

Large touch targets

High contrast

Dynamic font sizes

Accessible color choices

Performance

UI should be optimized for:

60 FPS

Minimal layout shift

Fast transitions

Lazy loading

Component virtualization

Components

Design reusable premium components including:

Navigation

Sidebar

Bottom Navigation

Cards

Statistic Cards

Profile Cards

Charts

Buttons

Floating Buttons

Context Menu

Dropdown

Modal

Bottom Sheet

Toast

Notification

Calendar

Timeline

Task Card

Finance Card

Project Card

AI Chat Bubble

Search Bar

Command Palette

Quick Actions

Media Player

Document Viewer

Password Item

Family Card

Storage Card

NAS Card

Widget Container

Visual Style

Soft gradients

Depth

Ambient lighting

Premium shadows

Glass overlays

Rounded corners

Elegant spacing

Subtle glow

Luxury feel

No visual noise.

Design Goal

The final experience should make users immediately think:

"This feels like an operating system built by Apple for personal life management."

It should feel timeless rather than trendy, prioritizing clarity, smooth interactions, and long-term usability.

Additional Technical Requirements

 Use a responsive design system with reusable design tokens (colors, spacing, typography, radii, shadows).

 Ensure every component is adaptive for phone, tablet, and desktop breakpoints rather than relying on simple scaling.

 Follow an 8-point spacing grid.

 Prefer native-like navigation patterns and gestures on mobile.

 Design every screen to support future modular expansion without redesigning the core layout.

 Keep the interface performant by minimizing unnecessary visual effects while preserving a premium aesthetic.

 Build with consistency so every new module (Finance, NAS, Documents, etc.) automatically inherits the same visual language and interaction patterns.

This prompt gives Lovable enough context to establish a cohesive design system first, making it much easier to expand your Personal OS over time without the UI becoming inconsistent.

all data, features shoudl be working and work with the dummy data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9a5118af-2c03-4dfb-96e4-310da242405d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Netlify deployment

TanStack Start SSR app — **not** a plain Vite SPA.

| Setting | Correct | Wrong |
|---------|---------|-------|
| Publish directory | `dist` | ~~`dist/client`~~ |
| Build command | `bun run build` | — |

`dist/client` is only used inside the Lovable sandbox. Netlify builds use `netlify.toml` in this repo.

Set in Netlify environment:

```
VITE_API_BASE_URL=https://cy6ap710ye.execute-api.ap-south-1.amazonaws.com
```
