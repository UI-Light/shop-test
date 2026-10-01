# DESIGN.md
Style: clean, airy and distinctive. Light theme only - dark mode is not needed.
Accent: violet-600 for primary actions and links, hover violet-700. Keep to this ONE accent so the shop stays recognisable.
Surfaces: white background, slate-900 text, slate-600 secondary text, slate-200 borders.
Type: system font stack. Hierarchy by size + weight: page title text-3xl font-semibold, section text-lg font-medium, body text-base, meta text-sm text-slate-600.
Layout: centered max-w-5xl, responsive grid (1 col mobile, 2 tablet, 3-4 desktop), generous whitespace (gap-6, py-16).
Cards: rounded-xl, white, border border-slate-200, soft shadow (shadow-sm). Hover: shadow-md and hover:-translate-y-0.5 (never shift neighbouring cards).
Buttons: rounded-lg, ONE primary style (violet-600), with a visible hover (violet-700) and focus-visible ring. Secondary is outline/ghost.
Hover/focus: every card, link and button has a visible hover and focus state - never rely on the cursor alone.
Motion: subtle only, 150-200ms ease-out on colour, shadow and transform. No large or looping animations.
Product images: real product photographs (not drawings or placeholders), square, object-cover, rounded-lg.
Empty/error states: a plain sentence plus a clear next action (button or link).
## Feedback
Every button that triggers an action shows a pending state while the request runs: disabled + a small spinner, label change like "Adding..." or "Placing order...".
On success or error show a small toast in a screen corner that names what happened and dismisses itself.