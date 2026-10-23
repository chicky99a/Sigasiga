# Siga Siga

Small Next.js App Router site using React and CSS, without UI libraries.

## Current stage

Stage 2 — desktop layout, ready for visual review. Stage 1 was retained. This pass changes only layout CSS; Fredoka and all existing typography, copy, assets, controls, and functionality remain as they were.

The approved reference is `flower_red.png` (845 × 1862), measured proportionally at a 1400px desktop width. Layout landmarks:

| Section | Top | Height |
| --- | ---: | ---: |
| Hero | 0px | 800px |
| About | 800px | 520px |
| Why Greek | 1320px | 784px |
| Courses | 2104px | 727px |
| Footer | 2831px | 254px |

About text begins at approximately 988px in three columns. The Why Greek heading has 40px of section padding plus its intrinsic transparent asset margin; the three 400px circles begin at approximately 1498px. Course rows retain 172px of height. Sections can grow with content. Decorative overflow remains free across section boundaries and is clipped only at the viewport edge.

Existing differences outside Stage 2 remain pending: Fredoka → Arimo, final artwork positioning and treatments, benefit descriptions, course copy and dotted separators, CTA styling, and responsive behavior. No later stage was implemented in this pass.

Links to About and Courses work. The level-test button and the enrollment form's optional test link open `/level-test/index.html` on the same website.

## Integrated level test

The maintained test lives in `public/level-test/`, including its questions, scoring, images, fonts, and configured Google Apps Script connection. It is served by Next.js together with the website; no separate port or server is needed. Click the logo in the test to return to the home page. The snail starts at the right and moves left as questions advance.

Run `pnpm test` for scoring and interaction checks. These checks do not submit contact details or send email. The existing Apps Script integration is preserved.

Upload this project root to GitHub, including `public/level-test/` and `scripts/`. The old `level-test-prototype/` is an ignored local archive, not a deployment dependency. Dependencies, build output, and environment secrets are also ignored.

GitHub stores the source code. Deploy this Next.js project using a host that runs Next.js (`pnpm build`, then `pnpm start`). It is not configured for GitHub Pages static hosting; the enrollment API uses a server route.

## Development

Use Node.js 20.9 or later and pnpm:

```sh
pnpm install
pnpm dev
pnpm build
```

## Structure

- `app/`: route, metadata, global CSS and local font declarations
- `components/`: sections, image headings and fixed CTA
- `data/courses.js`: course names, descriptions and euro prices
- `public/assets/`: original supplied PNGs and webfonts

## Next review

Review Stage 2 at a 1400px desktop viewport before proceeding to Stage 3. Keep the work local and continue one stage at a time after review.
