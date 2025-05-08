# High-Fidelity Mockups for LeadVerifyPro

## Overview
These mockups describe the visual design of key pages, created as if in Figma, using Magic UI components and a modern, AI-centric aesthetic. The design elevates LeadVerifyPro to a premium experience with sophisticated animations, thoughtful micro-interactions, and layered depth effects that create a sense of luxury and intelligence.

## Enhanced Color Palette
- **Primary Colors**: Sage Green (#A8B5A2), Dusty Rose (#DCAE96), Navy Blue (#1F2A44), Burnt Orange (#CC5500), Creamy Ivory (#F1EDEB), Slate Gray (#708090), Mustard Yellow (#E1AD01), Lavender (#B57EDC).
- **Usage**: Use Sage Green for primary actions and success messages, Dusty Rose for secondary buttons, Navy Blue for headers and footers, Burnt Orange for accent lines, Creamy Ivory for page backgrounds, Slate Gray for body text, Mustard Yellow for notification badges, and Lavender for focus rings.
- **Gradient Overlays**: Implement subtle gradient transitions between complementary colors to add depth and sophistication.
- **Color Transitions**: Colors shift subtly based on scroll position and user interactions to create a dynamic, responsive feel.

## Enhanced Visual Elements
- **Backgrounds**: Introduce gradient overlays and subtle textures inspired by Zen Browser, with grain textures that add tactile quality.
- **Shadows and Corners**: Use soft, layered shadows and variable rounded corners for a friendly yet premium interface.
- **3D Elements**: Add subtle depth with layered components that respond to scroll and mouse movement.
- **Parallax Effects**: Implement gentle parallax on key sections to create immersive depth.

## Interactive Elements
- **Micro-interactions**: Implement subtle scaling, color changes, and position shifts on hover for all interactive elements.
- **Custom Cursors**: Design context-aware cursors that change based on the element being hovered.
- **Magic UI Components**: Enhance Bento Grid and Animated List with 3D perspective and staggered animations.
- **Transition States**: Design elegant loading, success, and error states for all user actions.

## Responsive Design
- **Breakpoints**: Ensure full responsiveness with clear breakpoints for mobile, tablet, and desktop views.
- **Gesture Interactions**: Implement swipe, pinch, and other gesture controls for mobile users.
- **Animation Optimization**: Scale down animation complexity on mobile for performance while maintaining premium feel.

## AI-Driven Features
- **Visual Cues**: Highlight AI-driven features with animated icons, particle effects, or subtle glows.
- **Processing Animations**: Design elegant animations for AI processing states that convey intelligence.

---

## Landing Page (`/`)

- **Header**: Sticky, transparent background (#1F2A44, 90% opacity) with subtle frosted glass effect, white logo with subtle entrance animation, and links in Montserrat (white, hover: scale 1.05, color transition to #DCAE96 in 0.3s).
- **Hero Section**:
  - Hero Video Dialog: Full-width, looping 15-second video of lead verification in action, with a play button overlay that pulses gently and transforms on hover.
  - Background Elements: Subtle floating shapes or particles that respond to mouse movement with parallax effect.
  - Headline: "Verify Leads with AI Precision" in Montserrat (48px, white, Aurora Text effect with dynamic color shifts).
  - Tagline: "Save time and close deals faster" in Inter (20px, #D3D3D3) with subtle fade-in animation.
  - CTA: Pulsating Button ("Start Free Trial", #A8B5A2 background, white text, hover: scale 1.1, #9AA694 background) with custom click animation and success state.
- **How It Works**: Bento Grid with 3 cards (#F1EDEB background with subtle grain texture, #1F2A44 border, box-shadow with layered depths), each with an animated icon, title (Montserrat, 24px), and description (Inter, 16px). Cards animate in sequence on scroll with subtle 3D rotation on hover.
- **Benefits**: Animated List with 4 items, each sliding in with a 0.5s delay and subtle Y-axis movement, styled with Line Shadow Text and hover animations.
- **Pricing**: Grid Pattern background (#1F2A44) with parallax effect on scroll, free tier card (#F1EDEB with subtle gradient overlay, #A8B5A2 border with glow effect), and Pro tier note (Hyper Text animation with floating effect).
- **Footer**: #1F2A44 background with subtle grain texture, white links in Inter (14px) with custom hover animations (scale 1.05, underline animation).

---

## Dashboard (`/dashboard`)

- **Header**: Sticky, #1F2A44 background with subtle grain texture, white logo with subtle pulse on page load, and links in Montserrat (hover: scale 1.05, color transition to #DCAE96 in 0.3s).
- **Main Content**:
  - **Upload Area**: #F1EDEB card with subtle gradient overlay, Border Beam effect with animated particles, drag-and-drop zone (dashed #A8B5A2 border that animates on hover), and "Upload CSV" button (#A8B5A2, white text, hover: scale 1.05, box-shadow expansion).
  - **Lead Table**: #F1EDEB table with subtle grain texture, #708090 borders, sortable headers (Montserrat, 16px) with sort direction indicators that animate on click, and rows (Inter, 14px) with hover state (background: rgba(168, 181, 162, 0.05)). Verified leads use Hyper Text for status with custom animations based on verification result.
  - **Progress Bar**: Number Ticker (0–100%, #A8B5A2 fill with gradient overlay, Montserrat, 20px) with smooth counting animation and dynamic color transitions.
  - **Export Button**: Animated Subscribe Button (#A8B5A2, white text, hover: scale 1.1) with success animation on click showing checkmark and confetti particles.
- **Sidebar**: Collapsible, #1F2A44 background with subtle gradient, white links (Inter, 16px) with hover animations, mobile: hamburger menu with smooth transition animation.
- **Background**: Multi-layered subtle gradient of Creamy Ivory (#F1EDEB) with grain texture that shifts subtly based on mouse position.

---

## Account Page (`/account`)

- **Header**: Same as Dashboard.
- **Main Content**:
  - **Profile Section**: #F1EDEB card with subtle grain texture and depth effect, fields in Inter (16px) with custom focus states, labels in Montserrat (14px), and animated validation feedback.
  - **Usage Stats**: Bento Grid with 3 cards (#F1EDEB with subtle gradient overlay, #A8B5A2 border with glow effect), stats in Number Ticker (Montserrat, 20px) with counting animations. Cards feature subtle 3D perspective on hover (transform: perspective(1000px) rotateX(2deg) rotateY(2deg)).
  - **Billing**: #F1EDEB card with glass morphism effect, plan name in Montserrat (18px), link to Subscription Page (#A8B5A2 with custom underline animation on hover).
  - **Support**: Links with Line Shadow Text (Inter, 16px) and custom hover animations (scale 1.05, color shift to #DCAE96).
- **Background**: Same gradient as Dashboard with parallax elements that respond to scroll.

---

## Error Page (`/error`)

- **Main Content**: Centered #F1EDEB card with subtle gradient overlay and glass morphism effect, error message in Aurora Text (Montserrat, 36px, #1F2A44) with particle animations, and Pulsating Button (#A8B5A2, white text, hover: scale 1.1).
- **Background**: #1F2A44 with interactive Grid Pattern that responds to mouse movement, creating a subtle parallax effect.

---

## Checkout Page (`/checkout`)

- **Header**: Same as Dashboard.
- **Main Content**: Centered #F1EDEB card with subtle grain texture and depth effect, "Coming Soon" in Hyper Text (Montserrat, 36px, with #DCAE96 accents) with dynamic color animations, Bento Grid with 4 Pro tier benefits (#F1EDEB cards with glass morphism effect, #A8B5A2 border with glow) that animate in sequence on page load and feature subtle 3D hover effects.
- **CTA**: Animated Subscribe Button (#A8B5A2, white text) with dynamic hover state and success animation.
- **Background**: Multi-layered gradient of Navy Blue (#1F2A44) that shifts based on scroll position, with subtle parallax elements.

---

## Subscription Page (`/subscription`)

- **Header**: Same as Dashboard.
- **Main Content**: #F1EDEB card with glass morphism effect and subtle grain texture, plan details in Montserrat (18px), "Pro Tier Coming Soon" in Line Shadow Text (Inter, 16px) with floating animation and #DCAE96 accent color.
- **Background**: Grid Pattern over #1F2A44 with parallax effect that responds to both scroll and mouse movement.

---

## Verified Leads Page (`/leads/verified`)

- **Header**: Same as Dashboard.
- **Main Content**:
  - **Lead Table**: Same as Dashboard, filtered to verified leads, with row entrance animations and status indicators in Hyper Text with custom animations based on score.
  - **Filters**: Dropdowns (#F1EDEB with subtle gradient, #A8B5A2 border, Inter, 14px) with smooth open/close animations (0.3s) and hover effects.
  - **Export Button**: Animated Subscribe Button (#A8B5A2, white text) with success animation showing checkmark and brief confetti effect.
  - **Data Visualizations**: Optional charts and graphs that animate in on page load with sequenced entrance animations and update with smooth transitions when filters change.
- **Sidebar**: Same as Dashboard.
- **Background**: Same gradient as Dashboard with subtle parallax elements.

---

## Login Page (`/login`)

- **Main Content**: Centered #F1EDEB card with subtle gradient overlay and glass morphism effect, Border Beam animation in #A8B5A2 that pulses gently, form fields (Inter, 16px) with custom focus states and validation animations, labels (Montserrat, 14px, #708090), and Pulsating Button (#A8B5A2, hover: scale 1.05).
- **Background**: #1F2A44 with subtle Grid Pattern that shifts subtly based on mouse position, creating a parallax effect.

---

## Sign Up Page (`/signup`)

- **Main Content**: Same design language as Login Page, with additional name field and slightly different animation timing for visual variety.
- **Background**: Same as Login Page with varied particle positions and movement patterns.

---

## Notes
- All pages implement smooth scrolling (CSS `scroll-behavior: smooth`) with scroll-linked animations and parallax effects.
- Custom cursor effects change based on interactive elements (e.g., pointer on buttons, grab on scrollable areas).
- Micro-animations on all interactive elements provide immediate feedback and create a sense of responsiveness.
- Page transitions use GSAP or Framer Motion for liquid-smooth navigation between routes.
- 3D depth achieved through layered elements, perspective transforms, and parallax effects.
- Variable font weights used where possible to create subtle typography animations.
- Responsive: Desktop (1200px+), tablet (768–1200px), mobile (<768px) with adjusted animations and gesture controls.
- Animations: Primary transitions (0.3s), entrance animations (0.5-0.8s), with appropriate easing functions for natural movement.