# Repository Guidelines

## Project Structure & Module Organization
Keep runtime code inside `src/`, grouping related agents under `src/agents/`, shared orchestration logic under `src/pipelines/`, and utilities under `src/common/`. Mirror every new module with a matching test file in `tests/`. Place prompt templates, sample datasets, and fixtures under `assets/` so contributors can reuse them without guessing file locations. Use `docs/` for design notes or sequence diagrams when proposing multi-agent flows. When introducing a package, include an `__init__.py` that surfaces only the public entry points.

## Build, Test, and Development Commands
- `python -m pip install -r requirements.txt`: install or update dependencies before hacking on the agents.
- `python -m pytest`: run the entire automated suite; add `-k pattern` for targeted runs during tight loops.
- `ruff check src tests` and `ruff format src tests`: lint and format Python sources; run before each push to keep diffs clean.
- `python -m demollm.app`: smoke-test the local entry point once a feature branch is ready; pipe `--config configs/dev.yaml` to exercise custom agent graphs.

## Coding Style & Naming Conventions
Use 4-space indentation, type hints on every public function, and Google-style docstrings for agent behaviors. Modules, files, and functions use `snake_case`; classes use `PascalCase`; constants stay in `UPPER_SNAKE_CASE`. Keep configuration objects immutable (prefer `dataclasses.dataclass(frozen=True)`). Expose side-effecting helpers through dedicated service classes instead of free functions to simplify mocking.

## Testing Guidelines
Write tests with `pytest`, naming files `test_<module>.py` and functions `test_<behavior>`. Target ≥85% statement coverage for new features; add regression tests for every bug fix. Use `pytest --maxfail=1 -n auto` before opening a PR to catch flaky concurrency issues early. Store golden prompts or transcripts under `tests/fixtures/` and load them via `pkg_resources` to keep paths stable.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Limit commits to a single logical change and describe observable behavior, e.g., `feat: add retrieval-augmented summarizer agent`. Every PR must include context, linked issue or task ID, test evidence (command + outcome), and screenshots/logs when touching UX surfaces. Request at least one review before merging and rebase onto the latest `main` to avoid noisy merge commits.

## Security & Configuration Tips
Never commit API keys or dataset credentials; load them from `.env` via `python -m dotenv run`. Treat YAML configs as code—validate schema changes and document default values in `docs/config.md`. When sharing logs, redact user data and truncate to the minimum required snippet.
