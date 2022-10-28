# Valestory

Small library enabling you to write your unit tests in a declarative way. The library is designed to be fully extensible. In fact, built-in functionality itself uses the extension API provided to you.

To be framework agnostic, you need to provide an adapter (for now) yourself, passing required matchers to valestory.

# Example

```ts

```

# Roadmap

This library is in alpha state and brand-new. Thus it does not provide a lot out-of-the-box. The following features are on the roadmap:

- provide adapter for jasmine and jest via separate projects
- add support for negating tests via `.not.to(...)`
- add more common functionality, for different areas in separate projects
  - `valestory-dom`: valestory-extensions helping with pure html-javascript tests
  - `valestory-angular`: valestory-extensions helping with angular testing scenarios, or maybe migrating `@centigrade/ngtx` to use valestory as its foundation.
