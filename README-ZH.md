# 李逸辰的部落格

[English](README.md) | 简体中文

基于 Astro 的纯静态个人博客，本地预览首版。无数据库、评论或访问统计。

## 本地运行

需要 Node.js 22.19+（`.nvmrc` 固定为 22.23.3）。本项目使用 npm 和 package-lock.json 锁定依赖。

```bash
nvm use
npm install
npm start
```

访问终端输出的地址，默认 http://localhost:4321 。`npm start` 先构建全文搜索索引，再启动完整预览。

修改页面样式时可用 `npm run dev` 实时刷新；开发服务器未生成搜索索引时会显示提示。文章修改后需要重新执行 `npm start` 更新完整预览。

```bash
npm run check    # Astro / TypeScript 检查
npm test         # 内容筛选、分页、排序校验
npm run build    # 静态产物和 Pagefind 中文索引
npm run preview # 预览现有 dist
```

## 修改内容

- 站名、作者介绍、分类、标签：`src/config/site.ts`
- 文章：`src/content/posts/*.md`
- 动态：`src/content/moments/*.md`
- 关于：`src/content/pages/about.md`
- 推荐资源/友链：`src/data/friends.json`
- 阅读数据快照：`src/data/reading.json`（说明见下文）
- 配色和布局：`src/styles/global.css`
- 本地示例插画：`public/images/`

```bash
npm run new -- post my-new-post "我的新文章"
npm run new -- moment a-small-moment "今天的一点记录"
```

新内容默认草稿。检查后将 `draft` 改为 `false`，发布日期不晚于构建时间才会公开。分类、标签必须引用配置里已有的 id；slug 必须唯一。所有示例文章、动态、头像和个人介绍都是体验素材，正式发布前应替换。

## 首页横幅与打字机

修改 `src/config/site.ts` 中的 `site.banner`：

- `quotes`：按顺序循环展示的句子数组，逐字输入、停留、逐字删除后切换。
- `typewriter.typeSpeed`、`deleteSpeed`：每字输入、删除的间隔（毫秒）。
- `holdTime`、`startDelay`、`nextDelay`：完整句子停留、首次开始及句间等待时长（毫秒），位于 `typewriter` 中。
- `typewriter.enabled`：设为 `false` 时静态显示第一句；空列表使用站点简介。
- `image`：相对于 `public/` 的图片路径；`position`、`mobilePosition` 分别调整桌面和手机的取景位置。

关闭 JavaScript 或系统开启“减少动态效果”时仍会显示完整文案。切换页面时销毁动画定时器，后台标签页暂停动画。完整预览需重新运行 `npm start` 才能加载配置修改。

壁纸为本地文件 `public/images/seaside-banner.png`，使用内置 image_gen 工具生成。生成提示词：

> 生成一张写实摄影风格的海边风景博客横幅壁纸：开阔的蔚蓝海面、柔和的白色浪花、浅色沙滩与远处海岸，晴朗天空，蓝灰色调，自然光，清爽安静。超宽横向构图，重要景物集中在画面中间横向带状区域，适合裁切为约 4:1 网站横幅；中央海面留出干净空间供网页叠加白色文字。不要文字、水印、人物或汽车。


## 当前范围

已实现首页/动态分页、文章详情、代码复制、目录、图片灯箱、归档、分类标签、友链、关于、404、三种主题、移动导航、Pagefind 搜索、RSS 和站点地图。首页横幅使用本地生成的海边风景壁纸，其余示例插画为原创 SVG，不依赖外部图片服务。

本轮面向本地体验。赞赏/推广、自动部署、真实资料和照片的优化流程留待视觉确认后补齐；尚未完成全浏览器及 Lighthouse 正式验收。当前友链为推荐技术资源，没有虚构站长关系。没有配置个人社交账号或申请邮箱。

## 将来部署

构建时设置 `SITE_URL=https://你的域名`，子目录部署时另设 `BASE_PATH=/仓库名/`。默认站点地址为本机预览地址，不能直接当成正式 canonical 发布。`dist/` 是完整静态产物，替换部署，不叠加旧文件。正式发布前替换示例内容、设置域名并验证根路径/子路径及托管 404。

不要将私密草稿图片放进 `public/`；该目录内全部文件会直接复制到产物。正式私密草稿不应提交到公开仓库。

## 读书栏目与部署时同步

顶部导航的「读书」进入 `/reading/`，展示阅读概览、月度趋势、最近在读和完整书单。支持书名/作者搜索、读完标记筛选、排序和每页18本的分页；关闭 JavaScript 时显示全部书籍。

### 每次部署更新

`.github/workflows/deploy-pages.yml` 在推送到 `main` 或手动运行时执行：

1. 安装依赖。
2. 使用 `WEREAD_API_KEY` 获取阅读统计、完整分页笔记书目、书架和逐本阅读进度。
3. 合并版本并校验数据，成功后原子替换 `src/data/reading.json`。
4. 类型检查、测试、构建、生成搜索索引并检查站内链接。
5. 上传 `dist/`，发布到 GitHub Pages。

密钥只注入同步步骤。没有定时任务；每次完整部署都会同步。任一查询失败、分页不完整、密钥缺失/失效、接口要求升级或构建检查失败，都会停止部署，已发布的网站继续保留。临时网络错误、HTTP 429和5xx最多请求3次。

### 首次启用 GitHub Pages

1. 在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 在 **Settings → Secrets and variables → Actions → New repository secret** 中添加 `WEREAD_API_KEY`，填入微信读书密钥。不要把密钥写入代码或工作流。
3. 将代码推送至 `main`；或在 **Actions → Deploy blog to GitHub Pages → Run workflow** 手动运行。

工作流从 `actions/configure-pages` 读取域名和子路径，适配 `https://funlee.github.io/blog/`、用户主页仓库和已在 Pages 设置的自定义域名。Astro 的 `SITE_URL` 和 `BASE_PATH` 由该步骤提供。

需要再次刷新数据时，使用 Run workflow 或重新运行工作流。同步、构建和发布放在同一个 job，失败后重新运行也会先同步，避免复用旧产物。首次配置 GitHub Pages 及 secret 后，才具备线上发布条件。

### 本地更新与数据维护

本地 `npm run build` 使用现有快照，不要求密钥。要同步本地数据，可在已忽略的 `.env` 中配置 `WEREAD_API_KEY`，或通过环境变量提供，然后执行：

```bash
npm run sync:reading
npm run check
npm test
npm run build
```

- CI 更新的 JSON 只存在于本次构建目录，不自动提交回仓库。线上数据可以比仓库中的快照新；需要保存最新本地快照时手动同步并提交。
- `src/data/reading.json` 只保留公开展示字段，没有 API Key、设备信息、私密标记或笔记正文。封面来自微信读书返回的远程图片地址。
- 原始书单经过审核，合并后为254部作品、261个版本；同步后数量可增长。排除公众号以及没有阅读或笔记记录的条目；套装按一本计。同步会重新查询仓库快照里已知的历史书籍，防止仅因移出书架而丢失；从未保存且已移出书架、无笔记的历史书目仍可能缺失。
- `src/data/reading-editions.json` 保存已确认的版本 ID 分组。新版本还会按书名与作者匹配，去掉末尾“修订版”等明确版本标签；不合并上下卷、不同作者或仅主题相似的书籍。无法明确匹配的新版本需在分组文件中人工确认。
- `versions[].progress` 是0—100的百分数，`markedFinished` 独立于进度。作品显示最高版本进度；任一版本标记读完时显示「已标记读完」。展开可查看各版本。
- `summary` 的时长、天数和笔记采用微信读书原始总量，范围不限于当前书单；所有时长以秒保存。月度分桶只用于趋势，不反算年度总量。
- 页面更新时间、年份、月度截止日期和最近在读会随快照自动变化。最近在读选择最近更新、未标记读完且进度介于1%和99%之间的版本；没有符合条件的书时隐藏该区块。
- 接口的 `skill_version` 当前为1.0.5。如果服务器要求升级，脚本会中止；核对官方技能新文档并更新实现、版本号与测试后再部署，不会在 CI 中执行远程升级指令。

部署参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Astro GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)。
