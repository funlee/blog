---
publishedAt: "2021-06-22T00:00:00+08:00"
source: "yuque"
sourceId: "yhyhwb:2021-06-22:1"
sourceTitle: "MT 工作日志"
sourceUrl: "https://www.yuque.com/funlee/zbsm7e/yhyhwb"
dateBasis: "entry"
images: []
---

完成了 EnhancedDatePicker 组件的开发，踩了很多坑，今天主要是解决按需加载的坑，记录一下这个组件开发的一些细节

1. 采用 antd 的 DatePicker 组件进行封装

1. 核心是实现上半年、下半年这种业务场景

1. 为了保留【年】的选择功能，选择了 picker='month' ，并利用 monthCellRender 这个 API 进行弹出面板的改写

1. 当采用按需加载就会出现弹出面板里无法进行日期的选择，经排查是外层 div 容器设置了 pointer-event: none，采用 CSS 覆盖此样式属性后，发现面板无法收起，最终改为引入了 ~/antd/lib/style/index.css 和 ~/antd/lib/date-picker/style/index.css 后才将交互逻辑得以完整实现，此为第一个坑

1. 第二个坑是利用 monthCellRender 改写了弹出层面板，发现改写的只是 td 结点下子节点，而 td 这个标签是无法进行改写的，这是 antd 组件内部控制的，td 标签上有个 title 属性，会将原始数据给展示出来(hover 的时候)，这个是必须要解决的，多方尝试无果后，只有利用 js 暴力修改 html。

```js
const onHalfYearPanelChange = () => {
  deleteTitle()
}

const onHalfYearOpenChange = (open) => {
  if (open) { // 关闭时，不处理
    setTimeout(() => { // 等待 dom 加载完
      deleteTitle()
    }, 200)
  }
}

const deleteTitleCount = 0；
  
const deleteTitle = () => {
  // 最多只执行 4 次
  if (deleteTitleCount > 4) {
    deleteTitleCount = 0;
    return;
  }

  try {
    const container = document.querySelector('.rc-biz-enhancedDatePicker-dropdown-halfyear')
    .querySelector('.ant-picker-month-panel')

    if (container) {
      container.querySelectorAll('td').forEach((ele) => {
        ele && ele.setAttribute('title', '')
      })
    }
  } catch (error) {
    deleteTitleCount += 1;
    setTimeout(() => {
      deleteTitle()
    }, 200)

    throw Error(error)
  }
}

```
