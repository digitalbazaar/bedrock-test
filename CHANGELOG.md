# bedrock-test ChangeLog

## 8.0.3 - 2022-04-xx

### Fixed
- Fix framework filter.

## 8.0.2 - 2022-04-29

### Fixed
- Fix command line option handling.

## 8.0.1 - 2022-04-28

### Fixed
- Use `node:` imports internally.

## 8.0.0 - 2022-04-28

### Changed
- **BREAKING**: Require `@bedrock/core@6` peer dep.

## 7.0.5 - 2022-04-27

### Fixed
- Support non-existence of `email` transport when setting logger config.

## 7.0.4 - 2022-04-01

### Fixed
- Use `jsdoc-to-markdown@7`.

## 7.0.3 - 2022-04-01

### Fixed
- Avoid segfault with dynamic imports from mocha CJS file.

## 7.0.2 - 2022-03-31

### Fixed
- Remove unused dep `esm`.

## 7.0.1 - 2022-03-31

### Fixed
- Remove deprecated `require` export that should
  have been removed in `7.0.0`.

## 7.0.0 - 2022-03-31

### Changed
- **BREAKING**: Rename package to `@bedrock/test`.
- **BREAKING**: Convert to module (ESM).
- **BREAKING**: Update peer deps:
  - `@bedrock/core@5`.

### Removed
- **BREAKING**: Remove unused grunt dependencies.
- **BREAKING**: Remove `require` export.

## 6.1.0 - 2022-03-30

### Changed
- Update peer deps:
  - `bedrock@4.5`.
- Update internals to use esm style and use `esm.js` to
  transpile to CommonJS.

## 6.0.0 - 2021-09-21

### Changed
- **BREAKING**: Updated to latest mocha (9.x) and grunt-shell (3.x).
- **BREAKING**: Require bedrock peer dep of 4.4.x.

## 5.4.0 - 2021-06-01

### Changed
- Update `grunt` deps to address [CVE-2020-7729](https://nvd.nist.gov/vuln/detail/CVE-2020-7729).

## 5.3.2 - 2020-12-05

### Fixed
- Fix use of child logger.

## 5.3.1 - 2020-12-04

### Fixed
- Fix usage of `logger.debug`.

## 5.3.0 - 2020-04-28

### Changed
- Use mocha@7.

## 5.2.0 - 2020-02-25

### Changed
- Improve output of errors with circular references in assertNoError helper.

## 5.1.0 - 2020-02-04

### Added
- Export `test` API.

### Fixed
- Replace deprecated `runOnceAsync` call with `runOnce`.

## 5.0.0 - 2019-12-12

### Changed
- **BREAKING**: Replace deprecated `useColors` mocha option with `color`.

## 4.0.2 - 2019-11-08

### Changed
- Update max bedrock dependency.

## 4.0.1 - 2019-11-08

### Changed
- Update to latest bedrock events API.

## 4.0.0 - 2019-10-22

### Changed
- **BREAKING**: Refactor for use with bedrock@2.
- Dependencies for the mocha test framework now reside here.

## 3.0.0 - 2019-10-17

### Changed
- **BREAKING**: Remove HTTPSignatures helpers and dependencies.

## 2.1.0 - 2018-09-18

### Added
- `helpers.createHttpSignatureRequest` API for assisting in the creation of
HTTPSignatures requests.

### Changed
- Use child logger.

## 2.0.0 - 2017-09-25

### Changed
- **BREAKING**: Remove the postinstall script that was responsible for creating
a symlink to the parent module. Use a `file:..` dependency in the package file
for the test suite. v5.3+ creates a symlink. Earlier versions of npm will
copy the target module instead which is acceptable when doing CI testing. Keep
this difference in mind when doing test development.

## 1.2.0 - 2017-02-15

### Added
- Add grunt dependencies which allows for `Gruntfile.js` to be easily added
to test frameworks.

## 1.1.2 - 2017-01-19

### Changed
- Improve error handling when loading test config.

## 1.1.1 - 2016-10-27

### Fixed
- Check for existence of `config.protractor`.

## 1.1.0 - 2016-10-27

### Added
- Support for bower packages.
- Add `--test-config` command line option.

## 1.0.0 - 2016-09-14

- See git history for changes.
