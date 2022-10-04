//@input Component.RenderMeshVisual mesh
//@input vec4 color {"widget":"color"}


/** @type {RenderMeshVisual} */
const _mesh = script.mesh;

/** @type {vec4} */
const _color = script.color;

_mesh.mainMaterial = _mesh.mainMaterial.clone();
_mesh.mainPass.baseColor = _color;