

## Plan: Add Social Media Links to Properties

### Overview
Add a section for social media links (Instagram, Facebook, Airbnb, etc.) in the property form, and display them as clickable icons on the PropertyCard and PropertyDetails pages.

### 1. Database Migration
Add new columns to the `properties` table:

```sql
ALTER TABLE public.properties
  ADD COLUMN link_instagram text DEFAULT NULL,
  ADD COLUMN link_facebook text DEFAULT NULL,
  ADD COLUMN link_airbnb text DEFAULT NULL,
  ADD COLUMN link_booking text DEFAULT NULL,
  ADD COLUMN link_website text DEFAULT NULL;
```

### 2. Update TypeScript Types (`src/types/property.ts`)
Add the 5 link fields to the `Property` interface and `PropertyFormData` interface, all as optional/nullable strings.

### 3. Update Property Form (`src/components/properties/PropertyForm.tsx`)
- Add the link fields to `defaultFormData`
- Add a new section inside the "features" tab (or a new "Links" subsection) with labeled inputs for each social network, each with the appropriate icon (Instagram, Facebook, Globe for Airbnb/Booking/Website)
- Wire up form state and submission

### 4. Update Property Hook (`src/hooks/useProperties.ts`)
Include the new link fields in `createProperty`, `updateProperty`, and `duplicateProperty` mutations.

### 5. Update Property Card (`src/components/properties/PropertyCard.tsx`)
Below the address or features row, show small clickable social media icons for any links that are filled. Each icon opens the link in a new tab (`target="_blank"`). Click event uses `stopPropagation` to avoid triggering the card click.

### 6. Update Property Details (`src/pages/PropertyDetails.tsx`)
Add a "Redes Sociais" section showing the social links as clickable icon+label rows that open in a new tab.

### Files to modify:
- **Database migration**: Add 5 text columns to `properties`
- **`src/types/property.ts`**: Add link fields to interfaces
- **`src/components/properties/PropertyForm.tsx`**: Add link inputs section
- **`src/hooks/useProperties.ts`**: Include links in create/update/duplicate
- **`src/components/properties/PropertyCard.tsx`**: Show clickable social icons
- **`src/pages/PropertyDetails.tsx`**: Show social links section

