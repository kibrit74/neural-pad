# Design Document

## Overview

Neural Pad landing page'i, uygulamanın ilk karşılama noktası olarak kullanıcılara ürünü tanıtır ve indirme seçenekleri sunar. Bu tasarım, mevcut WelcomeModal component'ini geliştirerek indirme linklerini güncelleyecek ve kullanıcı deneyimini iyileştirecektir.

Landing page, modern ve responsive bir tasarıma sahip olup, hero section, özellik kartları, ürün ekran görüntüleri slider'ı, indirme bölümü ve footer içerir. Çok dilli destek (TR/EN) ve karanlık tema desteği mevcuttur.

**Yeni Görsel Zenginleştirmeler:**
- Glassmorphism efektleri ile premium görünüm
- 3D transform ve parallax efektleri ile derinlik hissi
- Animasyonlu gradient arka planlar ve blob şekilleri
- İstatistik kartları ile animasyonlu sayaçlar
- Mikroetkileşimler (ripple, hover, scroll animasyonları)
- Gradient text ve glow efektleri ile zengin tipografi

## Architecture

### Component Structure

```
WelcomeModal (Landing Page)
├── Animated Background Layer
│   ├── Gradient Mesh
│   └── Floating Blob Shapes
├── Language Selector (TR/EN)
├── Hero Section
│   ├── Animated Gradient Background
│   ├── Logo (with float animation)
│   ├── Title & Subtitle (with gradient text)
│   ├── Statistics Cards (animated counters)
│   │   ├── Users Count
│   │   ├── Downloads Count
│   │   └── Notes Count
│   └── CTA Button (with ripple effect)
├── Mockups Slider Section
│   ├── Glassmorphism Container
│   │   ├── Browser Chrome
│   │   ├── Image Slides (with parallax)
│   │   └── Captions (with backdrop blur)
│   └── Controls (Prev/Next/Dots)
├── Features Section
│   └── Feature Cards Grid (with scroll animations)
│       ├── AI Writing Assistant (3D hover effect)
│       ├── Image Tools (3D hover effect)
│       ├── Chat Assistant (3D hover effect)
│       ├── Smart Tagging (3D hover effect)
│       ├── Export & Backup (3D hover effect)
│       └── Encrypted Notes (3D hover effect)
├── Download Section
│   └── Platform Buttons (with gradient borders & glow)
│       ├── macOS
│       ├── Windows
│       └── Linux
└── Footer
    ├── Brand Info
    ├── Features List
    └── Contact & Social Links (with hover animations)
```

### Data Flow

1. **Component Mount**: Landing page açıldığında dil tercihi ve slider state initialize edilir
2. **Language Selection**: Kullanıcı dil değiştirdiğinde tüm metinler i18n sistemi üzerinden güncellenir
3. **Slider Auto-play**: 4 saniyede bir otomatik geçiş, hover durumunda duraklatılır
4. **Download Action**: Platform butonuna tıklandığında GitHub release URL'i yeni sekmede açılır
5. **CTA Action**: "Launch Writer" butonuna tıklandığında modal kapanır ve ana uygulama açılır

## Components and Interfaces

### 1. WelcomeModal Component

**Props Interface:**
```typescript
interface LandingPageProps {
    isOpen: boolean;
    onClose: () => void;
}
```

**State Management:**
```typescript
// Slider state
const [current, setCurrent] = useState(0);
const isHoveringRef = useRef(false);

// i18n hooks
const { t } = useTranslations();
const { language, setLanguage } = useLanguage();
```

### 2. DownloadButton Sub-component

**Props Interface:**
```typescript
interface DownloadButtonProps {
    icon: React.ReactElement;
    osName: string;
    downloadUrl?: string;
}
```

**Behavior:**
- Disabled state when downloadUrl is not provided
- Opens URL in new tab (_blank)
- Visual feedback on hover
- Platform-specific icons (Apple, Windows, Linux)

### 3. Feature Sub-component

**Props Interface:**
```typescript
interface FeatureProps {
    icon: React.ReactElement;
    titleKey: string;
    descriptionKey: string;
    index: number; // For staggered animations
}
```

**Behavior:**
- Displays icon in circular background with glassmorphism
- Translates title and description via i18n
- Responsive card layout
- 3D transform on hover (translateZ, rotateX, rotateY)
- Scroll-triggered fade-in animation with delay based on index
- Lift effect with enhanced shadow on hover

### 4. StatCard Sub-component (NEW)

**Props Interface:**
```typescript
interface StatCardProps {
    icon: React.ReactElement;
    targetValue: number;
    label: string;
    suffix?: string; // e.g., "+", "K"
    duration?: number; // Animation duration in ms
}
```

**Behavior:**
- Animates counter from 0 to targetValue on mount
- Uses easing function for smooth counting
- Displays icon with gradient background
- Glassmorphism card styling

### 5. AnimatedBackground Sub-component (NEW)

**Props Interface:**
```typescript
interface AnimatedBackgroundProps {
    blobCount?: number; // Default: 3
    gradientColors: string[];
}
```

**Behavior:**
- Renders floating blob shapes with CSS animations
- Applies gradient mesh background
- Blobs move in different directions with varying speeds
- Uses blur filter for soft appearance

## Data Models

### Download Links Configuration

```typescript
const DOWNLOAD_LINKS = {
    macOS: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.dmg",
    windows: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe",
    linux: "https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.AppImage"
};
```

### Slider Configuration

```typescript
interface SliderConfig {
    images: string[];           // Array of image paths
    captions: {
        title: string;
        desc: string;
    }[];
    autoPlayInterval: number;   // 4000ms
    current: number;            // Current slide index
}
```

### i18n Translation Keys

Mevcut i18n yapısına ek olarak aşağıdaki key'ler kullanılacak:

```typescript
landingPage: {
    heroTitle: string;
    heroSubtitle: string;
    cta: string;
    featuresTitle: string;
    mockupsTitle: string;
    mockupsSubtitle: string;
    mockupsItems: {
        i1-i8: { title: string; desc: string; }
    };
    newFeatures: {
        backupTitle: string;
        backupDesc: string;
        secureTitle: string;
        secureDesc: string;
    };
    downloadTitle: string;
    downloadSubtitle: string;
    downloadFor: string;
    footerText: string;
    contactEmail: string;
    // NEW: Statistics section
    stats: {
        users: string;
        downloads: string;
        notes: string;
    };
}
```

### Statistics Configuration

```typescript
const STATS_CONFIG = {
    users: {
        target: 1000,
        suffix: "+",
        icon: Users,
        labelKey: "landingPage.stats.users"
    },
    downloads: {
        target: 5000,
        suffix: "+",
        icon: Download,
        labelKey: "landingPage.stats.downloads"
    },
    notes: {
        target: 10000,
        suffix: "+",
        icon: FileText,
        labelKey: "landingPage.stats.notes"
    }
};
```

## Styling and Animations

### CSS Classes and Animations

**Existing Animations (index.css):**
- `animate-float`: Logo floating animation
- `animate-fade-in`: Fade in effect
- `animate-fade-in-up`: Fade in with upward motion
- `animate-modal-enter`: Modal entrance animation
- `animate-pulse-glow`: Pulsing glow effect for CTA

**NEW Animations to Add:**
- `animate-blob`: Floating blob animation with random movement
- `animate-gradient`: Animated gradient background shift
- `animate-shimmer`: Shimmer/shine effect for loading states
- `animate-ripple`: Ripple effect from click point
- `animate-counter`: Number counting animation
- `animate-slide-in-scroll`: Scroll-triggered slide-in animation
- `animate-3d-hover`: 3D transform on hover

**Component-specific Classes:**
- `.landing-image`: Image rendering optimization
- `.landing-caption`: Caption overlay styling with backdrop-blur
- `.landing-caption-title`: Caption title styling
- `.landing-caption-desc`: Caption description styling
- `.feature-card`: Feature card container with glassmorphism
- `.feature-card-3d`: 3D transform container with perspective
- `.download-btn`: Download button with gradient border
- `.glassmorphism`: Reusable glassmorphism effect class
- `.gradient-text`: Gradient text effect
- `.text-glow`: Text glow/shadow effect
- `.stat-card`: Statistics card styling
- `.blob-shape`: Animated blob background shape
- `.gradient-border`: Animated gradient border effect

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Responsive Adjustments:**
- Hero title: 4xl (mobile) → 6xl (desktop)
- Slider height: 80 (mobile) → 32rem (desktop)
- Grid columns: 1 (mobile) → 2 (tablet) → 3 (desktop for downloads)
- Footer: Stacked (mobile) → 3-column grid (desktop)

## Error Handling

### Download Link Validation

```typescript
const handleDownload = () => {
    if (downloadUrl) {
        try {
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error('Failed to open download link:', error);
            // Fallback: Show error notification
        }
    }
};
```

### Image Loading Errors

```typescript
<img 
    src={src} 
    alt={`Mockup ${i + 1}`}
    loading="lazy"
    onError={(e) => {
        e.currentTarget.src = '/placeholder.png'; // Fallback image
    }}
/>
```

### Missing Translation Handling

i18n sistemi otomatik olarak eksik çevirileri handle eder:
- Fallback to English if translation missing
- Display key name if both languages missing

## Testing Strategy

### Unit Tests

1. **Component Rendering Tests**
   - WelcomeModal renders correctly when isOpen is true
   - WelcomeModal does not render when isOpen is false
   - All sections render with correct content

2. **Interaction Tests**
   - Language switch updates all text content
   - CTA button calls onClose callback
   - Download buttons open correct URLs
   - Slider navigation works (prev/next/dots)

3. **State Management Tests**
   - Slider auto-advances every 4 seconds
   - Slider pauses on hover
   - Current slide index updates correctly

### Integration Tests

1. **i18n Integration**
   - All translation keys resolve correctly
   - Language persistence works
   - Dynamic content updates on language change

2. **Navigation Integration**
   - Download links open in new tab
   - Social media links work correctly
   - Email link opens mail client

### Visual Regression Tests

1. **Responsive Layout**
   - Mobile view (375px, 414px)
   - Tablet view (768px, 1024px)
   - Desktop view (1280px, 1920px)

2. **Theme Support**
   - Dark theme renders correctly
   - All colors use CSS variables
   - Gradients and effects work in both themes

### Accessibility Tests

1. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Tab order is logical
   - Focus indicators are visible

2. **Screen Reader Support**
   - All images have alt text
   - Buttons have aria-labels
   - Semantic HTML structure

3. **ARIA Attributes**
   - Slider controls have proper ARIA labels
   - Language selector has proper role
   - Modal has proper ARIA attributes

## Visual Effects Implementation Details

### Glassmorphism Effect

```css
.glassmorphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

### 3D Transform on Hover

```css
.feature-card-3d {
    perspective: 1000px;
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
}

.feature-card-3d:hover {
    transform: translateY(-10px) rotateX(5deg) rotateY(5deg);
}
```

### Animated Gradient Background

```css
.animated-gradient {
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe);
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

### Ripple Effect

```typescript
const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
};
```

### Counter Animation

```typescript
const animateCounter = (
    start: number,
    end: number,
    duration: number,
    onUpdate: (value: number) => void
) => {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutExpo)
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(start + (end - start) * eased);
        
        onUpdate(current);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
};
```

### Scroll-triggered Animations

```typescript
const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        document.querySelectorAll('.scroll-animate').forEach((el) => {
            observer.observe(el);
        });
        
        return () => observer.disconnect();
    }, []);
};
```

## Performance Considerations

### Image Optimization

- Use `loading="lazy"` for slider images
- Optimize image sizes (max 1920px width)
- Use modern formats (WebP with PNG fallback)
- Implement progressive loading

### Animation Performance

- Use CSS transforms instead of position changes
- Use `will-change` for animated elements (sparingly)
- Debounce slider transitions
- Use `requestAnimationFrame` for smooth animations
- Limit number of animated blobs to 3-4 maximum
- Use `transform: translateZ(0)` for GPU acceleration
- Disable animations on low-end devices (prefers-reduced-motion)

### Glassmorphism Performance

- Limit backdrop-filter usage to visible elements only
- Use lower blur values on mobile (5px instead of 10px)
- Consider fallback for browsers without backdrop-filter support

### Bundle Size

- Lazy load icons if needed
- Tree-shake unused i18n translations
- Minimize CSS with PostCSS
- Use CSS-in-JS only for dynamic styles

## Security Considerations

### External Links

- All external links use `rel="noopener noreferrer"`
- Download URLs are validated before opening
- No inline JavaScript in HTML

### XSS Prevention

- All user-facing text goes through i18n (sanitized)
- No dangerouslySetInnerHTML usage
- React's built-in XSS protection

## Accessibility Considerations for New Effects

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
    .animate-blob,
    .animate-gradient,
    .animate-float,
    .feature-card-3d {
        animation: none !important;
        transition: none !important;
    }
}
```

### Focus States for Glassmorphism

```css
.glassmorphism:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

### Screen Reader Announcements for Counters

```typescript
<div role="status" aria-live="polite" aria-atomic="true">
    <span className="sr-only">
        {t('landingPage.stats.users')}: {userCount}
    </span>
    <span aria-hidden="true">{userCount}+</span>
</div>
```

## Future Enhancements

1. **Analytics Integration**
   - Track download button clicks
   - Monitor slider engagement
   - A/B test CTA variations
   - Track scroll depth and interaction heatmaps

2. **Dynamic Content**
   - Fetch latest release version from GitHub API
   - Show real-time download counts
   - Display recent updates/changelog
   - Pull statistics from backend API

3. **Enhanced Animations**
   - Lottie animations for feature icons
   - More complex particle effects
   - Interactive cursor effects
   - Morphing shapes and transitions

4. **Video Integration**
   - Product demo video in hero section
   - Feature walkthrough videos
   - Testimonial videos
   - Background video with overlay

5. **Localization Expansion**
   - Add more languages (ES, DE, FR, etc.)
   - RTL support for Arabic/Hebrew
   - Region-specific content
   - Dynamic content based on user location
