# Emperia — Design System Reference

> Extracted from the **Emperia Luxury Event Booking** Stitch project (`13519273400391934586`).
> Creative North Star: **"The Obsidian Curator"** — a digital invitation, not a utility.

---

## 1. Color Palette

### Core Tokens

| Token | Hex | Usage |
|---|---|---|
| `--void` | `#131313` | Page background / surface foundation |
| `--surface` | `#131313` | Base-level background |
| `--surface-dim` | `#131313` | Recessed backgrounds |
| `--surface-container-lowest` | `#0e0e0e` | Deepest nesting layer |
| `--surface-container-low` | `#1c1b1b` | Card base layer |
| `--surface-container` | `#201f1f` | Primary content areas |
| `--surface-container-high` | `#2a2a2a` | Elevated cards |
| `--surface-container-highest` | `#353534` | Modals, floating elements |
| `--surface-bright` | `#393939` | Bright surface accents |
| `--surface-variant` | `#353534` | Glassmorphism base (40% opacity + 24px blur) |

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--gold` | `#F2CA50` | Primary brand / CTAs / prestige |
| `--gold-container` | `#D4AF37` | Gradient endpoint for gold CTAs |
| `--gold-on` | `#3C2F00` | Text on gold surfaces |
| `--purple` | `#ECB1FF` | Secondary / interactive highlights |
| `--purple-container` | `#D05BFF` | Energy accents, "after-hours" exclusivity |
| `--blue` | `#BFCDFF` | Tertiary / atmospheric depth |
| `--blue-container` | `#97B0FF` | Soft accent backgrounds |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--on-surface` | `#E5E2E1` | Primary text (NEVER use pure `#FFF`) |
| `--on-surface-variant` | `#D0C5AF` | Secondary/muted text |
| `--outline` | `#99907C` | Visible outlines, ghost borders |
| `--outline-variant` | `#4D4635` | Subtle separators (15% opacity for inputs) |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--error` | `#FFB4AB` | Error text |
| `--error-container` | `#93000A` | Error backgrounds |
| `--danger` | `#EF4444` | Destructive actions |

---

## 2. Typography

### Font Stack

| Role | Font | Weight Range |
|---|---|---|
| **Display / Headline** | `Noto Serif` | 400–700 |
| **Body / Label / UI** | `Manrope` | 300–700 |

### Type Scale (Tailwind Mapping)

| Token | Size | Tracking | Font | Usage |
|---|---|---|---|---|
| `display-lg` | `72px` / `text-7xl` | `-0.02em` | Noto Serif | Hero headlines |
| `display-md` | `57px` / `text-6xl` | `-0.02em` | Noto Serif | Section heroes |
| `headline-lg` | `36px` / `text-4xl` | `-0.01em` | Noto Serif | Section titles |
| `headline-md` | `28px` / `text-3xl` | `0` | Noto Serif | Sub-section titles |
| `title-lg` | `22px` / `text-xl` | `0` | Manrope | Card titles |
| `title-md` | `16px` / `text-base` | `0.01em` | Manrope | Subsection / bold body |
| `body-lg` | `16px` / `text-base` | `0.03em` | Manrope | Primary body copy |
| `body-md` | `14px` / `text-sm` | `0.03em` | Manrope | Secondary body |
| `body-sm` | `12px` / `text-xs` | `0.05em` | Manrope | Captions, fine print |
| `label-lg` | `14px` / `text-sm` | `0.05em` | Manrope UPPERCASE | Category tags, badges |
| `label-md` | `12px` / `text-xs` | `0.08em` | Manrope UPPERCASE | Status labels |

---

## 3. Elevation & Depth

### The "No-Line" Rule
**Borders are prohibited for sectioning.** Structural separation uses:
1. **Tonal shifts** — transitioning between surface layers
2. **Negative space** — generous padding (double what feels "enough")
3. **Luminance** — subtle gradient glow at section edges

### Shadow System

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-luxe` | `0px 24px 48px rgba(0,0,0,0.5), 0px 4px 12px rgba(191,0,255,0.08)` | Cards, modals (purple soul in shadow) |
| `shadow-glow-gold` | `0 0 30px rgba(242,202,80,0.15)` | Gold CTA hover glow |
| `shadow-glow-purple` | `0 0 20px rgba(208,91,255,0.2)` | Interactive element hover |

### Ghost Border
When borders are required (accessibility on inputs):
- `1px solid rgba(77, 70, 53, 0.15)` — felt, not seen.

---

## 4. Component Patterns

### Buttons

| Variant | Style |
|---|---|
| **Primary (Gold Standard)** | `bg-gradient-to-br from-[#F2CA50] to-[#D4AF37]`, text `#3C2F00`, fully rounded, no border |
| **Secondary (Electric Ghost)** | Ghost border `outline`, text `--purple`, hover: outer purple glow |
| **Tertiary (Text Link)** | Uppercase `label-md`, 1px gold underline offset 4px |

### Cards
- No borders. Background: `surface-container-low`
- Hover: transition to `surface-container-high` + `shadow-luxe`
- Corner radius: `16px` (`rounded-2xl`)

### Glassmorphism (Navbar / Floating Elements)
```css
background: rgba(53, 53, 52, 0.4);        /* surface-variant at 40% */
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border: 1px solid rgba(77, 70, 53, 0.2);  /* ghost border, light leak on top */
```

### Input Fields
- Bottom border only (ghost border style)
- Focus: bottom border animates to 100% `--gold`, label shifts to `--purple`

---

## 5. Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `space-section` | `120px` (`py-[120px]`) | Between major page sections |
| `space-group` | `64px` (`gap-16`) | Between content groups |
| `space-element` | `32px` (`gap-8`) | Between elements in a group |
| `space-tight` | `16px` (`gap-4`) | Compact spacing |
| `max-content` | `1280px` (`max-w-7xl`) | Content container width |
| `max-narrow` | `768px` (`max-w-3xl`) | Text-heavy sections |

### Layout DNA from Stitch Screens
- **Hero**: Full-viewport with background image/gradient + overlay text
- **Navbar**: Glassmorphic, fixed, with logo left + nav links center + account right
- **Event Grid**: Asymmetric 2-column layout (large featured card + stack of smaller cards)
- **Sections**: Editorial offset — images bleed 20–40px beyond containers
- **Footer**: Minimal — links in a single row, muted text

---

## 6. Motion & Interaction

### Timing Function
All transitions: `cubic-bezier(0.22, 1, 0.36, 1)` ("Power Out" — luxury car glide)

### Transition Defaults
```css
transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
```

### Hover States
- Cards: `translateY(-4px)` + `shadow-luxe` + background tonal shift
- Buttons: scale `1.02` + glow shadow
- Links: gold underline slides in from left

### Page Entries
- Fade up from `translateY(20px)` + `opacity: 0` → `translateY(0)` + `opacity: 1`
- Stagger children by `100ms`

---

## 7. Tailwind Config Tokens

```js
// tailwind.config.ts — extend theme
{
  colors: {
    void: '#131313',
    gold: { DEFAULT: '#F2CA50', container: '#D4AF37', on: '#3C2F00' },
    purple: { DEFAULT: '#ECB1FF', container: '#D05BFF', on: '#520070' },
    blue: { DEFAULT: '#BFCDFF', container: '#97B0FF' },
    surface: {
      DEFAULT: '#131313',
      dim: '#131313',
      bright: '#393939',
      variant: '#353534',
      container: {
        lowest: '#0e0e0e',
        low: '#1c1b1b',
        DEFAULT: '#201f1f',
        high: '#2a2a2a',
        highest: '#353534',
      },
    },
    onSurface: { DEFAULT: '#E5E2E1', variant: '#D0C5AF' },
    outline: { DEFAULT: '#99907C', variant: '#4D4635' },
    error: { DEFAULT: '#FFB4AB', container: '#93000A' },
  },
  fontFamily: {
    serif: ['Noto Serif', 'Georgia', 'serif'],
    sans: ['Manrope', 'system-ui', 'sans-serif'],
  },
  borderRadius: {
    luxe: '16px',
  },
  boxShadow: {
    luxe: '0px 24px 48px rgba(0,0,0,0.5), 0px 4px 12px rgba(191,0,255,0.08)',
    'glow-gold': '0 0 30px rgba(242,202,80,0.15)',
    'glow-purple': '0 0 20px rgba(208,91,255,0.2)',
  },
  transitionTimingFunction: {
    luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
}
```

---

## 8. Screen Inventory (from Stitch)

| Screen | Device | Resolution | ID |
|---|---|---|---|
| Experiences Home | Desktop | 2560×6878 | `28ec8f01b1c641e995bad811cbc275b0` |
| Mobile Home | Mobile | 780×6068 | `495e79dfd103461bb85e69831316e75b` |
| Event Details: The Weeknd | Desktop | 2560×3972 | `57d7addaed9f4055b715730c74d8367d` |
| Mobile Event Details | Mobile | 780×3912 | `823b1f58e47d4607934b100287838b86` |
| Checkout | Desktop | 2560×2762 | `643c3de0f3214869b803e131c77baeb7` |
| Mobile Checkout | Mobile | 780×2790 | `e42a203f6e264c0b96b63801c9157be4` |

---

## 9. Do's and Don'ts

### ✅ Do
- Use extreme scale contrast (72px headline + 12px caption)
- Use "Editorial Offsets" — images overlap containers by 20–40px
- Use `--purple-container` sparingly — only for CTAs and "Live" status
- Double the dark space (padding) wherever it feels "enough"

### ❌ Don't
- Use `1px solid` borders to separate sections
- Use pure `#FFFFFF` for text — use `--on-surface` (#E5E2E1)
- Use standard drop shadows — if it looks default, it's too heavy
- Crowd the layout — ever
