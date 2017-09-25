# bedrock-test ChangeLog

## 2.0.0 - 2017-09-25

### Changed
- **BREAKING** removed the postinstall script that was responsible for creating
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
