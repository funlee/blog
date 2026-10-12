export const site = {
  name: "李逸辰的部落格",
  author: "李逸辰",
  description: "记录技术探索，也收藏生活里的微小光亮。",
  banner: {
    image: "images/seaside-banner.png", // 相对于 public/ 的路径
    position: "center 55%",
    mobilePosition: "center 55%",
    quotes: [
      "干，不一定赢；但不干，肯定输！",
      "不去试试，咋就知道自己不行？",
      "40来岁，正是闯的年纪！",
      "你只管努力，其他的交给天意！",
      "只要持续努力，每个人，都有机会逆天改命！",
      "失败本身并不可怕，正视自己内心的恐惧，才是关键！",
      "比失败更可怕的，是失去重新站起来的勇气！",
      "只有发自内心的热爱，百折不挠的坚持，才能创造奇迹！",
      "改变，本身就是希望！",
      "路可以重新走，梦可以重新做，未来可以重新书写！",
      "这个世界不是强者恒强，后来者总有机会超越！",
      "只要坚持做难而正确的事，时间会给出答案！",
      "看五年，想三年，认认真真干好一两年！",
      "高目标牵引，志存高远才能突破极限！",
      "取乎其上，得乎其中！",
      "热爱才是做好所有事情的源泉！",
    ],
    typewriter: {
      enabled: true,
      typeSpeed: 130, // 每个字的输入间隔，单位毫秒
      deleteSpeed: 65,
      holdTime: 2600, // 完整句子的停留时长
      startDelay: 500,
      nextDelay: 450,
    },
  },
  announcement: "这里是部落格的第一版。愿每一次记录，都让想法更清晰一点。",
  startedAt: "2026-10-12",
  pageSize: 9,
  momentPageSize: 20,
  email: "",
  socials: [] as { name: string; url: string }[],
};
export const categories = [
  {
    id: "engineering",
    name: "技术探索",
    description: "把问题拆开，把答案写下来。",
  },
  {
    id: "notes",
    name: "思考随笔",
    description: "给尚未成形的想法，留一点空间。",
  },
  {
    id: "life",
    name: "生活片段",
    description: "在平凡的日子里，发现值得收藏的瞬间。",
  },
];
export const tags = [
  { id: "astro", name: "Astro" },
  { id: "frontend", name: "前端开发" },
  { id: "design", name: "设计" },
  { id: "writing", name: "写作" },
  { id: "life", name: "日常" },
  { id: "tools", name: "工具" },
];
export const categoryName = (id: string) =>
  categories.find((c) => c.id === id)?.name || id;
export const tagName = (id: string) =>
  tags.find((c) => c.id === id)?.name || id;
