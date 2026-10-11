# ahmedalezabi1.github.io

Personal portfolio of **Ahmed Ali Alezabi**, AI & ML engineer.
Live at **https://ahmedalezabi1.github.io**

A static site (HTML, CSS and vanilla JavaScript, no build step), hosted on GitHub Pages.

## Editing

| What | Where |
|---|---|
| Projects and case-study content | `js/projects.js` (one object per project) |
| Email, LinkedIn, CV, photo | `PROFILE` at the top of `js/main.js` |
| Timeline (About section) | `TIMELINE` in `js/main.js` |
| Colours, fonts, layout | `css/style.css` (design tokens at the top) |
| Hero smoke effect | `js/smoke.js` |

Each case study is served from `project.html?id=<project id>`.

To preview locally:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
