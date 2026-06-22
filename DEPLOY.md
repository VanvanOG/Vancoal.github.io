# Deploy

Target repository: `VanvanOG/Vancoal.github.io`

Expected GitHub Pages URL:

```text
https://vanvanog.github.io/Vancoal.github.io/
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

The current machine must have Git or GitHub CLI installed before the project can be pushed:

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
gh auth login
```

## Push

From `G:\AI PRO\vancoal_web`:

```powershell
git init
git branch -M main
git remote add origin https://github.com/VanvanOG/Vancoal.github.io.git
git add .
git commit -m "Deploy portfolio site"
git push -u origin main
```

After the push, GitHub Actions will deploy automatically. The first Pages deployment can take a few minutes.
