# i18n Integration Guide

This guide explains how to integrate internationalization (i18n) into new pages and components in the SmartPick application, based on the translation implementation in the dashboard page ([index.sync.tsx](file:///e:/DELTAX/SmartPick/smartpick-frontend/src/pages/%28main%29/index.sync.tsx)).

## Overview

The application uses:
- **react-i18next** for translation management
- **Nested JSON structure** for organized translation keys
- **Two languages**: English (en) and Vietnamese (vi)
- **Smart font rendering** for proper Vietnamese diacritics display

## Translation File Structure

Translation files are located in `public/locales/{language}/translation.json`:

```
public/
└── locales/
    ├── en/
    │   └── translation.json
    └── vi/
        └── translation.json
```

### Naming Convention

Use a hierarchical structure organized by:
1. **Module/Page** (e.g., `dashboard`, `batches`, `label`)
2. **Section** (e.g., `stats`, `quickActions`, `recentActivity`)
3. **Specific content** (e.g., `title`, `description`, `button`)

**Example structure:**
```json
{
  "common": {
    "defaultName": "there",
    "getStarted": "Get started",
    "seeAll": "View all",
    "greeting": {
      "morning": "Good morning",
      "afternoon": "Good afternoon",
      "evening": "Good evening"
    }
  },
  "dashboard": {
    "welcomeSubtitle": "Here's your labeling activity overview. Keep up the great work!",
    "stats": {
      "labeledToday": "Labeled today",
      "totalLabeled": "Total labeled",
      "avgTime": "Avg. time/image",
      "pendingBatches": "Pending batches"
    },
    "quickActions": {
      "title": "Quick Actions",
      "startLabeling": {
        "title": "Start Labeling",
        "description": "Continue where you left off or start a new batch"
      }
    }
  }
}
```

## Step-by-Step Integration

### 1. Import the Hook

At the top of your component file, import `useTranslation`:

```tsx
import { useTranslation } from 'react-i18next'
```

### 2. Initialize the Hook

Inside your component function, initialize the `useTranslation` hook:

```tsx
export const Component = () => {
  const { t } = useTranslation()
  
  // Rest of your component...
}
```

### 3. Define Translation Keys

Before implementing, plan your translation structure and add keys to both language files:

**English** (`public/locales/en/translation.json`):
```json
{
  "yourPage": {
    "title": "Page Title",
    "description": "Page description"
  }
}
```

**Vietnamese** (`public/locales/vi/translation.json`):
```json
{
  "yourPage": {
    "title": "Tiêu đề trang",
    "description": "Mô tả trang"
  }
}
```

### 4. Use Translation Keys in JSX

Replace hardcoded strings with `t()` function calls:

**Before:**
```tsx
<h1>Good morning, John</h1>
<p>Here's your labeling activity overview.</p>
```

**After:**
```tsx
<h1>{t('common.greeting.morning')}, {user?.name}</h1>
<p>{t('dashboard.welcomeSubtitle')}</p>
```

## Advanced Patterns

### Dynamic Greetings

Use logic to select the appropriate translation key:

```tsx
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return t('common.greeting.morning')
  if (hour < 18) return t('common.greeting.afternoon')
  return t('common.greeting.evening')
}

return <h1>{getGreeting()}, {user?.name?.split(' ')[0] ?? t('common.defaultName')}</h1>
```

### Interpolation (Variables in Translations)

For dynamic content, use interpolation:

**Translation file:**
```json
{
  "dashboard": {
    "cta": {
      "description": "You have {{count}} batches waiting for your review."
    }
  }
}
```

**Component:**
```tsx
<p>{t('dashboard.cta.description', { count: 3 })}</p>
// Output: "You have 3 batches waiting for your review."
```

### Passing Translation to Child Components

If a child component accepts text props, translate before passing:

```tsx
<QuickActionCard
  title={t('dashboard.quickActions.startLabeling.title')}
  description={t('dashboard.quickActions.startLabeling.description')}
  href="/label"
/>
```

### Conditional Translations

For status-based content:

```tsx
{activity.action === 'In progress'
  ? t('dashboard.recentActivity.status.inProgress')
  : t('dashboard.recentActivity.status.completed')}
```

## Best Practices

### ✅ DO

1. **Use nested keys** for better organization:
   ```json
   {
     "dashboard": {
       "stats": {
         "labeledToday": "Labeled today"
       }
     }
   }
   ```

2. **Keep common strings in `common` namespace**:
   ```json
   {
     "common": {
       "getStarted": "Get started",
       "seeAll": "View all"
     }
   }
   ```

3. **Use descriptive key names** that indicate context:
   - ✅ `dashboard.quickActions.startLabeling.title`
   - ❌ `dashboard.card1.text`

4. **Maintain consistent key structure** across all language files

5. **Use interpolation for dynamic content**:
   ```tsx
   t('message', { count: 5, name: 'John' })
   ```

### ❌ DON'T

1. **Don't hardcode text** in JSX:
   ```tsx
   // ❌ Bad
   <h1>Good morning</h1>
   
   // ✅ Good
   <h1>{t('common.greeting.morning')}</h1>
   ```

2. **Don't create overly deep nesting** (max 3-4 levels):
   ```json
   // ❌ Too deep
   {
     "page": {
       "section": {
         "subsection": {
           "component": {
             "element": {
               "text": "value"
             }
           }
         }
       }
     }
   }
   ```

3. **Don't duplicate translation keys**—use the `common` namespace for shared strings

4. **Don't forget to escape special characters** in JSON strings

5. **Don't mix languages** within a single translation file

## Vietnamese Font Considerations

The application is configured to properly render Vietnamese diacritics. Key CSS properties are already set:

```css
body {
  line-height: 1.6; /* Adequate space for diacritics */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

No additional configuration is needed for new pages.

## Testing Your Translations

### 1. Language Switcher

Use the language toggle in the sidebar to switch between English and Vietnamese.

### 2. Visual Check

- Verify all text is translated correctly
- Check Vietnamese diacritics are rendering properly
- Ensure text doesn't overflow containers
- Test with both short and long translations

### 3. Missing Keys

If a translation key is missing, react-i18next will display the key itself (e.g., `"dashboard.stats.labeledToday"`), making it easy to spot issues.

## Common Translation Keys Reference

Use these existing keys when applicable to your page:

```typescript
// Navigation & Actions
t('common.getStarted')     // "Get started"
t('common.seeAll')         // "View all"

// Greetings
t('common.greeting.morning')    // "Good morning"
t('common.greeting.afternoon')  // "Good afternoon"
t('common.greeting.evening')    // "Good evening"

// Fallbacks
t('common.defaultName')    // "there" (for when user name is not available)
```

## Checklist for New Page Integration

- [ ] Import `useTranslation` from `react-i18next`
- [ ] Initialize `const { t } = useTranslation()` in component
- [ ] Plan translation key structure for the page
- [ ] Add all keys to `public/locales/en/translation.json`
- [ ] Add all keys to `public/locales/vi/translation.json`
- [ ] Replace all hardcoded strings with `t('key.path')`
- [ ] Test language switching
- [ ] Verify Vietnamese diacritics render correctly
- [ ] Check for missing translation keys
- [ ] Ensure text layout works with both languages

## Example: Complete Component

Here's a minimal example showing the complete pattern:

```tsx
import { useTranslation } from 'react-i18next'

export const MyPage = () => {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('myPage.title')}</h1>
      <p>{t('myPage.description')}</p>
      
      <button>{t('common.getStarted')}</button>
    </div>
  )
}
```

**Corresponding translation files:**

`en/translation.json`:
```json
{
  "myPage": {
    "title": "My Page",
    "description": "Welcome to my page"
  }
}
```

`vi/translation.json`:
```json
{
  "myPage": {
    "title": "Trang của tôi",
    "description": "Chào mừng đến trang của tôi"
  }
}
```

## Support

For questions or issues with translations:
1. Check the [dashboard implementation](file:///e:/DELTAX/SmartPick/smartpick-frontend/src/pages/%28main%29/index.sync.tsx) for reference
2. Review existing translation files in `public/locales/`
3. Ensure react-i18next configuration in main app file is correct

---

**Last updated:** 2026-01-08
