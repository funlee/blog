---
slug: "legacy-hundred-chickens"
title: "百钱买百鸡"
description: "用 JavaScript 循环求解百钱买百鸡问题。"
publishedAt: "2016-06-22T22:26:31+08:00"
category: "engineering"
tags: ["frontend"]
---

今有鸡翁一，值钱伍；鸡母一，值钱三；鸡鶵三，值钱一。凡百钱买鸡百只，问鸡翁、母、鶵各几何？答曰：鸡翁四，值钱二十；鸡母十八，值钱五十四；鸡鶵七十八，值钱二十六。又答：鸡翁八，值钱四十；鸡 母十一，值钱三十三，鸡鶵八十一，值钱二十七。又答：鸡翁十二，值钱六十；鸡母四、值钱十二；鸡鶵八十 四，值钱二十八。”

从现代数学观点来看，实际上是一个求不定方程整数解的问题。

下面是JS解决的办法，这里按公鸡、母鸡都至少买一只来枚举，非常easy：

```html
<script type="text/javascript">
  for (var i = 1; i <= 100; i++) {
    for (var j = 1; j <= 100; j++) {
      for (var k = 0; k <= 100; k++) {
        var sum1 = i + j + k;
        var sum2 = 5 * i + 3 * j + (1 / 3) * k;
        if (sum1 == 100 && sum2 == 100) {
          console.log(
            "买公鸡" +
              i +
              "只" +
              "，母鸡" +
              j +
              "只" +
              "，小鸡" +
              k +
              "只" +
              "\n"
          );
        }
      }
    }
  }
</script>
```
