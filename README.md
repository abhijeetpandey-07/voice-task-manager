# VoiceTask: Voice Note to Actionable Task Manager

> Speak your chaos. Get a prioritized task board.

Built for Cyrus Hack-A-Thon 2026 (Problem Statement 05, Productivity & Assistive Tech) by Team Cosmic Strike.

**Live demo:** https://voice-task-manager-ebon.vercel.app/

## The problem
Voice notes are fast, but organizing them is not. Ideas, deadlines and to-dos pile up in one long ramble, and nothing tells you what is urgent or when it is due.

## Our solution
Tap the mic, talk through your day, and get a prioritized Kanban board.

## Features
- One-tap voice capture with a live transcript (Web Speech API)
- AI extracts tasks, priority and due dates as structured JSON (Google Gemini)
- Drag-and-drop Kanban board (To Do / In Progress / Done)
- Edit or delete tasks, with priority badges and overdue highlighting
- One-click calendar export (.ics) that opens in Google, Apple and Outlook calendars
- Tasks are saved in the browser
- Typed-note fallback and a sample note button if the mic is unavailable

## Tech stack
React, Vite, Tailwind CSS, @hello-pangea/dnd, Google Gemini API, Vercel serverless function

## How it works
1. Record: the user taps the mic and speaks.
2. Transcribe: the Web Speech API converts speech to text.
3. Extract: a serverless function asks the AI for tasks, priority and due dates as JSON.
4. Act: cards land on the Kanban board and can be exported to a calendar.

## Run locally
1. `npm install`
2. Create a `.env` file with `GEMINI_API_KEY=your_key` and `GEMINI_MODEL=gemini-flash-lite-latest`
3. `npm run dev`

Use Chrome or Edge for voice input.

## AI tools used
Built during the 8-hour finale with AI-assisted coding (Claude) for planning, code generation and debugging.

## Team
Abhijeet Pandey (Leader), Milesh Jhoomuck, Yashveer Singh, Desire Musoni