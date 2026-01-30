# Changelog

All notable changes to the Unity Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-01-30

### Added

- **unity-testrunner skill**: Unity Test Framework CLI automation and test writing patterns
  - SKILL.md with CLI execution, NUnit basics, trigger conditions, exit codes
  - `references/cli-automation.md`: Full CLI option reference, Unity Hub path detection, CI/CD templates (GitHub Actions, GitLab CI)
  - `references/test-patterns.md`: NUnit attributes, EditMode/PlayMode patterns, async testing, mocking strategies
  - `references/result-parsing.md`: NUnit XML parsing, PowerShell scripts, reporting integration

### Changed

- Updated README to reflect 10 skills (previously 9)
- Updated plugin description to include test automation

## [1.3.0] - 2025-12-15

### Added

- **unity-collection-pool skill**: GC-free collection management with ListPool, DictionaryPool, HashSetPool
- **unity-textmeshpro skill**: TextMeshPro text rendering and typography optimization
- **unity-csharp-fundamentals skill**: Essential Unity C# patterns (TryGetComponent, SerializeField, RequireComponent)

## [2.0.0] - 2025-11-01

### Changed

- Restructured to skill-based architecture
- Separated unity-reactive → unity-r3 + unity-unirx
- Renamed unity-di → unity-vcontainer (library-specific naming)
- Reduced to 2 main coordinating agents (unity-developer, unity-dots-developer)

### Added

- 9 specialized skills covering async, reactive, DI, mobile, networking, performance, UI

## [1.0.0] - 2025-10-01

### Added

- Initial release with 9 specialized agents
- unity-async skill for Unity async patterns
