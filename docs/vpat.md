# VPAT® 2.4 – Revised Section 508 (WCAG 2.1)
**Accessibility Conformance Report (ACR)**

---

## 1. Product Identification
- **Product Name:** Share Meals App
- **Version:** 4.1.4
- **Report Date:** August 11, 2025
- **Vendor/Developer:** Share Meals United
- **Product URL:**
  - Web App: [https://app.sharemeals.org](https://app.sharemeals.org)
  - Google Play Store: [https://play.google.com/store/apps/details?id=org.sharemeals.app](https://play.google.com/store/apps/details?id=org.sharemeals.app)
  - Apple App Store: [https://apps.apple.com/us/app/share-meals/id1227449725](https://apps.apple.com/us/app/share-meals/id1227449725)
- **Platforms/Environments:** Web, iOS, Android

## 2. Product Description
The Share Meals App empowers students, faculty, and community members to share information about food security resources near them. Users can discover, post, and share details about free meal programs, campus food pantries, and related resources, fostering a supportive community network. Available as a web application and mobile app for iOS and Android, the platform is designed to increase awareness and access to food security resources.

## 3. Accessibility Contact Information
- **Contact/Team:** Jonathan Chin
- **Email:** nucleus@sharemeals.org

## 4. Evaluation Methods Used
The Share Meals App was evaluated using a combination of automated and manual accessibility testing. Automated testing was performed using the **axe-core** accessibility engine integrated into **Cypress** end-to-end tests to identify issues related to WCAG 2.1 Level A and AA success criteria. Manual verification was conducted to confirm automated findings and assess areas not fully covered by automated tools, including keyboard-only navigation, logical focus order, and visible focus indicators. Limited screen reader checks were performed using built-in platform tools to confirm proper labeling and semantic structure. Testing was conducted on **Google Chrome** for desktop.

## 5. Applicable Standards/Guidelines
This report evaluates conformance against:
- **WCAG 2.1** (Levels A and AA)
- **Revised Section 508 of the U.S. Rehabilitation Act**

## 6. Conformance Terms
- **Supports** — Fully meets the criterion without exception.
- **Partially Supports** — Meets some aspects, with known exceptions.
- **Does Not Support** — Does not meet the criterion.
- **Not Applicable** — Criterion does not apply to the product.
- **Not Evaluated** — Not tested in this report.

---

## 7. WCAG 2.1 Success Criteria (A & AA)

| Criterion | Level | Conformance | Remarks |
|-----------|-------|-------------|---------|
| 1.1.1 Non-text Content | A | Supports | All meaningful images, icons, and interactive elements include appropriate text alternatives via `alt` attributes or ARIA labels. Decorative content is properly marked to be ignored by assistive technologies. Automated axe-core testing confirmed compliance. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | Not Applicable | No audio-only or video-only content. |
| 1.2.2 Captions (Prerecorded) | A | Not Applicable | No prerecorded video content with audio. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | Not Applicable | No video content. |
| 1.2.4 Captions (Live) | AA | Not Applicable | No live video content. |
| 1.2.5 Audio Description (Prerecorded) | AA | Not Applicable | No prerecorded video content. |
| 1.3.1 Info and Relationships | A | Supports | Semantic HTML and ARIA attributes convey structure and meaning. Automated axe-core testing confirmed compliance. |
| 1.3.2 Meaningful Sequence | A | Partially Supports | Logical reading and focus order maintained, except one button group on Accounts page not tabbable. |
| 1.3.3 Sensory Characteristics | A | Supports | Instructions do not rely solely on sensory cues. |
| 1.4.1 Use of Color | A | Supports | Color is not the sole method of conveying information. |
| 1.4.3 Contrast (Minimum) | AA | Supports | All text meets or exceeds contrast requirements in light mode. |
| 1.4.4 Resize Text | AA | Supports | Content is readable and functional at 200% zoom without horizontal scrolling. |
| 1.4.5 Images of Text | AA | Supports | No images of text used for information. |
| 1.4.10 Reflow | AA | Supports | Content reflows appropriately down to 320 CSS pixels. |
| 1.4.11 Non-text Contrast | AA | Supports | All non-text UI elements meet contrast requirements. |
| 1.4.12 Text Spacing | AA | Supports | Meets WCAG-recommended spacing without loss of content/function. |
| 1.4.13 Content on Hover or Focus | AA | Not Applicable | No hover/focus-triggered transient content; toast messages are user-triggered, short, and pausable. |
| 2.1.1 Keyboard | A | Partially Supports | Map panning/zooming requires mouse/touch; alternative location info provided. |
| 2.1.2 No Keyboard Trap | A | Supports | No keyboard traps present. |
| 2.1.4 Character Key Shortcuts | A | Not Applicable | No single-character shortcuts. |
| 2.2.1 Timing Adjustable | A | Not Applicable | No time limits. |
| 2.2.2 Pause, Stop, Hide | A | Not Applicable | No moving content requiring controls. |
| 2.3.1 Three Flashes or Below Threshold | A | Supports | No flashing content above threshold. |
| 2.4.1 Bypass Blocks | A | Supports | Landmarks allow skipping repeated content. |
| 2.4.2 Page Titled | A | Partially Supports | Visible titles change, HTML `<title>` does not update. |
| 2.4.3 Focus Order | A | Supports | Logical, predictable focus order. |
| 2.4.4 Link Purpose (In Context) | A | Supports | Links are descriptive in context. |
| 2.4.5 Multiple Ways | AA | Supports | All primary pages accessible via persistent bottom navigation. |
| 2.4.6 Headings and Labels | AA | Supports | Clear, descriptive headings and labels. |
| 2.4.7 Focus Visible | AA | Supports | Visible focus indicator present for all interactive elements. |
| 3.1.1 Language of Page | A | Supports | Root HTML element specifies language. |
| 3.1.2 Language of Parts | AA | Partially Supports | Language attribute does not update when app language changes. |
| 3.2.1 On Focus | A | Supports | No changes triggered solely on focus. |
| 3.2.2 On Input | A | Supports | No unexpected context changes on input. |
| 3.2.3 Consistent Navigation | AA | Supports | Navigation is consistent. |
| 3.2.4 Consistent Identification | AA | Supports | Elements with the same function are identified consistently. |
| 3.3.1 Error Identification | A | Supports | Errors are clearly indicated and exposed to assistive tech. |
| 3.3.2 Labels or Instructions | A | Supports | Labels and instructions are clear and programmatically associated. |
| 3.3.3 Error Suggestion | AA | Supports | Suggestions provided where applicable. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Not Applicable | No such transactions present. |
| 4.1.1 Parsing | A | Supports | HTML is free of parsing errors. |
| 4.1.2 Name, Role, Value | A | Supports | Interactive elements have correct accessible name, role, and value. |
| 4.1.3 Status Messages | AA | Supports | Toast messages announced via ARIA live regions. |

---

## 8. Revised Section 508 – Functional Performance Criteria

| Criterion | Conformance | Remarks |
|-----------|-------------|---------|
| 302.1 Without Vision | Supports | All core functionality accessible via assistive tech; location info available in list format. |
| 302.2 With Limited Vision | Supports | Meets WCAG 2.1 for text resizing, contrast, and focus indicators. |
| 302.3 Without Perception of Color | Supports | Color not sole method of conveying information. |
| 302.4 Without Hearing | Supports | No audio content. |
| 302.5 With Limited Hearing | Supports | No audio content. |
| 302.6 Without Speech | Supports | Fully operable without speech input. |
| 302.7 With Limited Manipulation | Partially Supports | Map panning/zooming not fully keyboard accessible. |
| 302.8 With Limited Reach and Strength | Partially Supports | Map panning/zooming requires mouse/touch; alternatives available. |
| 302.9 With Limited Language, Cognitive, and Learning Abilities | Supports | Clear language and consistent navigation. |

---

## 9. Revised Section 508 – Technical Requirements

For all 502.3.x criteria: Supports, unless marked Not Applicable, based on automated axe-core WCAG testing confirming programmatic exposure of names, roles, values, states, and properties.

---

**End of Report**
