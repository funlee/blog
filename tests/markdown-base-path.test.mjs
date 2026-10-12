import test from 'node:test';
import assert from 'node:assert/strict';
import markdownBasePath from '../src/lib/markdown-base-path.mjs';
function apply(base, tree) {
  const plugin = markdownBasePath(base);
  function visit(node) {
    if (node.type === 'element') plugin.element.visit(node, {setProperty(n,k,v){ n.properties[k]=v; }});
    for (const child of node.children || []) visit(child);
  }
  visit(tree);
}

test('Markdown links and images honor Pages base without rewriting external URLs or code', () => {
  const values=['/images/a.png','/posts/example/?q=1#part','/','//cdn.example/a.png','https://example.com/a','#part','../other/','/blog/posts/example/','/blog?x=1','/blog#top','/blogger/'];
  const tree={type:'root',children:values.map(value=>({type:'element',properties:{href:value,src:value},children:[]}))};
  tree.children.push({type:'text',value:'<img src="/images/example.png">'});
  apply('/blog/', tree);
  const expected=['/blog/images/a.png','/blog/posts/example/?q=1#part','/blog/','//cdn.example/a.png','https://example.com/a','#part','../other/','/blog/posts/example/','/blog?x=1','/blog#top','/blog/blogger/'];
  assert.deepEqual(tree.children.slice(0,-1).map(n=>n.properties.href),expected);
  assert.deepEqual(tree.children.slice(0,-1).map(n=>n.properties.src),expected);
  assert.equal(tree.children.at(-1).value,'<img src="/images/example.png">');
  apply('/blog/', tree);
  assert.deepEqual(tree.children.slice(0,-1).map(n=>n.properties.href),expected);
});

test('Root deployments preserve Markdown URLs',()=>{
  const tree={type:'element',properties:{href:'/posts/example/'},children:[]};
  apply('/', tree);
  assert.equal(tree.properties.href,'/posts/example/');
});

 test('Astro Markdown rendering preserves prose and prefixes URLs', async () => {
  const { createSatteriMarkdownProcessor } = await import('@astrojs/markdown-satteri');
  const renderer = await createSatteriMarkdownProcessor({hastPlugins:[markdownBasePath('/blog/')]});
  const result = await renderer.render('A personal note.\n\n![photo](/images/photo.png)\n\n[post](/posts/example/)');
  assert.match(result.code, /A personal note/);
  assert.match(result.code, /src="\/blog\/images\/photo.png"/);
  assert.match(result.code, /href="\/blog\/posts\/example\/"/);
});
