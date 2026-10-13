---
slug: "understanding-user-experience"
title: "什么是用户体验，如何量化用户体验"
description: "从尼尔森可用性原则、用户体验蜂窝模型和可用性问题出发，整理观察与评价用户体验的维度。"
publishedAt: "2021-01-31T10:57:00+08:00"
category: "notes"
tags: ["design"]
source: "yuque"
sourceId: "ifog8k"
sourceTitle: "【31】什么是用户体验，如何量化用户体验"
sourceUrl: "https://www.yuque.com/funlee/eceni8/ifog8k"
---

用户体验可以理解为：人们在使用或预期使用产品、系统与服务时，产生的感受、认知和回应。

谈用户体验，需要把这个宽泛的概念拆成可以观察的问题。下面整理几组常用的原则与维度。

## 尼尔森十大可用性原则

### 1. 系统状态可见

Visibility of System Status

让界面的内容、状态和变化可见。用户找不到信息、不知道当前情况、不明白发生了什么，都是需要改进的地方。

空白页、加载页应当有合适的提示，骨架屏也是一种选择。

### 2. 系统与现实世界相匹配

Match Between the System and the Real World

使用用户熟悉的语言、概念和顺序，让操作符合真实使用场景。设计者觉得理所当然的术语，对用户未必清楚。

### 3. 用户控制与自由

User Control and Freedom

用户需要了解并掌控当前情况，也需要方便的退出、取消或撤销操作。

例如视频播放界面，除了播放和暂停，还要考虑用户在不同场景下的控制需求。早期 iPhone 的 Home 键也是一个直观例子：不知道该怎么办时，按下它就能回到桌面。

### 4. 一致性与标准

Consistency and Standards

同一个产品应当使用一致的规范与逻辑，减少学习成本。

例如，同一类用户不要在一个页面叫“粉丝”，到另一个页面又改成“关注者”；确定按钮的位置和颜色表达的含义，也应保持一致。

### 5. 预防错误

Error Prevention

通过合理的约束、默认值和必要提醒，减少用户犯错的机会。

设计者对产品十分熟悉，可能觉得某些提示多余，但新用户未必理解所有规则。对后果严重的操作尤其需要谨慎设计。

### 6. 识别优于回忆

Recognition Rather Than Recall

把必要信息放在用户能看见或容易找到的地方，减少记忆负担。

例如删除照片时，除了询问是否删除，还可以提示照片数量和操作对象，帮助用户确认当前动作。

### 7. 灵活性与使用效率

Flexibility and Efficiency of Use

同时考虑新手和熟练用户。清晰的常规操作帮助新手上手，快捷键等方式则可以提高熟练用户的效率。

### 8. 美观与简约设计

Aesthetic and Minimalist Design

让界面清晰、内容易读，帮助用户迅速找到需要的信息。

页面很花哨，却让人连按钮都分辨不出来，就得不偿失。排版还要照顾视觉轨迹，避免信息堆积和布局混乱。

### 9. 帮助用户识别、诊断并从错误中恢复

Help Users Recognize, Diagnose, and Recover from Errors

错误发生后，用用户能理解的语言说明问题，并给出可行的恢复方式。只有一个模糊的“操作失败”，并不能帮助用户继续完成任务。

### 10. 帮助与文档

Help and Documentation

考虑用户可能在什么时候产生疑问，在当下提供有针对性的帮助。除了集中放置帮助文档，也要让提示出现在需要它的地方。

以上原则可参考 [Nielsen Norman Group 的正式说明](https://www.nngroup.com/articles/ten-usability-heuristics/)。

### 补充：恢复现场

适应碎片化使用习惯，在切换、退出和返回时保留必要状态，也是一条有价值的设计建议。

例如编辑器自动保存草稿、阅读页面记住位置，都能减少中断带来的损失。“恢复现场”可以作为补充检查项，但不是尼尔森十大原则中的独立一项。

## 用户体验的不同维度

用户体验涉及的内容很广，可以借助模型，把讨论落到具体方面。

### Peter Morville 的蜂窝模型

![原笔记中的用户体验蜂窝模型，包含 useful、usable、desirable、findable、accessible、credible 和 valuable 七个维度](/images/posts/user-experience/honeycomb.png)

- **有用性 Useful**：面对的需求是真实的，产品能够带来实际帮助。
- **可用性 Usable**：用户能顺利使用功能。
- **吸引力 Desirable**：图形、品牌与形象等能否带来情感上的吸引。
- **可发现性 Findable**：用户能找到所需内容。
- **可访问性 Accessible**：让不同能力、包括有障碍的用户也能使用产品。
- **可信度 Credible**：让用户相信产品及其信息。
- **价值 Valuable**：为用户与组织带来价值。

原配图保留了当时的中文译法。其中 `accessible` 不只是“方便获得”，也涉及无障碍使用；`desirable` 则不宜简单等同于满意度。模型说明可参考 [Peter Morville：User Experience Design](https://semanticstudios.com/user_experience_design/)。

### 阅读《点石成金》时记录的问题

- **有用性**：能否帮助人们完成需要做的事情？
- **可学习性**：人们能否明白如何使用？
- **可记忆性**：每次再使用时，是否都要重新学习？
- **有效性**：能否完成任务？
- **效率**：完成任务所需的时间与精力是否合适？

这些问题提供了观察体验的角度。本篇笔记主要整理评价维度，尚未形成一套具体的量化指标与计算方法。

### 原笔记收集的两张关系图

![用户体验与产品创新设计涉及工业设计、艺术设计、心理学、信息与沟通技术等领域](/images/posts/user-experience/usability.png)

![用户体验设计涉及信息架构、界面设计、人机交互、可用性、心理学、商业因素、社会学与技术支持](/images/posts/user-experience/experience-model.png)

这两张图可以帮助理解用户体验涉及的学科与工作范围，不能直接当作一套量化评分标准。
