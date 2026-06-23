## Prompt 1 - Generate Design Tokens Variables

Using the Figma MCP, extract the local variables and primitives from the file {url} and node id {node ID}.

Generate a complete tailwind.config.js and a corresponding root CSS file using dynamic CSS variables instead of static Hex values. Follow these exact formatting requirements:

CSS Variables File (src/index.css):

Declare all design tokens inside a :root block (and an optional [data-theme="dark"] if a dark mode scale exists).

Convert all Hex codes into raw, space-separated or comma-separated RGB channels only (e.g., #5548D9 must be written as 85 72 217). Do not include the rgb() wrapper or # symbols here.

Tailwind Config File (tailwind.config.js):

Map the theme extension keys using the CSS variables wrapped in Tailwind's alpha modifier format: rgb(var(--your-variable-name) / <alpha-value>).

For example, the primary scale should look exactly like:

JavaScript
primary: {
  50: "rgb(var(--dozen-primary-50) / <alpha-value>)",
  100: "rgb(var(--dozen-primary-100) / <alpha-value>)",
  // ... continue for all scales (gray, warning, success, error, info)
}
Output both file structures cleanly so I can save them directly into my workspace.

---

## Prompt 2 - Generate a Component from Design
Using the Figma MCP, from the file https://www.figma.com/design/UU089oHCZD4v1RnmLVltwS/-shadcn-ui---Design-System--Community-?node-id=2-283&t=1FXnf1xoue1UU3BL-0

Convert this selection into a modern React component (using Javascript and functional components) that precisely maps to our configured Tailwind CSS configuration. Adhere to these strict architectural rules:

Design Token Integration:

Do NOT hardcode any arbitrary Hex or pixel values (avoid bg-[#5548D9] or w-[320px]).

Strictly use our defined Tailwind classes that bridge to our CSS variables (e.g., text-primary-500, bg-neutral-10, shadow-shadow-1).

Dark Mode Support:

Ensure layout containers adapt seamlessly when the root theme changes. Since our design system handles dark mode via the global CSS variables (the -- css variables variables swap values automatically), rely on the semantic classes for elements that adapt via variable mapping.

Responsive Adaptability:

Use Tailwind's responsive modifiers (sm:, md:, lg:) to ensure the component smoothly transitions from mobile to the 1600px desktop canvas width visible in the design. Use flexboxes, CSS grids, and fluid layouts instead of fixed widths wherever possible.

Accessibility (a11y):

Implement proper semantic HTML tags (e.g., <main>, <section>, <nav>, or <button> instead of generic <div>s for interactive elements).

Include appropriate ARIA attributes if the node contains complex components (like active tabs, flyouts, or input fields).

Ensure text elements use an optimal contrast hierarchy matching the layout's typography tokens.

Provide a clean, modular code output along with any necessary sub-components.
