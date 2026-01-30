# AR Close Automation Prototype

Interactive mockup for an AI-powered AR (Accounts Receivable) Close Automation tool for QuickBooks Online.

## Overview

This prototype demonstrates a comprehensive AR close workflow that helps accountants automate the month-end close process by:

- **Payment Matching** - AI-powered matching of payments to invoices with confidence scoring
- **Gap Analysis** - Compare QBO against external sources (Stripe, Gmail, uploaded spreadsheets)
- **Rules-Based Adjustments** - SOP-driven netting, write-offs, and balance clearing
- **External Reconciliation** - Tie-out QBO AR to all external data sources

## Features

### Run Setup
- QuickBooks OAuth connection
- Entity and AR account selection (multi-select)
- SOP adjustment rules review
- Asset validation with spreadsheet upload simulation
- Execution plan approval

### Data Sources
- QuickBooks Online (AR Aging, Open Invoices, Payments)
- Stripe Billing Register
- Bank Feed (Chase)
- Gmail (parsed invoices and payment confirmations)
- Uploaded Transaction Spreadsheet

### Payment Matching
- Tiered matching (Exact, High, Medium, Low confidence)
- Multi-invoice batch matching
- Partial payment with write-off handling
- Expandable transaction details with artifact links

### Adjustments
- AR/AP Netting for dual-role entities
- Bad debt write-offs (automated and approval-required)
- Small balance clearing
- Full journal entry previews

### Reconciliation & Tie-Out
- QBO vs Stripe reconciliation
- QBO vs Bank Activity
- QBO vs Gmail (parsed invoices)
- QBO vs Uploaded Spreadsheet
- Exception reporting
- Full audit trail

## Files

- `ar-close-full-mockup.html` - Main comprehensive mockup (all 6 phases)
- `ar-close-automation-mockup.jsx` - React component version
- `ar-close-automation-preview.html` - Earlier preview version

## Usage

Open `ar-close-full-mockup.html` in any modern browser to interact with the prototype.

## Tech Stack

- React 18 (via CDN)
- Babel (in-browser transpilation)
- Inline CSS (QuickBooks-inspired design system)

## Design

- QuickBooks-inspired color palette (green primary, blue secondary)
- Card-based layouts with expandable sections
- Badge components for status indicators
- Mid-fidelity interactive prototype

---

Built with Claude

