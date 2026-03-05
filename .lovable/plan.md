

## Plan: Fix Landing Page Images and Animation Performance

### Problem 1: Images Are Not Real Screenshots
The current `/images/tutorial-*.jpg` files are AI-generated images, not actual screenshots of the system. They need to be replaced with real browser screenshots captured from the `yang@yup.group` demo account.

### Problem 2: Animation Lag/Bugs
The landing page (`Index.tsx`) uses **heavy framer-motion animations** everywhere — `whileInView`, `initial`, `animate`, `AnimatePresence`, parallax scroll listeners, and staggered children. This conflicts with the project's own standard (per existing memory) which mandates using the CSS `animate-fade-in` class for transitions instead of framer-motion. The excessive animation wrappers cause visible delays and janky scroll behavior.

---

### Steps

**1. Capture real screenshots from the app**
- Log into the preview with `yang@yup.group` using browser tools
- Navigate to Dashboard, Properties, Documents, and Settings pages
- Take a screenshot of each page
- Save these as the `/images/tutorial-dashboard.jpg`, `tutorial-properties.jpg`, `tutorial-documents.jpg`, `tutorial-settings.jpg` files

**2. Strip framer-motion from the landing page**
- Remove all `motion.div`, `motion.header`, `motion.section` wrappers from `Index.tsx`
- Replace them with plain `div`/`header`/`section` elements using `className="animate-fade-in"` where entry animation is needed
- Remove `AnimatePresence` from the feature tabs section — use a simple conditional render with CSS transitions instead
- Remove the `useParallax` hooks (6 parallax instances creating constant scroll listeners)
- Remove `containerVariants`, `itemVariants`, and all `framer-motion` imports from `Index.tsx`

**3. Apply the same fix to sub-sections**
- `TargetAudienceSection.tsx` — replace `motion` wrappers with `animate-fade-in`
- `TestimonialsSection.tsx` and `FAQSection.tsx` — check and simplify if they also use heavy motion

**4. Keep minimal, performant animations**
- Use `animate-fade-in` CSS class for section entry effects
- Keep the `AnimatedCounter` component (uses `IntersectionObserver`, lightweight)
- Use CSS `transition` for tab switching and hover effects instead of JS-driven animations

### Result
- Real product screenshots on the landing page
- Smooth, instant page rendering without animation delays or jank
- Consistent with the project's animation standard (`animate-fade-in`)

