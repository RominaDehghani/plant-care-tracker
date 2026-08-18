# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is the developer themself, presenting this as an educational portfolio/coursework demo (a "Web Geliştirme; Yapay Zeka Proje Yönergesi" bootcamp assignment) to an instructor/reviewer and to future employers browsing the portfolio. The interface should read as a real, coherent consumer product — the coursework framing stays background context, not something the UI announces.

## Product Purpose

Bitki Bakım Takipçisi (Plant Care Tracker) lets someone log the houseplants they own and see, at a glance, which ones need watering. It exists to demonstrate a complete CRUD flow (add/list/update/delete) built with Next.js + Tailwind, backed by `localStorage` (no backend). Success is a reviewer immediately understanding the watering-status concept and a visitor being able to add, water, edit, and remove a plant without friction.

## Positioning

Scoped deliberately narrow: this is a single-purpose watering tracker, not a general plant-care or gardening app. The mechanism a neighboring generic "notes app" or "todo app" could not truthfully copy is the derived watering-status logic (last watered date + watering interval → overdue/soon/ok), which is the whole reason the app exists rather than being a reskinned todo list.

## Operating Context

- Single-page-per-action flow: home page lists plants, `/plants/new` adds one, `/plants/[id]/edit` edits one.
- No accounts, no server, no sync — all data lives in the visitor's own browser `localStorage`. Clearing browser storage or switching devices loses the data; this is accepted, not a bug to design around.
- Deployment target is Vercel; source lives in a public GitHub repo (assignment requirement).

## Capabilities and Constraints

- Confirmed CRUD scope: Ekle (add), Listele (list), Güncelle (update — full edit form, plus a one-tap "Sulandı" quick action that sets last-watered to today), Sil (delete, with confirmation).
- Care tracking is watering-only by deliberate scope decision. Sunlight need (az/orta/çok) is recorded per plant as descriptive metadata but is not itself a tracked "due" schedule — only watering drives the status badge. Sunlight/fertilizing schedules are explicitly out of scope, not a "future phase" to design placeholder affordances for.
- Data model per plant: name, species, watering interval (days), last watered date, sunlight need, optional notes.
- Turkish-language UI (all copy, labels, and this document's product facts are in the app's actual language where quoted).
- Tech constraints already decided (existing codebase, not open): Next.js App Router + TypeScript, Tailwind CSS v4, `lucide-react` for icons, `framer-motion` for the seed-to-plant modal and stem-growth motion.

## Brand Commitments

Product name is "Bitki Bakım Takipçisi." No logo beyond a `lucide-react` leaf mark currently in the header.

**Confirmed visual anti-reference:** an earlier pass with a plain card-grid list and a generic centered white modal was explicitly rejected as looking like a generic AI dashboard / "bank login" screen. The visual system was replaced with a garden-bed metaphor (soil, roots, plants growing in planted order, a modal that grows from the point tapped) — see `DESIGN.md`. Do not regress toward the rejected card-grid/plain-modal look.

## Evidence on Hand

No real user testimonials, case studies, or usage data exist or should be fabricated — this is a coursework demo with invented sample plants (e.g., "Salon Ficusu," "Mutfak Nane Saksisi") used only to populate screenshots during development.

## Product Principles

1. The watering-status derivation (overdue/soon/ok) is the product's one real mechanism — every surface decision should keep it legible at a glance, not bury it under decoration.
2. Stay honest about scope: this is a watering tracker, not a full plant-care suite. Do not add UI affordances implying capabilities (accounts, sync, other care types) that do not exist.
3. Because there is no backend, the experience must feel trustworthy and complete on `localStorage` alone — no dead links to unimplemented sync/export features.
4. Built to read as a real, polished consumer product for portfolio purposes, not as a visibly "student project" artifact.
