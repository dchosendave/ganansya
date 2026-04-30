---
name: Ganansya
description: Mobile-first cash-in, cash-out, and float-management UI for sari-sari stores.
colors:
  paper: 'oklch(1 0 0)'
  ink: 'oklch(0.145 0 0)'
  card-paper: 'oklch(1 0 0)'
  popover-paper: 'oklch(1 0 0)'
  action-ink: 'oklch(0.205 0 0)'
  inverse-paper: 'oklch(0.985 0 0)'
  quiet-paper: 'oklch(0.97 0 0)'
  quiet-ink: 'oklch(0.556 0 0)'
  line: 'oklch(0.922 0 0)'
  field: 'oklch(0.922 0 0)'
  focus-ring: 'oklch(0.708 0 0)'
  danger: 'oklch(0.577 0.245 27.325)'
typography:
  display:
    fontFamily: "'Figtree Variable', sans-serif"
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 'normal'
  headline:
    fontFamily: "'Figtree Variable', sans-serif"
    fontSize: '1.25rem'
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 'normal'
  title:
    fontFamily: "'Figtree Variable', sans-serif"
    fontSize: '1rem'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 'normal'
  body:
    fontFamily: "'Figtree Variable', sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: "'Figtree Variable', sans-serif"
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 'normal'
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  '2xl': '18px'
  '4xl': '26px'
  pill: '999px'
spacing:
  xs: '6px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
components:
  button-primary:
    backgroundColor: '{colors.action-ink}'
    textColor: '{colors.inverse-paper}'
    rounded: '{rounded.pill}'
    padding: '0 1rem'
    height: '3rem'
  button-outline:
    backgroundColor: '{colors.field}'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: '0 1rem'
    height: '2.25rem'
  input-default:
    backgroundColor: '{colors.field}'
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: '0.25rem 0.75rem'
    height: '3rem'
  card-default:
    backgroundColor: '{colors.card-paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.2xl}'
    padding: '1.5rem'
---

# Design System: Ganansya

## 1. Overview

**Creative North Star: "The Store Ledger"**

Ganansya should feel like the clean page of a trusted tindahan ledger: direct, familiar,
and calm enough to use while a customer is waiting. A tindera uses Ganansya on a budget
Android phone at a bright sari-sari store counter, so the default theme is light,
high-contrast, and quiet.

The visual system is neutral-first and task-first. It uses Figtree, rounded controls,
clear borders, and generous tap areas to make money operations feel stable. The current
codebase is built from shadcn-svelte primitives with Tailwind CSS tokens, Hugeicons,
and low-motion state transitions.

This system rejects cluttered pages, complex banking-app patterns, flashy fintech styling,
dense dashboards, crypto-wallet energy, and overloaded POS screens. Minimalism is allowed
only when the current task remains complete.

**Key Characteristics:**

- Mobile-first product UI for store operators before owner/admin density.
- Restrained color strategy: neutral surfaces, blackened action ink, and reserved danger.
- Large rounded controls that feel forgiving on small phones.
- Flat tonal layers at rest, with overlays lifted only when hierarchy requires it.
- Taglish-ready copy that keeps labels short and operational.

## 2. Colors

The palette is paper, ink, and quiet working surfaces; danger is reserved for money-risk
moments and destructive actions.

### Primary

- **Action Ink** (`action-ink`): Used for primary buttons, completed PIN bars, and the
  strongest action state. It should appear only where the user can move money, confirm,
  or proceed.

### Neutral

- **Ledger Paper** (`paper`): The default app background. Keep it plain for readability
  in bright store environments.
- **Ledger Ink** (`ink`): Main text and the strongest foreground value. Use it for amounts,
  labels that matter, and page titles.
- **Card Paper** (`card-paper`): Primary raised surface for forms and grouped operator
  tasks.
- **Quiet Paper** (`quiet-paper`): Secondary surface for chips, helper rows, tabs, and
  low-emphasis groups.
- **Quiet Ink** (`quiet-ink`): Secondary text. Use it for helper copy, captions, and
  non-critical metadata.
- **Ledger Line** (`line`): Borders and separators. It should clarify grouping without
  looking like a table-heavy back office screen.
- **Field Fill** (`field`): Inputs, outline button fill, and compact controls.
- **Focus Ring** (`focus-ring`): Accessibility ring for keyboard and assisted navigation.

### Tertiary

- **Risk Red** (`danger`): Error copy, invalid states, and destructive affordances. It is
  not a decorative accent.

### Named Rules

**The Money First Rule.** The strongest contrast belongs to amounts, confirmations, and
the next safe action.

**The Reserved Red Rule.** Red is for risk: wrong PIN, invalid amount, failed confirmation,
or destructive action. Never use it for decoration.

**The No Literal Extremes Rule.** New work must use OKLCH tokens and must not introduce
literal `#000` or `#fff` values.

## 3. Typography

**Display Font:** Figtree Variable (with sans-serif fallback)  
**Body Font:** Figtree Variable (with sans-serif fallback)  
**Label/Mono Font:** Figtree Variable unless numeric fields later need a tabular variant.

**Character:** Figtree gives Ganansya a warm, readable product voice without looking like
a bank. It is friendly enough for Taglish labels and sturdy enough for money amounts.

### Hierarchy

- **Display** (600, `1.875rem`, `1.2`): Login and main screen titles. Use sparingly.
- **Headline** (500, `1.25rem`, `1.3`): Form titles and prominent section labels.
- **Title** (500, `1rem`, `1.4`): Card headings, compact panels, and grouped controls.
- **Body** (400, `1rem`, `1.5`): Form values and readable helper text. Prose should stay
  within 65 to 75 characters when possible.
- **Label** (500, `0.875rem`, normal letter spacing): Field labels, buttons, tabs, and
  compact actions.
- **Caption** (500, `0.75rem`, normal letter spacing): Small chips such as Cash In,
  Cash Out, and Kita.

### Named Rules

**The Plain Number Rule.** Amounts must be larger, darker, or better positioned than nearby
explanatory text. Do not hide money inside small captions.

**The No Display Labels Rule.** Buttons, form labels, and data labels use the product scale,
not display typography.

## 4. Elevation

Ganansya is flat by default. Depth comes from tonal surfaces, borders, and focused grouping.
Shadows are allowed for floating UI such as dropdowns, overlays, and dialogs, but the main
operator flow should not feel like stacked cards.

### Shadow Vocabulary

- **Surface Low** (`shadow-sm`): Used lightly on the login emblem and login card. Keep it
  subtle enough that the border still carries the structure.
- **Overlay High** (`shadow-2xl`): Used for select popovers and floating menus. Reserve it
  for content that leaves the page flow.

### Named Rules

**The Flat Counter Rule.** The default screen should feel like a clean counter surface.
Lift only the element that is temporarily above the task.

## 5. Components

### Buttons

- **Shape:** Full pill control for primary, outline, secondary, ghost, destructive, and
  link variants (`rounded-4xl`, approximately 26px).
- **Primary:** Action Ink background with Inverse Paper text. Login uses a 48px-tall primary
  button for tap confidence.
- **Hover / Focus:** Hover lightens or darkens the same token family. Focus uses a 3px ring
  from Focus Ring at 50% opacity.
- **Secondary / Ghost / Tertiary:** Secondary and ghost variants are quiet. They should not
  compete with the current money action.
- **Active:** A 1px downward movement is allowed as tactile feedback.

### Chips

- **Style:** Quiet Paper with Ledger Line border, 8px to 10px radius, compact text, and
  centered labels.
- **State:** Use chips for status or quick categories only. Do not turn chips into a dense
  navigation system for the operator flow.

### Cards / Containers

- **Corner Style:** Soft rounded container (`rounded-2xl`, approximately 18px).
- **Background:** Card Paper on Ledger Paper.
- **Shadow Strategy:** Border and ring first, shadow only when a card is the single current
  task surface.
- **Border:** Use Ledger Line or a 10% foreground ring. Avoid colored stripe accents.
- **Internal Padding:** Default cards use 24px horizontal padding. Small cards use 16px.

### Inputs / Fields

- **Style:** Pill fields with Field Fill at 30% opacity, Ledger Line border, 48px height on
  mobile-critical forms.
- **Focus:** Border shifts to Focus Ring and gains a 3px ring. The field should feel
  unmistakably active.
- **Error / Disabled:** Error uses Risk Red with a pale red background. Disabled controls
  use opacity reduction and no pointer interaction.

### Navigation

- **Style:** Tabs use a Quiet Paper pill rail with rounded active triggers. Line tabs may
  use a 2px underline only when the screen already has enough spacing.
- **Typography:** Label scale, medium weight, no decorative casing.
- **Mobile Treatment:** Navigation should stay shallow. One primary action per screen beats
  a crowded app shell for the tindera flow.

### Selects / Popovers

- **Style:** Trigger matches input shape. Popover content uses Popover Paper, a soft 18px
  corner, 1px foreground ring, and high overlay shadow.
- **Items:** Items use 12px to 14px corners, 8px vertical padding, and selected check icons
  from Hugeicons.

### Dialogs

- **Style:** Dialogs are rounded, narrow, and centered. Use them only for confirmation or
  risk decisions that cannot be handled inline.
- **Motion:** 100ms fade and zoom is allowed. Do not choreograph page load.

## 6. Do's and Don'ts

### Do:

- **Do** prioritize tindera mobile screens before owner/admin density.
- **Do** keep tap targets at 48px for primary mobile actions.
- **Do** use Action Ink for the next clear action and Risk Red only for real risk.
- **Do** keep pages minimal while still completing the full workflow.
- **Do** use Taglish labels that can be understood without training-heavy explanation.
- **Do** keep overlays, selects, and dialogs visually familiar so the tool disappears into
  the store task.

### Don't:

- **Don't** create a cluttered app with too many elements competing on one page.
- **Don't** use complex banking-app patterns, flashy fintech styling, dense dashboards,
  crypto-wallet energy, or overloaded POS screens.
- **Don't** use border-left or border-right greater than 1px as a colored accent.
- **Don't** use gradient text, decorative glassmorphism, or hero-metric layouts.
- **Don't** put cards inside cards.
- **Don't** use heavy color or full-saturation accents on inactive states.
- **Don't** use a modal as the first answer when inline confirmation or progressive reveal
  can solve the workflow.
