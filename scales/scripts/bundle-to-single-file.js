import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const outputFile = path.join(distDir, 'index.html');

// Read the built HTML file
const htmlFile = path.join(distDir, 'index.html');
if (!fs.existsSync(htmlFile)) {
  console.error('❌ Build files not found. Run "npm run build" first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlFile, 'utf-8');

// Helper to resolve file paths
function resolveAssetPath(assetPath, distDir) {
  if (assetPath.startsWith('/')) {
    return path.join(distDir, assetPath.slice(1));
  }
  // Handle relative paths from HTML location
  const htmlDir = path.dirname(htmlFile);
  return path.resolve(htmlDir, assetPath);
}

// Find and inline all CSS files
const cssRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
let cssMatch;
const cssReplacements = [];

while ((cssMatch = cssRegex.exec(html)) !== null) {
  const cssPath = cssMatch[1];
  const fullCssPath = resolveAssetPath(cssPath, distDir);
  
  if (fs.existsSync(fullCssPath)) {
    const cssContent = fs.readFileSync(fullCssPath, 'utf-8');
    cssReplacements.push({
      original: cssMatch[0],
      replacement: `<style>${cssContent}</style>`
    });
    console.log(`  ✓ Inlined CSS: ${cssPath}`);
  } else {
    console.warn(`  ⚠ CSS file not found: ${fullCssPath}`);
  }
}

// Apply CSS replacements
cssReplacements.forEach(({ original, replacement }) => {
  html = html.replace(original, replacement);
});

// Find and inline all JS files
const jsRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi;
let jsMatch;
const jsFiles = [];

while ((jsMatch = jsRegex.exec(html)) !== null) {
  const jsPath = jsMatch[1];
  const fullJsPath = resolveAssetPath(jsPath, distDir);
  
  if (fs.existsSync(fullJsPath)) {
    const jsContent = fs.readFileSync(fullJsPath, 'utf-8');
    jsFiles.push({
      original: jsMatch[0],
      content: jsContent
    });
    console.log(`  ✓ Inlined JS: ${jsPath}`);
  } else {
    console.warn(`  ⚠ JS file not found: ${fullJsPath}`);
  }
}

// Find the position of the closing </body> tag BEFORE inlining JavaScript
// This prevents matching </body> strings inside the JavaScript code
// We need to find the LAST </body> that's not inside a script tag
let bodyCloseIndex = -1;
const bodyCloseRegex = /<\/body>/gi;
let match;
let lastValidMatch = null;

while ((match = bodyCloseRegex.exec(html)) !== null) {
  // Check if this </body> is inside a script tag by looking backwards
  const beforeMatch = html.substring(0, match.index);
  const lastScriptOpen = beforeMatch.lastIndexOf('<script');
  const lastScriptClose = beforeMatch.lastIndexOf('</script>');
  
  // If there's an unclosed script tag before this </body>, skip it
  if (lastScriptOpen > lastScriptClose) {
    continue;
  }
  
  // This is a valid closing </body> tag (keep track of the last one)
  lastValidMatch = match;
}

if (lastValidMatch) {
  bodyCloseIndex = lastValidMatch.index;
}

// Remove original script tags from head
jsFiles.forEach(({ original }) => {
  html = html.replace(original, '');
});

// Add all JS files as a single script at the end of body
if (jsFiles.length > 0) {
  const allJsContent = jsFiles.map(f => f.content).join('\n');
  // Escape </script> tags in JavaScript to prevent premature script closure
  const escapedJsContent = allJsContent.replace(/<\/script>/gi, '<\\/script>');
  
  // Insert before the closing </body> tag we found earlier
  if (bodyCloseIndex !== -1) {
    // Adjust index if we removed script tags (they were before </body>)
    html = html.substring(0, bodyCloseIndex) + 
           `  <script>${escapedJsContent}</script>\n` + 
           html.substring(bodyCloseIndex);
  } else {
    // Fallback: try to find </body> at the end (shouldn't happen, but just in case)
    html = html.replace(/<\/body>(?=\s*<\/html>|$)/i, `  <script>${escapedJsContent}</script>\n</body>`);
  }
}

// Remove any remaining empty script tags or module script tags
html = html.replace(/<script[^>]*type=["']module["'][^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*><\/script>/g, '');

// Clean up any remaining asset references
html = html.replace(/<link[^>]*>/g, '');

// Write the standalone file to dist directory
fs.writeFileSync(outputFile, html, 'utf-8');
console.log(`\n✅ Created standalone file: ${outputFile}`);

// Remove assets directory
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true, force: true });
  console.log(`   ✓ Removed assets directory`);
}

console.log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log(`   You can now share this single HTML file!`);

