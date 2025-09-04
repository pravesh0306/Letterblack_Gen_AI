# CSS Compatibility Guide

## Cross-Browser Scrollbar Styling

### Issue
The newer CSS properties `scrollbar-width` and `scrollbar-color` are not supported in:
- Chrome < 121
- Safari (all versions)
- Safari on iOS
- Samsung Internet

### Solution
We use a progressive enhancement approach:

1. **Primary**: WebKit scrollbar styling for Chromium-based browsers
2. **Fallback**: Feature detection with `@supports` for Firefox

```css
/* Primary approach - WebKit browsers */
.scrollable-element::-webkit-scrollbar {
  width: 14px;
}

.scrollable-element::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-element::-webkit-scrollbar-thumb {
  background: var(--vscode-border);
  border-radius: 7px;
  border: 3px solid var(--container-bg);
}

/* Fallback for Firefox */
@supports (scrollbar-width: thin) {
  .scrollable-element {
    scrollbar-width: thin;
    scrollbar-color: var(--vscode-border) transparent;
  }
}
```

### Browser Support Matrix

| Browser | Webkit Scrollbar | Modern Scrollbar | Result |
|---------|------------------|------------------|---------|
| Chrome/Edge | ✅ | ✅ (v121+) | Custom scrollbar |
| Firefox | ❌ | ✅ | Custom scrollbar |
| Safari | ✅ | ❌ | Custom scrollbar |
| iOS Safari | ❌ | ❌ | Native scrollbar |

## Inline Styles Elimination

### Issue
Inline styles make maintenance difficult and violate CSP policies.

### Solution
All inline styles moved to external CSS classes:

```css
/* Added utility classes */
.typing-text {
  opacity: 0.7;
}

.ai-typing {
  opacity: 0.7;
  animation: typing-pulse 1.5s ease-in-out infinite;
}
```

## Unique ID Requirements

### Issue
Multiple elements with the same ID cause accessibility and functionality issues.

### Solution
- Main application: `id="chat-input"`
- Reference implementation: `id="reference-chat-input"`

All JavaScript references updated accordingly.

## Best Practices

1. **Feature Detection**: Use `@supports` for progressive enhancement
2. **Fallbacks**: Always provide fallback for unsupported properties
3. **Vendor Prefixes**: Use webkit prefixes for wider browser support
4. **External Styles**: Never use inline styles
5. **Unique IDs**: Ensure all IDs are unique across the document
