# Book Order Component Refactoring

## Overview

The `book-order.tsx` component has been refactored into a modular, maintainable, and performant architecture by extracting logic into custom hooks, breaking down UI into reusable components, and separating utilities and types.

## Structure

### 📁 Types (`/types/booking.types.ts`)

Centralized TypeScript interfaces and types:

- `BookingFormData` - Form state shape
- `Coordinates` - Latitude/longitude data
- `DefaultAddress` - User's default address structure
- `CalculatePriceParams` - Price calculation parameters
- `CreateOrderParams` - Order creation parameters
- `LocationContext` - "pickup" | "dropoff" type

### 🎣 Custom Hooks

#### `/hooks/use-booking-form.hook.ts`

Manages all booking form state and actions:

- `useBookingForm()` - Form data, coordinates, booking status
- `useBookingAnimations()` - Entrance and price animations

**Key Features:**

- Encapsulated state management
- Memoized update functions
- Clean state reset capability
- Animation lifecycle management

#### `/hooks/use-price-calculation.hook.ts`

Handles automatic price calculation:

- `usePriceCalculation()` - Calculates price when coordinates change
- Auto-recalculates on urgency changes
- Error handling with user alerts
- Loading state management

**Key Features:**

- Automatic calculation on dependency changes
- Debounced API calls through useEffect
- Callback support for animation triggers

#### `/hooks/use-urgency-modal.hook.ts`

Manages urgency fee modal state:

- `useUrgencyModal()` - Modal visibility, input, percentage selection
- Fee calculation from percentage or custom input
- State reset on modal close

**Key Features:**

- Percentage quick-select logic
- Custom amount validation
- Clean separation of modal concerns

### 🧩 Components (`/components/booking/`)

All components are memoized with `React.memo` for optimal performance.

#### `LocationInputSection.tsx`

Reusable location input with default address support:

- Pickup and drop-off inputs
- Clear buttons
- Default address quick-select
- Visual connector between inputs

#### `UrgentToggle.tsx`

Toggle switch for urgent delivery:

- Disabled state when locations not set
- Fee display when active
- Accessible toggle interaction

#### `NoteSection.tsx`

Optional note input for riders:

- Multiline text input
- Clean section styling

#### `PriceFooter.tsx`

Fixed footer with price and booking button:

- Price display with loading state
- Book button with disabled state
- Booking in-progress indicator

#### `UrgencyModal.tsx`

Modal for setting urgency fee:

- Percentage quick-select (5%, 10%, 15%)
- Custom amount input
- Validation and confirmation

#### `BookingOverlay.tsx`

Full-screen overlay during booking:

- Loading indicator
- User feedback message

### 🛠️ Utilities (`/utils/booking.utils.ts`)

Pure utility functions:

- `coordsEqual()` - Compare coordinates with epsilon tolerance
- `nameEqual()` - Case-insensitive name comparison
- `isValidDefaultAddress()` - Type guard for address validation
- `canSubmitBooking()` - Validation for booking submission

## Benefits

### 🎯 Maintainability

- **Single Responsibility**: Each file has one clear purpose
- **Easy Testing**: Pure functions and isolated hooks
- **Clear Dependencies**: Explicit imports show relationships

### ⚡ Performance

- **React.memo**: Components only re-render when props change
- **useCallback**: Prevents unnecessary function recreation
- **Optimized Effects**: Dependencies properly tracked

### ♻️ Reusability

- **Composable Components**: Can be used in other booking flows
- **Portable Hooks**: Logic can be shared across features
- **Generic Utilities**: Location comparison logic reusable

### 📖 Readability

- **Less Code Per File**: Main component reduced from 900+ to ~350 lines
- **Named Exports**: Clear intent in imports
- **TypeScript**: Strong typing catches errors early

## Usage Example

```tsx
import { useBookingForm } from "@/hooks/use-booking-form.hook";
import { usePriceCalculation } from "@/hooks/use-price-calculation.hook";
import { LocationInputSection } from "@/components/booking";

function MyBookingComponent() {
  const { formData, pickupCoords, updateField } = useBookingForm();
  const { calculatedPrice, isCalculating } = usePriceCalculation(
    pickupCoords,
    dropoffCoords,
    formData.isUrgent,
    formData.urgencyFee
  );

  return (
    <LocationInputSection
      pickupLocation={formData.pickupLocation}
      dropoffLocation={formData.dropOffLocation}
      onClearPickup={clearPickup}
      onClearDropoff={clearDropoff}
    />
  );
}
```

## Migration Notes

### Before

- 900+ lines in one file
- Mixed concerns (UI, logic, validation)
- Hard to test individual features
- Difficult to reuse components

### After

- Main component: ~350 lines
- Separated: 3 hooks, 6 components, 1 utils file, 1 types file
- Each file < 250 lines
- Easy to test and reuse
- Clear separation of concerns

## Future Enhancements

1. **Error Boundaries**: Add error boundaries around major sections
2. **Loading Skeletons**: Replace spinners with skeleton screens
3. **Form Validation**: Extract validation into Yup/Zod schema
4. **Analytics**: Track user interactions in hooks
5. **Accessibility**: Add more ARIA labels and screen reader support
