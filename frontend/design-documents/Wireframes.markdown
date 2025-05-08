# Wireframes for LeadVerifyPro

## Overview
These wireframes outline the layout and structure of each page in LeadVerifyPro, ensuring intuitive navigation and functionality for real estate wholesalers. The design prioritizes usability, with clear placement of features like lead upload, verification status, and calls-to-action (CTAs), while incorporating premium interactive elements and micro-animations that create a sophisticated user experience.

## Detailed Annotations
- Add annotations to explain the purpose and functionality of each element, including micro-interactions and transition effects.
- Document cursor behavior changes on interactive elements.
- Note scroll-triggered animations and parallax effects.

## User Flow Diagrams
- Include diagrams to illustrate navigation and interaction paths, with attention to page transitions and animation sequences.
- Document gesture-based interactions for mobile devices.

## Prototype Links
- Provide links to interactive prototypes in Figma for stakeholders to experience the design and provide feedback.
- Include animated prototypes demonstrating key micro-interactions.

## Feedback Integration
- Incorporate feedback from usability testing and stakeholder reviews to refine and improve the wireframes.

## AI and Magic UI Integration
- Highlight areas where AI and Magic UI components will be used, ensuring seamless integration into the design.
- Document custom animations for AI-powered features to create a sense of intelligence and sophistication.

---

## Landing Page (`/`)

- **Header**: Sticky navigation bar with logo (left), links to "Login" and "Sign Up" (right). Navigation items feature subtle hover animations and transform effects.
- **Hero Section**: Immersive hero area with parallax elements, centered Hero Video Dialog (autoplaying a 15-second AI lead verification demo), headline ("Verify Leads with AI Precision") with dynamic text animation, tagline ("Save time and close deals faster"), and "Start Free Trial" Pulsating Button with custom hover state.
- **How It Works**: Bento Grid with 3 cards explaining lead upload, verification, and scoring. Cards animate on scroll with staggered timing and subtle 3D rotation on hover.
- **Benefits**: Animated List highlighting efficiency, cost savings, and accuracy, with items that animate in sequence as user scrolls.
- **Pricing**: Grid Pattern background with glass morphism effects, free tier card and a "Pro Tier Coming Soon" note with subtle floating animation.
- **Footer**: Links to privacy policy, support, and socials with hover animations and custom cursor effects.

---

## Dashboard (`/dashboard`)

- **Header**: Sticky navigation with logo, links to "Account", "Verified Leads", and "Logout" with micro-animations on hover.
- **Main Content**:
  - **Upload Area**: Drag-and-drop zone for CSV/Excel files, styled with Border Beam and particle effects that respond to file hover and drag interactions.
  - **Lead Table**: Responsive table with columns (Name, Phone, Address, Status, Score), sortable and filterable, with row hover effects and subtle animations when sorting or filtering.
  - **Progress Bar**: Number Ticker showing lead processing progress with smooth counting animation and dynamic color transitions based on completion percentage.
  - **Export Button**: Animated Subscribe Button for downloading results as CSV with success animation on click.
- **Sidebar**: Collapsible menu for mobile with smooth transition animations, linking to other authenticated pages.
- **Background**: Subtle animated gradient or grain texture that responds to mouse movement.

---

## Account Page (`/account`)

- **Header**: Same as Dashboard.
- **Main Content**:
  - **Profile Section**: Form fields for name and email (read-only or editable) with focus animations and validation feedback.
  - **Usage Stats**: Bento Grid with stats (e.g., "Leads Verified: 150") featuring counting animations and subtle 3D perspective on hover.
  - **Billing**: Card showing current plan (Free Tier) with glass morphism effect and a link to Subscription Page with custom hover animation.
  - **Support**: Links to FAQs and contact form with Line Shadow Text styling and interactive hover effects.
- **Footer**: Minimal, with links to privacy policy featuring subtle hover animations.

---

## Error Page (`/error`)

- **Main Content**: Centered error message (e.g., "404: Page Not Found") with Aurora Text effect and subtle particle animations, and a Pulsating Button to return to Dashboard or Landing Page.
- **Minimal Header**: Logo only, no navigation.
- **Background**: Interactive grid pattern that responds subtly to mouse movement.

---

## Checkout Page (`/checkout`)

- **Header**: Same as Dashboard.
- **Main Content**: Centered "Coming Soon" message with Hyper Text animation, a Bento Grid previewing Pro tier benefits (e.g., "Unlimited Verifications", "Text Blasting") with staggered entrance animations and hover effects.
- **CTA**: Animated Subscribe Button linking to Subscription Page with custom success state.
- **Background**: Subtle animated gradient that shifts based on scroll position.

---

## Subscription Page (`/subscription`)

- **Header**: Same as Dashboard.
- **Main Content**: Card displaying current plan (Free Tier) with glass morphism effect and Grid Pattern background, and a "Pro Tier Coming Soon" note styled with Line Shadow Text and subtle floating animation.
- **CTA**: Link to Checkout Page with custom hover and focus states.
- **Background**: Dynamic pattern that responds subtly to user interaction.

---

## Verified Leads Page (`/leads/verified`)

- **Header**: Same as Dashboard.
- **Main Content**:
  - **Lead Table**: Similar to Dashboard but filtered to verified leads only, with export option and row animations on data changes.
  - **Filters**: Dropdowns for sorting (e.g., by score) and filtering (e.g., by status) with smooth open/close animations and hover effects.
  - **Export Button**: Animated Subscribe Button for CSV download with success animation on completion.
- **Sidebar**: Same as Dashboard.
- **Visualizations**: Optional data visualizations that animate in on page load and update with smooth transitions when filters are applied.

---

## Login Page (`/login`)

- **Main Content**: Centered form with email and password fields, "Forgot Password" link, and "Sign Up" link. Form card has Border Beam effect with interactive validation feedback and focus states.
- **CTA**: Pulsating Button for login with loading and success states.
- **Minimal Header**: Logo only with subtle animation on page load.
- **Background**: Subtle animated gradient or pattern that responds to form interaction.

---

## Sign Up Page (`/signup`)

- **Main Content**: Centered form with name, email, and password fields, and a "Login" link. Form card has Border Beam effect with interactive validation feedback.
- **CTA**: Pulsating Button for sign-up with loading and success animations.
- **Minimal Header**: Logo only with subtle entrance animation.
- **Background**: Subtle animated gradient or pattern similar to login page.

---

## Notes
- All pages feature custom cursor effects that change based on interactive elements (buttons, links, cards).
- Page transitions use smooth animations between routes for a seamless experience.
- Smooth scrolling enabled via React Router and CSS with parallax effects on key sections.
- Magic UI components (e.g., Bento Grid, Number Ticker) enhanced with custom animations and 3D effects.
- All interactive elements include accessible focus states and keyboard navigation support.
- Mobile experience includes gesture-based interactions and optimized animations for performance.