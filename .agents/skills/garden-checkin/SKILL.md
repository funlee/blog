---
name: garden-checkin
description: 为本博客花园中的已有习惯打卡或补打卡。当用户明确要求给读书、运动等花园任务记录完成时使用。
---

# 花园打卡

维护本项目的 `src/data/garden.json`。保留已有习惯、历史记录和 v2 数据结构；`exportedAt` 现在表示数据更新时间。

## 确定任务和日期

- 用户必须明确打卡哪个任务。先用配套脚本的 `--list` 查看当前任务名称；不要把文档中的示例当成固定任务列表。
- 使用完整名称匹配。用户的简称只有唯一对应时才转换为完整名称；未指定、无法匹配或有歧义时，询问具体任务，不猜测、不新增习惯。
- 没有日期时默认北京时间（Asia/Shanghai）当天，不传 `--date`。今天、昨天、前天分别使用 `today`、`yesterday`、`day-before-yesterday`，由脚本在执行时计算。
- 明确的绝对日期转换为 `YYYY-MM-DD`；不明确的日期先澄清。未来日期和早于任务创建日的日期会被拒绝。
- 每个任务每天最多一次完成。已有 `done` 时提示已打卡；已有 `rest` 时按打卡指令改为 `done`，并告知从休息改为完成。

## 执行

从项目根目录运行（若不在根目录，先定位本 skill 所在的博客仓库）：

```sh
node .agents/skills/garden-checkin/scripts/checkin.mjs --list
node .agents/skills/garden-checkin/scripts/checkin.mjs --habit '读书'
node .agents/skills/garden-checkin/scripts/checkin.mjs --habit '运动' --date yesterday
node .agents/skills/garden-checkin/scripts/checkin.mjs --habit '读书' --date 2026-11-03
```

使用脚本写入数据，不手工重写整个 JSON。脚本会校验更新前后的数据、保留其他字段和记录、实际变更时更新 `exportedAt`，并以原子替换方式保存。重复打卡不改写文件或更新时间。

脚本失败时读取错误并处理明确原因；任务或日期不清楚就询问用户。若提示文件被其他打卡操作占用，不直接删除锁文件覆盖写入；等该操作完成后再重试。

`--file <path>` 仅用于明确指定的数据副本或隔离测试，正常打卡使用脚本默认的项目数据文件。测试和示例演练使用临时副本，不给真实数据新增记录。

## 反馈

根据脚本返回的 JSON，说明任务、实际日期、是否新增或已存在、累计完成次数；原状态为 `rest` 时说明状态变更。文件修改成功即可反馈，不必为每次打卡运行完整站点构建。

打卡维护本地数据；线上页面需后续发布才会更新。除非用户另有要求，不自动提交、推送或发布。创建任务、撤销打卡、记录休息或导入备份不属于本 skill 的打卡操作。
