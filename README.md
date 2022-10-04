# lens-studio-helpers
This repo contains a series of helper scripts

## UI Helpers
Changes to the Snap UI framework:
* Removes `api` requirement for callback functions on buttons
* Moving off a button while holding down cancels the operation

## Material Helpers
Small scripts that modify the material properties on meshes. This is useful because modifying properties on material at runtime doesn't increase number of shaders

## Coroutine Manager
Enabled creating coroutines for delayed frame operations