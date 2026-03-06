

## Plan: Fix Landing Page Issues

### Problems Identified
1. **Duplicate metrics**: Hero floating badges show "ROI Médio 12.5%" and "Ocupação 94%" which duplicate data already visible in the dashboard screenshot itself
2. **Ugly social proof cards**: The 200+, 500+, 99.9%, 4.9★ cards are oversized and plain
3. **Non-real screenshots**: The `.png` images in `/images/` are screenshots of CSS mockups (from `ScreenMockups.tsx`), not real screenshots of the running system. The hero image `tutorial-dashboard-hero.png` shows a mockup with browser dots, fake data, and CSS-rendered UI

### Changes

**1. Remove duplicate floating badges** (`src/pages/Index.tsx`)
- Delete the two floating badge divs (ROI Médio + Ocupação) from the hero section since they duplicate info already visible in the screenshot

**2. Redesign social proof cards** (`src/pages/Index.tsx`)
- Make them more compact and elegant: smaller font sizes, horizontal layout with icon+number+label in a single row, subtle gradient background instead of plain white cards
- Reduce the huge `text-5xl` numbers to `text-2xl/3xl` for a cleaner look

**3. Capture real screenshots** 
- Navigate to the actual `/dashboard`, `/properties`, `/documents`, and `/settings` pages in the browser
- Take screenshots of each page
- The user will need to replace the image files in `public/images/` with these real screenshots. I will note this as a manual step since I cannot write image files

**4. Use `.jpg` fallbacks where available** (`src/pages/Index.tsx`)
- The project has both `.jpg` and `.png` versions for some images. Check if the `.jpg` versions are real screenshots and switch to those if they are

### Files to edit
- `src/pages/Index.tsx` - Remove floating badges, redesign social proof cards

