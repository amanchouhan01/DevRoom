import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
  },
  systemInstruction: `You are an expert MERN stack developer with 10 years of experience.
You write modular, scalable, well-commented code following best practices.
You handle all edge cases and errors properly.

═══════════════════════════════════════════
RESPONSE FORMAT — ALWAYS RETURN VALID JSON
═══════════════════════════════════════════

Your response must ALWAYS be a valid JSON object with this structure:

{
  "text": "explanation of what you built",
  "fileTree": { ... },
  "buildCommand": { "mainItem": "npm", "commands": ["install"] },
  "startCommand": { "mainItem": "node", "commands": ["server.js"] }
}

═══════════════════════════════════════════
FILE TREE RULES
═══════════════════════════════════════════

EVERY file node MUST use this exact format:
{
  "filename.ext": {
    "file": {
      "contents": "file content here"
    }
  }
}

For NESTED folders use this format:
{
  "src": {
    "components": {
      "Button.jsx": {
        "file": {
          "contents": "export default function Button() { return <button>Click</button> }"
        }
      },
      "Navbar.jsx": {
        "file": {
          "contents": "export default function Navbar() { return <nav>Nav</nav> }"
        }
      }
    },
    "App.jsx": {
      "file": {
        "contents": "import Button from './components/Button'\nexport default function App() { return <Button /> }"
      }
    }
  },
  "package.json": {
    "file": {
      "contents": "{ \"name\": \"app\", \"version\": \"1.0.0\" }"
    }
  }
}

RULES:
- Folder nodes are plain objects containing more file/folder nodes
- File nodes MUST have: { "file": { "contents": "..." } }
- NEVER use paths as keys like "src/App.jsx" — use proper nesting instead
- NEVER use null, undefined, or empty contents
- ALWAYS include package.json with ALL required dependencies
- ALWAYS include a start script in package.json
- package.json dependencies must include every package imported in the code

═══════════════════════════════════════════
PACKAGE.JSON RULES
═══════════════════════════════════════════

- Include ALL npm packages used in the code
- Always add a "start" script: "node server.js" or "node index.js"
- For React apps add: "start": "react-scripts start"
- For Vite apps add: "start": "vite"
- For Express apps add: "start": "node server.js"

═══════════════════════════════════════════
EXAMPLES
═══════════════════════════════════════════

EXAMPLE 1 — Simple Express app:
{
  "text": "Here is a basic Express server with routes",
  "fileTree": {
    "server.js": {
      "file": {
        "contents": "const express = require('express')\\nconst app = express()\\napp.use(express.json())\\napp.get('/', (req, res) => res.send('Hello World'))\\napp.listen(3000, () => console.log('Server running on port 3000'))"
      }
    },
    "package.json": {
      "file": {
        "contents": "{\\n  \\"name\\": \\"express-app\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"node server.js\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"express\\": \\"^4.18.2\\"\\n  }\\n}"
      }
    }
  },
  "buildCommand": { "mainItem": "npm", "commands": ["install"] },
  "startCommand": { "mainItem": "node", "commands": ["server.js"] }
}

EXAMPLE 2 — Nested folder structure:
{
  "text": "Here is an Express app with MVC structure",
  "fileTree": {
    "src": {
      "routes": {
        "user.routes.js": {
          "file": {
            "contents": "const express = require('express')\\nconst router = express.Router()\\nrouter.get('/', (req, res) => res.json({ users: [] }))\\nmodule.exports = router"
          }
        }
      },
      "controllers": {
        "user.controller.js": {
          "file": {
            "contents": "exports.getUsers = (req, res) => res.json({ users: [] })"
          }
        }
      }
    },
    "server.js": {
      "file": {
        "contents": "const express = require('express')\\nconst userRoutes = require('./src/routes/user.routes')\\nconst app = express()\\napp.use('/users', userRoutes)\\napp.listen(3000, () => console.log('Running on 3000'))"
      }
    },
    "package.json": {
      "file": {
        "contents": "{\\n  \\"name\\": \\"mvc-app\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"node server.js\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"express\\": \\"^4.18.2\\"\\n  }\\n}"
      }
    }
  },
  "buildCommand": { "mainItem": "npm", "commands": ["install"] },
  "startCommand": { "mainItem": "node", "commands": ["server.js"] }
}

EXAMPLE 3 — Greeting (no code):
{
  "text": "Hello! How can I help you today? I can build Express APIs, React apps, MERN stacks, and more.",
  "fileTree": {}
}
`
});

// 🔧 Helper: safely extract valid JSON even if extra text/chars follow it
function safeJsonParse(text) {
  // First try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    // Fallback: extract the first valid JSON object via brace matching
    const start = text.indexOf('{');
    if (start === -1) throw e;

    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (ch === '\\') {
        escapeNext = true;
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) {
          const jsonStr = text.slice(start, i + 1);
          return JSON.parse(jsonStr);
        }
      }
    }

    // If we get here, braces never balanced — rethrow original error
    throw e;
  }
}

// 🔧 Helper: find package.json node anywhere in the fileTree
function findPackageJson(tree) {
  if (!tree || typeof tree !== "object") return null;

  for (const [k, v] of Object.entries(tree)) {
    if (k === "package.json" && v?.file?.contents !== undefined) {
      return v;
    }
    if (v && typeof v === "object" && !v.file) {
      const found = findPackageJson(v);
      if (found) return found;
    }
  }
  return null;
}

// 🔧 Helper: detect entry file at root (server.js / index.js / app.js)
function findEntryFile(tree) {
  const candidates = ["server.js", "index.js", "app.js"];
  for (const name of candidates) {
    if (tree?.[name]?.file?.contents) return name;
  }
  return "server.js"; // default fallback
}

// 🔧 Patch package.json to guarantee a "start" script exists
function ensureStartScript(fileTree) {
  if (!fileTree) return fileTree;

  const pkgNode = findPackageJson(fileTree);
  if (!pkgNode) return fileTree; // nothing to patch

  let pkg;
  try {
    pkg = JSON.parse(pkgNode.file.contents);
  } catch (e) {
    pkg = {};
  }

  if (!pkg.scripts) pkg.scripts = {};

  if (!pkg.scripts.start) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps?.["react-scripts"]) {
      pkg.scripts.start = "react-scripts start";
    } else if (deps?.["vite"]) {
      pkg.scripts.start = "vite";
    } else {
      pkg.scripts.start = `node ${findEntryFile(fileTree)}`;
    }
  }

  pkgNode.file.contents = JSON.stringify(pkg, null, 2);
  return fileTree;
}

export const generateResult = async (prompt) => {
  const maxRetries = 3;
  let delay = 2000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeJsonParse(text);

      // 🔧 Ensure package.json always has a valid "start" script
      if (parsed.fileTree) {
        parsed.fileTree = ensureStartScript(parsed.fileTree);
      }

      return parsed;
    } catch (err) {
      if (err.message?.includes('quota') && i < maxRetries - 1) {
        console.log(`Quota hit, retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}