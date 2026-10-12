// Apply the deployment prefix to rendered Markdown links and images.
export default function markdownBasePath(base = "/") {
  const prefix = base.replace(/\/$/, "");
  return {
    name: "deployment-base-path",
    element: {
      filter: ["a", "img"],
      visit(node, ctx) {
      if (!prefix) return;
      for (const key of ["href", "src"]) {
        const value = node.properties?.[key];
        if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) continue;
        const alreadyPrefixed = value === prefix || value.startsWith(prefix + "/") ||
          value.startsWith(prefix + "?") || value.startsWith(prefix + "#");
        if (!alreadyPrefixed) ctx.setProperty(node, key, prefix + value);
      }
      },
    },
  };
}
