# Social Income - Survey Tool

The survey tool is in development.

## Development

### Quick start

**Always run the commands from the root of the mono-repository**, as
there are dependencies to other projects in the workspace.

- All commands will including creating a build of `/ui` which is
  required as the ui components are used in the survey tool.
- The UI documentation is automatically served at `localhost:6006` as
  reference during development.
- If your making changes in `/ui`, those changes are only available
  after rebuilding the `/ui` (hence restarting `survey-serve`).

```sh
# Development. Starts the survey dev server at localhost:6007 and the ui documentation at localhost:6006
$ make survey-serve

# Production build
$ make survey-build
```
