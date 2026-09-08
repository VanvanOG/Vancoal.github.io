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

## 本地优化与正式发布隔离

- 日常优化：`G:/AI PRO/01_网站/作品集网站-项目引入Demo`，没有 Git 远程，不自动同步。
- 正式发布：`G:/AI PRO/01_网站/vancoal_web`，仅收到明确发布指令后更新。
- 备份：`G:/AI PRO/90_发布备份`。

GitHub Pages 仅手动发布 main，推送不会自动更新线上。

每次发布：先备份当前线上提交的源码与 Git bundle，再将验收后的 src、public、构建配置和验证脚本同步至发布仓库。不上传原始资料、个人文件、qa、node_modules、dist 或本地配置。

在发布仓库检查差异与暂存清单后执行：

```powershell
npm ci
node --test tests/*.test.mjs
$env:VITE_BASE_PATH='/Vancoal.github.io/'
npm run build
# 完成子路径静态预览、人工验收和明确发布授权后，选择性暂存文件。
git commit -m "Update portfolio site"
git push
gh workflow run deploy.yml --repo VanvanOG/Vancoal.github.io --ref main
gh run list --repo VanvanOG/Vancoal.github.io --workflow deploy.yml --limit 5
```

等待工作流成功，核对线上部署提交、五个项目、视频、返回和移动端，建立唯一版本标签并保存源码与静态产物 ZIP。

恢复时根据备份旧提交还原站点文件，保留当前手动发布工作流，创建恢复提交并手动部署。不要强制推送或直接恢复旧版自动部署配置。

本地可双击“打开本地演示.cmd”，或运行 `npm run dev -- --host 127.0.0.1`。本地修改不会改变线上。
