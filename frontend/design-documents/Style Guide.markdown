Cancel
Save
High-Fidelity Mockups.markdown

Wireframes.markdown

README.MD

BACK-END.MD

Style Guide.markdown

Page Structure.MD

PRD.MD

To build the frontend for LeadVerifyPro, we need a structured, modular, and maintainable codebase that aligns with the provided design specifications (High-Fidelity Mockups, Wireframes, Style Guide, Page Structure, etc.). The goal is to create a React-based single-page application (SPA) using Vite for fast development, incorporating Magic UI components, and ensuring responsiveness, accessibility, and ease of updates. Below is a master guide for building the frontend, including component styling, file organization, and best practices to keep the codebase clean and editable.

The guide focuses on:

Modular component architecture to avoid long files.
Consistent styling with Tailwind CSS and Magic UI components.
A clear folder structure for scalability.
Best practices for animations, responsiveness, and accessibility.
Integration with the backend APIs described in BACK-END.MD.
Frontend Master Guide for LeadVerifyPro
markdown
Show inline







How can Grok help?


DeepSearch


Think

Grok 3

Style Guide.markdown

# Style Guide for LeadVerifyPro

## Overview
This style guide ensures consistency across LeadVerifyPro's frontend, defining colors, typography, spacing, and component styles. The design is modern, AI-centric, and clean, with a focus on usability and aesthetic appeal for real estate wholesalers.

---

## Color Palette
- **Primary**: #A8B5A2 (Sage Green - success messages, primary buttons)
- **Secondary**: #DCAE96 (Dusty Rose - secondary buttons, accents)
- **Background**: #F1EDEB (Creamy Ivory - page backgrounds, cards)
- **Text**: #708090 (Slate Gray - body text, descriptions)
- **Accent**: #CC5500 (Burnt Orange - accent lines, highlights)
- **Header/Footer**: #1F2A44 (Navy Blue - headers, footers, dark sections)
- **Notification**: #E1AD01 (Mustard Yellow - badges, alerts)
- **Focus**: #B57EDC (Lavender - focus rings, selected states)

**Usage Guidelines**:
- Use Sage Green for primary actions, success states, and key CTAs
- Apply Dusty Rose for secondary/alternative actions and subtle accents
- Creamy Ivory provides a warm, inviting background that reduces eye strain
- Slate Gray ensures readable text while maintaining sophistication
- Burnt Orange draws attention to important elements without being harsh
- Navy Blue anchors the design with professional authority
- Mustard Yellow makes notifications and badges stand out naturally
- Lavender provides clear visual feedback for interactive elements

## Typography Enhancements
- **Primary Font**: Montserrat for headings and buttons.
- **Secondary Font**: Inter for body text and descriptions.
- **Additional Font**: Consider a third font for special elements like quotes or testimonials.

## Component Library
- **Magic UI Components**: Document usage, props, and customization options for consistency.

## Animation Guidelines
- **Timing and Easing**: Provide detailed guidelines for animations to create a cohesive user experience.

## Accessibility Considerations
- **Contrast and Focus**: Ensure all text and interactive elements meet accessibility standards with sufficient contrast and clear focus states.

---


---

## Typography

- **Primary Font**: Montserrat (bold, modern; used for headings, buttons, labels).
  - Weights: 400 (regular), 600 (semi-bold), 700 (bold).
  - Sizes:
    - H1: 48px (hero headline).
    - H2: 36px (section titles).
    - H3: 24px (card titles).
    - Button: 16px.
    - Label: 14px.
- **Secondary Font**: Inter (clean, readable; used for body text, descriptions).
  - Weights: 400 (regular), 500 (medium).
  - Sizes:
    - Body: 16px.
    - Small: 14px (footnotes, secondary text).
- **Line Height**: 1.5 for body, 1.2 for headings.
- **Letter Spacing**: 0.5px for headings, 0.2px for body.

---

## Spacing

- **Padding**:
  - Sections: 80px top/bottom (desktop), 40px (mobile).
  - Cards: 24px internal.
  - Buttons: 12px 24px (vertical, horizontal).
- **Margin**:
  - Between sections: 64px (desktop), 32px (mobile).
  - Between cards: 24px.
- **Container Width**: 1200px max (desktop), 90% (mobile).
- **Border Radius**: 8px for cards, buttons, and inputs.

---

## Components

- **Buttons**:
  - **Primary**: #1E90FF background, white text, Montserrat (16px), 8px border-radius, 0.3s hover transition (scale 1.1, #1C86EE background).
  - **Pulsating Button**: Magic UI component, same styles as Primary, with pulsing animation.
  - **Animated Subscribe Button**: Magic UI component, #1E90FF, white text, with subscription animation.
- **Cards**: White background, #D3D3D3 or #1E90FF border (1px), 8px border-radius, 24px padding.
- **Forms**:
  - Inputs: White background, #D3D3D3 border (1px), 8px border-radius, Inter (16px).
  - Labels: Montserrat (14px), #2C2C2C.
  - Border Beam: Magic UI component for form cards.
- **Tables**: White background, #D3D3D3 borders, Montserrat (16px) for headers, Inter (14px) for rows.
- **Navigation**:
  - Sticky header: #2C2C2C (90% opacity), Montserrat (16px) for links, hover: #1E90FF.
  - Sidebar (authenticated pages): #2C2C2C, Inter (16px), collapsible for mobile.
- **Magic UI Components**:
  - **Hero Video Dialog**: Full-width, autoplay, muted, with play button overlay.
  - **Bento Grid**: 3–4 cards per row (desktop), 1 per row (mobile), white with #1E90FF border.
  - **Animated List**: Slide-in animation (0.5s per item).
  - **Border Beam**: Applied to forms and upload areas.
  - **Number Ticker**: Used for progress bars and stats, Montserrat (20px).
  - **Aurora Text**: For error messages and headlines, Montserrat (36px–48px).
  - **Line Shadow Text**: For secondary text and links, Inter (16px).
  - **Hyper Text**: For verified lead statuses and "Coming Soon" messages, Montserrat (18px–36px).
  - **Grid Pattern**: Subtle background pattern for pricing and error pages.

---

## Animations

- **Buttons**: 0.3s scale (1.1) and color transition on hover.
- **Cards and Lists**: 0.5s slide-in from bottom on page load.
- **Progress Bars**: Number Ticker animates over 1s.
- **Smooth Scrolling**: Enabled via CSS `scroll-behavior: smooth`.

---

## Responsiveness

- **Desktop** (>1200px): Full layouts, multi-column grids.
- **Tablet** (768–1200px): Adjusted font sizes (80% of desktop), 2-column grids.
- **Mobile** (<768px): Single-column layouts, collapsed navigation, 24px section padding.

---

## Notes
- All designs align with the AI-driven aesthetic (e.g., gradients, animations).
- Consistent use of Magic UI components ensures interactivity and modernity.
- Accessibility: Ensure 4.5:1 contrast ratio for text (e.g., white on #2C2C2C).