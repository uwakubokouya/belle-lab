const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/cast/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// replace `<PostCard key={post.id} {...post} />` with `<PostCard key={post.id} {...post} onFollowToggle={handleFollow} />`
// Note: only in timeline tab
const timelineTarget = `posts.map(post => (
                  <PostCard key={post.id} {...post} />
                ))`;
const timelineReplacement = `posts.map(post => (
                  <PostCard key={post.id} {...post} onFollowToggle={handleFollow} />
                ))`;

if (content.includes(timelineTarget)) {
    content = content.replace(timelineTarget, timelineReplacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('Successfully updated page.tsx to pass onFollowToggle to PostCard');
} else {
    // maybe different indents
    const regex = /posts\.map\(post\s*=>\s*\(\s*<PostCard key=\{post\.id\} \{\.\.\.post\}\s*\/>\s*\)\)/g;
    content = content.replace(regex, `posts.map(post => (\n                  <PostCard key={post.id} {...post} onFollowToggle={handleFollow} />\n                ))`);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('Successfully updated page.tsx to pass onFollowToggle to PostCard (using regex)');
}
