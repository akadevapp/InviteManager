# Invite Manager

A local-first event invitation manager. Create an event, pull guests in from
your contact book, send each of them a bespoke RSVP link through a
ready-made template, and watch responses (and notifications) roll in — all
without a backend. Every piece of data lives in the browser's `localStorage`.

## Features

- **Events** — create, edit, and delete events with a title, description,
  date/time, location (or "virtual"), host name, and a color/emoji accent.
- **Contacts** — a simple address book. Add people one at a time, or import
  a batch by uploading a CSV file or pasting rows (`name, email, phone`).
- **Ready-made templates** — eight invite templates (birthday, wedding,
  corporate, baby shower, holiday, casual hangout, webinar, graduation),
  each with placeholder tokens (`{{guestName}}`, `{{eventDate}}`,
  `{{rsvpLink}}`, …) you can edit before sending.
- **Bespoke invite links** — every guest gets their own unique, unguessable
  RSVP URL. Send it via copy-link, email, SMS, WhatsApp, or the native Web
  Share sheet; every send is timestamped and logged per guest.
- **Guest tracking** — a per-event table shows who's been sent an invite,
  when, through which channel, whether they've opened it, and how they
  responded (Yes / No / Maybe, plus optional party size and a note).
- **RSVP page** — the link opens a standalone page (no login) where the
  guest sees the event details and the host's message, and taps a response.
  They can come back later and change their answer.
- **Notifications** — an in-app notification center (with unread badges)
  logs every RSVP as it comes in, and can also raise a native desktop
  notification via the browser's Notification API.
- **Local-only storage** — no server, no account, no network calls. Export
  a full JSON backup or restore one from Settings, since clearing browser
  data would otherwise erase everything.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## How it works (and why)

This app deliberately has **no backend** — every event, contact, and
invite is read from and written to `localStorage` through a small
[zustand](https://github.com/pmndrs/zustand) store per entity
(`src/store/`). That keeps the app simple to run anywhere, but it comes
with one real consequence worth understanding:

> **An RSVP link only works in the same browser (and browser profile) it
> was created in**, because that's the only place the invite record
> exists. Opening the link in a different browser, a different device, or
> an incognito window won't find the invite.

For a real demo, open the app, create an event and send an invite, then
**copy the RSVP link and open it in a new tab of the same browser** — that
new tab is a stand-in for "the guest," and it shares the same
`localStorage`, so the whole flow (viewing the invite, responding, and the
organizer's tab updating live) works end to end.

That live update is the other interesting bit: two tabs on the same origin
each hold their own copy of the data in memory, but the browser fires a
[`storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
in *other* tabs whenever `localStorage` changes. `src/lib/crossTabSync.ts`
listens for that and rehydrates the affected store, so when a guest
submits an RSVP in one tab, the organizer's dashboard, guest table, and
notification bell update in the other tab **without a refresh** — no
polling, no backend, no websockets.

If this ever needed to support real cross-device use, the fix is to swap
what's behind the store actions (`src/store/*.ts`) for API calls — the
rest of the app (components, routing, message rendering) doesn't know or
care where the data comes from.

A couple of smaller decisions worth noting:

- Routing uses a **hash router** (`/#/rsvp/:token`) rather than browser
  history, so a bespoke link keeps working no matter how (or whether) the
  static build ends up behind server-side rewrites.
- An invite's token is generated **before** the invite is saved, so the
  compose flow can show a live preview of the guest's actual final message
  and link, not a placeholder.

## Project structure

```
src/
  types/            Shared TypeScript types (Event, Contact, Invite, …)
  store/            zustand stores — one per entity, persisted to localStorage
  lib/               Framework-free helpers: id/token generation, CSV parsing,
                     share-link builders, message placeholder rendering, etc.
  data/              Static data: invite templates, event emoji picker, sample data
  components/
    ui/              Small design-system primitives (Button, Modal, Field, Toast, …)
    layout/          App shell, sidebar, notification bell
    events/          Event card, create/edit form, RSVP breakdown bar
    contacts/        Contact list form, CSV import, multi-select picker
    invites/         Template picker, composer wizard, send-channel menu, guest table
    rsvp/            (guest-facing pieces live in pages/RsvpPage.tsx)
  pages/             Route-level screens (Dashboard, Events, Event detail, Contacts,
                     Settings, the public RSVP page, 404)
```

## Tech stack

React 19 + TypeScript + Vite, Tailwind CSS v4, React Router (hash mode),
zustand (with the `persist` middleware backing `localStorage`), and
`lucide-react` for icons. No backend, no database — see above.
