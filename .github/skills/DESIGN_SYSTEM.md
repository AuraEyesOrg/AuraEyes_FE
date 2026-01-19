# AURA Design System - Color Usage Guide

## 🎨 Color Palette

### Primary Brand Color
- **Cyan/Teal**: `#13ECEC` - Main brand color for buttons, accents, and key UI elements

### Supporting Colors
- **Dark**: `#1A202C` - Headers, dark backgrounds
- **Soft Cyan**: `#F0FDFA` - Light backgrounds, hover states
- **Text Main**: `#2D3748` - Primary text
- **Text Muted**: `#718096` - Secondary text
- **Medical BG**: `#F7FAFC` - Page background
- **Border**: `#E2E8F0` - Borders and dividers

## ✅ Correct Usage - CSS Variables

### In Tailwind Classes (Recommended)
```tsx
// ✅ GOOD - Using CSS variables
<div className="bg-[var(--color-brand-primary)]">
<div className="text-[var(--color-brand-primary)]">
<div className="border-[var(--color-brand-primary)]">

// Or use utility classes
<div className="bg-brand text-white">
<div className="text-brand">
<div className="border-brand">
```

### In Inline Styles
```tsx
// ✅ GOOD - Using CSS variables
<div style={{ 
  background: 'var(--color-brand-primary)',
  color: 'var(--color-brand-primary)'
}}>

// For gradients
<div style={{ 
  background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, #0EA5A5 100%)'
}}>
```

## ❌ Incorrect Usage - Hardcoded Colors

```tsx
// ❌ BAD - Hardcoded hex values
<div className="bg-[#13ECEC]">        // Don't do this!
<div className="text-[#13ECEC]">      // Don't do this!
<div className="border-[#13ECEC]">    // Don't do this!

// ❌ BAD - Hardcoded in inline styles
<div style={{ background: '#13ECEC' }}>  // Don't do this!
```

## 🛠️ Utility Classes Available

### Backgrounds
```tsx
.bg-brand          // Background: Cyan (#13ECEC)
.bg-brand-soft     // Background: Light Cyan (#F0FDFA)
.gradient-brand    // Gradient: Cyan to Teal
.gradient-dark     // Gradient: Dark gray tones
```

### Text Colors
```tsx
.text-brand        // Text: Cyan (#13ECEC)
```

### Borders
```tsx
.border-brand      // Border: Cyan (#13ECEC)
```

### Shadows
```tsx
.shadow-brand      // Cyan shadow (subtle)
.shadow-brand-lg   // Cyan shadow (prominent)
```

### Buttons
```tsx
.btn-primary       // Primary button (Cyan background)
.btn-secondary     // Secondary button (Cyan border)
```

### Badges
```tsx
.badge-risk-low    // Low risk (Cyan)
.badge-risk-medium // Medium risk (Orange)
.badge-risk-high   // High risk (Red)
```

## 📋 Common Patterns

### Buttons
```tsx
// Primary Action
<button className="btn-primary">
  Get Started
</button>

// Secondary Action
<button className="btn-secondary">
  Learn More
</button>

// Custom with CSS variable
<button className="bg-[var(--color-brand-primary)] text-white px-6 py-3 rounded-lg hover:brightness-110">
  Click Me
</button>
```

### Cards with Brand Accent
```tsx
<div className="medical-card hover:border-brand">
  <div className="text-brand font-bold">Card Title</div>
  <p className="text-[var(--color-text-muted)]">Description</p>
</div>
```

### Status Indicators
```tsx
<span className="badge-risk-low">Low Risk</span>
<span className="badge-risk-medium">Medium</span>
<span className="badge-risk-high">High Risk</span>
```

### Icons with Brand Color
```tsx
<svg className="text-brand w-6 h-6">
  {/* SVG paths */}
</svg>
```

## 🔄 Migration Guide

If you have hardcoded colors, replace them:

```tsx
// Before (❌)
className="bg-[#13ECEC]"
className="text-[#13ECEC]"
className="border-[#13ECEC]/30"

// After (✅)
className="bg-[var(--color-brand-primary)]"
className="text-[var(--color-brand-primary)]"
className="border-[var(--color-brand-primary)]/30"

// Or use utility classes (✅)
className="bg-brand"
className="text-brand"
className="border-brand opacity-30"
```

## 💡 Why Use CSS Variables?

1. **Single Source of Truth**: Change color once in `index.css`, updates everywhere
2. **Theme Support**: Easy to add dark mode or alternative themes
3. **Maintainability**: No need to search/replace across multiple files
4. **Consistency**: Ensures all components use exact same colors

## 📁 File Locations

- **CSS Variables**: `src/index.css` (in `@theme` block)
- **Utility Classes**: `src/index.css` (in `@layer components` block)
- **This Guide**: `DESIGN_SYSTEM.md`

## 🎯 Quick Reference

| Need | Use This |
|------|----------|
| Primary button | `btn-primary` |
| Secondary button | `btn-secondary` |
| Brand color bg | `bg-[var(--color-brand-primary)]` or `bg-brand` |
| Brand color text | `text-[var(--color-brand-primary)]` or `text-brand` |
| Brand color border | `border-[var(--color-brand-primary)]` or `border-brand` |
| Light cyan bg | `bg-[var(--color-brand-soft)]` or `bg-brand-soft` |
| Card component | `medical-card` |
| Status badge | `badge-risk-low/medium/high` |

---

**Remember**: Always use CSS variables or utility classes. Never hardcode `#13ECEC` directly! 🎨
