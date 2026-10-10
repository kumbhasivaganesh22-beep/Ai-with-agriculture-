# Fieldnote

Fieldnote is a beginner-friendly agriculture guide built with plain HTML, CSS, and JavaScript. It has no package dependencies or build step. The deployable site and its local images are in `public/`.

## Deploy with Vercel

1. Import `kumbhasivaganesh22-beep/Ai-with-agriculture-` from the Vercel dashboard.
2. Use the **Other** framework preset and the repository root as the project root.
3. Leave the Build Command empty. `vercel.json` sets the output directory to `public`.
4. Deploy. Vercel can then create preview deployments for pushes and a production deployment from the configured production branch.

The site is static and does not need environment variables, a backend, or a build command. The plant-photo workflow is a local preview and does not upload or analyze images.
