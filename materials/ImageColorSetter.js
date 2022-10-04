//@input Component.Image image
//@input vec4 color {"widget":"color"}


/** @type {Image} */
const _image = script.image;

/** @type {vec4} */
const _color = script.color;

_image.mainMaterial = _image.mainMaterial.clone();
_image.mainPass.baseColor = _color;