# 李逸辰的部落格

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
