const fs = require('fs');
let content = fs.readFileSync('worker/src/controllers/recommendations.controller.ts', 'utf8');
content = content.replace('...(profile.skills || []),', '...((profile.skills as string[]) || []),');
content = content.replace('...(profile.interests || [])', '...((profile.interests as string[]) || [])');
fs.writeFileSync('worker/src/controllers/recommendations.controller.ts', content);
