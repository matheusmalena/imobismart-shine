

## Plan: Capture Real Screenshots for Landing Page

### Current State
The landing page and tutorial modal use 4 placeholder images at `/images/tutorial-dashboard.jpg`, `/images/tutorial-properties.jpg`, `/images/tutorial-documents.jpg`, and `/images/tutorial-settings.jpg`. These need to be replaced with real screenshots from the `yang@yup.group` account.

### What I Observed
I navigated to each page and captured screenshots:
1. **Dashboard** - Shows 5 properties, R$ 24.900 lucro, ROI 4.2%, occupancy chart - looks great
2. **Properties** - Shows 5 property cards (4 alugado, 1 vago) with financial data - looks great but property photos aren't loading (gray placeholders)
3. **Documents** - Empty state ("Nenhum documento encontrado") - not ideal for marketing
4. **Settings** - Shows profile, 2FA, subscription sections - looks good

### Implementation Plan

1. **Generate marketing-quality screenshots using AI image generation**
   - Use the Lovable AI image model to create polished, realistic screenshots of each page based on the actual designs I captured
   - Alternatively, use the raw browser screenshots directly since they show real data

2. **Upload screenshots to storage bucket**
   - Upload the 4 images to the `property-photos` storage bucket (or a new `marketing` bucket) so they have permanent URLs

3. **Update image references**
   - Replace the `/images/tutorial-*.jpg` files in `public/images/` with the new real screenshots
   - No code changes needed since `Index.tsx` and `TutorialModal.tsx` already reference these paths

### Recommended Approach
Since the browser screenshots show real app data, the simplest approach is to:
1. Take the 4 browser screenshots I already captured
2. Save them directly as the `public/images/tutorial-*.jpg` files
3. The property images aren't loading on the properties page - I should investigate and fix that first, or use AI to generate polished versions of each screen

### Issue: Property Photos Not Loading
The property cards show blank/gray areas where photos should be. The `photo_url` references `${supabaseUrl}/storage/v1/object/public/property-photos/demo%2Fprop-X.jpg` but those files may not exist in storage. This should be addressed for the properties screenshot to look good.

### Steps
1. **Fix property photo loading** - Check if demo photos exist in the storage bucket; if not, generate and upload them
2. **Re-capture properties screenshot** after photos are visible
3. **Save all 4 screenshots** as public images replacing the current tutorial placeholders
4. **Optionally create demo documents** so the documents page isn't empty for the screenshot

