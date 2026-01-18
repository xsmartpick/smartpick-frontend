# Claude Skills for SmartPick Frontend

This directory contains Agent Skills following the [Vercel Labs agent-skills](https://github.com/vercel-labs/agent-skills) format. These skills help AI agents understand and apply project-specific best practices.

## Available Skills

### smartpick-react-patterns

Comprehensive React 19 patterns and best practices for SmartPick Frontend.

**Use when:**
- Writing new React components
- Refactoring existing code
- Reviewing pull requests
- Adding animations or styling
- Managing application state

**Covers:**
- Animation patterns (Framer Motion with LazyMotion)
- Styling and color system (Pastel with TailwindCSS v4)
- State management (Jotai + TanStack Query)
- Component organization
- File-based routing
- Import path conventions

## Skill Format

Each skill follows the Agent Skills specification:

```
skills/
└── [skill-name]/
    ├── SKILL.md              # Agent instructions (required)
    ├── scripts/              # Automation helpers (optional)
    └── references/           # Supporting docs (optional)
```

## Priority Levels

Rules are categorized by impact:
- **CRITICAL**: Must be followed - violations will cause issues
- **HIGH**: Important for maintainability and consistency
- **MEDIUM**: Recommended for better DX and code quality
- **LOW**: Nice-to-have improvements

## Adding New Skills

1. Create a new directory under `.claude/skills/`
2. Add a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: skill-name
description: Brief description
license: MIT
metadata:
  author: Your Name
  version: 1.0.0
---
```

3. Organize content with:
   - Clear "Use when" scenarios
   - Categorized rules with priorities
   - Code examples (good vs bad)
   - Rationale for each rule

## Integration

These skills are automatically loaded by Claude Code CLI and other compatible AI agents. No manual setup required.

## References

- [Agent Skills Specification](https://agentskills.io/)
- [Vercel Labs Agent Skills](https://github.com/vercel-labs/agent-skills)
- [Project Documentation](../../docs/)
