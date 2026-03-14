# voy/lab

A monorepo of small tools, experiments, and interactive demos.

## Structure

- `index.html` — the **hub**: a directory page linking to every project. Always update it when adding a new project.
- Each subdirectory (e.g. `epilepsy-card/`, `block-boom/`) is one self-contained project.

## Starting a new project

1. Suggest 5 alternative project names and let the user pick before creating anything.
2. Create the subdirectory: `lab/<project-name>/`
3. Add an entry card to `index.html` (title, description, tags, href pointing to the new dir) under the appropriate `<h2>` section, or add a new section if needed.

## Renaming a project

1. Rename the directory.
2. Update the href, title, and any references in `index.html`.

## Committing and pushing

When the user says "commit" while working in a specific project subdirectory, stage and commit **only the files in that directory**. Use a single-line commit message prefixed with the project directory name:

```
eink-dashboard: add birthday section with today highlight and tests
markdown-viewer: fix drag-and-drop on Firefox
```

Before pushing, scan the staged diff for anything that looks like private data — real names, birth dates, credentials, personal identifiers, private URLs. If anything looks sensitive, **stop, flag it clearly, and ask to confirm** before running `git push`.

## Conventions

- **Web projects: vanilla JavaScript by default.** No framework unless the user asks (or the project already uses one, e.g. `scales/` uses React).
- Prefer single-file projects (`index.html`) when the scope allows it — no build step, no dependencies.
- Tags on hub cards reflect the tech used (e.g. `browser`, `canvas`, `node`, `chrome extension`, `react`).
