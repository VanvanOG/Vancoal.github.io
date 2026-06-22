# Deploy

Target repository: `VanvanOG/Vancoal.github.io`

Expected GitHub Pages URL:

```text
https://vanvanog.github.io/Vancoal.github.io/
```

Project detail URLs use hash routing so they can be opened directly on GitHub Pages:

```text
https://vanvanog.github.io/Vancoal.github.io/#/projects/mars-era
https://vanvanog.github.io/Vancoal.github.io/#/projects/habitat-ai-dialogue
https://vanvanog.github.io/Vancoal.github.io/#/projects/ai-design-lab
```

This project already includes a GitHub Pages workflow at:

```text
.github/workflows/deploy.yml
```

The workflow builds the site with:

```text
VITE_BASE_PATH=/Vancoal.github.io/
npm run build
```

and publishes the `dist` folder through GitHub Pages.

## Local prerequisites

This machine has already installed Git and GitHub CLI, and `gh` is authenticated as `VanvanOG`.

If another machine needs setup:

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
gh auth login
```

## Push

From `G:\AI PRO\vancoal_web`:

```powershell
git add .
git commit -m "Update portfolio site"
git push
```

After the push, GitHub Actions will deploy automatically. The first Pages deployment can take a few minutes.
