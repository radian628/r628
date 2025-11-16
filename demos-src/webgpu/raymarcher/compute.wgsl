struct B {
  test: array<vec4u, 4>,
}

struct Params {
  size: vec2<u32>,
  rand: vec2f,
  transform: mat4x4f,
  transformInv: mat4x4f,
  lastTransformInverse: mat4x4f,
  lastTransform: mat4x4f,
  brightnessFactor: f32,
  shouldReset: u32,
  aspect: f32,
}

@group(0) @binding(0) var tex: texture_storage_2d_array<rgba32float, write>;
@group(0) @binding(1) var prevTex: texture_storage_2d_array<rgba32float, read>;

@group(1) @binding(0) var<uniform> params : Params;

fn rand(co: vec2f) -> f32 {
  return fract(sin(dot(co, vec2f(12.9898, 78.233))) * 43758.5453); 
}

fn r(hsv: vec3f) -> f32 {
  return pow(cos(hsv.x * 3.141592 * 2.0) * 0.5 * hsv.y + 0.5 * hsv.z, 0.6);
}

fn hsl2rgb(hsl: vec3f) -> vec3f {
  return vec3f(
    r(hsl),
    r(hsl - 0.33333333),
    r(hsl - 0.66666666)
  );
}

@compute @workgroup_size(8, 8, 1) fn computeSomething(
  @builtin(global_invocation_id) id: vec3<u32>
) {

  var value: vec3f = vec3f(0.0);

  let idnorm = vec2f(id.xy) / vec2f(params.size.xy);

  let fractpos = idnorm + params.rand / vec2f(params.size.xy);

  var originalPos = (vec4f(0.0, 0.0, 0.0, 1.0) * params.transform).xyz;
  var originalDir = (
    vec4(normalize(vec3f(1.0, params.aspect, 1.0) * vec3f(fractpos * 2.0 - 1.0, 1.0)), 0.0) 
    * params.transform
  ).xyz;

  let dofDistance = 2.0; 

  let targetPos = originalPos + originalDir * dofDistance;
  let confusedPos = originalPos + pow(vec3f(
    rand(idnorm + params.rand),
    rand(idnorm + params.rand - 0.5),
    rand(idnorm + params.rand - 1.5),
  ), vec3f(1.0)) * 0.0;

  var pos = confusedPos;
  var dir = normalize(targetPos - confusedPos);
      
  var normal: vec3f;
  var didHit: bool;
  var emission = vec3f(0.0);
  let lightdir = normalize(vec3f(1.0, 1.0, -1.0));
  var totaldist = 0.0;

  for (var i = 0u; i < 1u; i++) {
    let hit = marchRay(pos, dir, 256u);
    totaldist += distance(pos, hit.pos);
    let olddir = dir;
    dir = refract(
      dir, hit.normal,
      select(1.33, 1.0 / 1.33, hit.inside)
    );
    if (all(dir == vec3f(0.0))) {
      dir = reflect(olddir, hit.normal);
      pos = hit.pos + hit.normal * 0.001;
    } else {
      pos = hit.pos - hit.normal * 0.001 * select(-1.0, 1.0, hit.inside);
    }

    value += dot(normalize(vec3f(1.0)), dir) * vec3f(1.0);
  }

  let prevcol = textureLoad(prevTex, id.xy, 0u);
  let prevpos = textureLoad(prevTex, id.xy, 1u);
  let prevalbedo = textureLoad(prevTex, id.xy, 2u);
  let prevnormal = textureLoad(prevTex, id.xy, 3u);

  let currColor = vec4f(value / 1.0, 1.0);
  let mixColor = prevcol + currColor;

  if (params.shouldReset == 1u) {
    textureStore(tex, id.xy, 0u, currColor);
    textureStore(tex, id.xy, 1u, vec4f(
      pos,
      1.0
    ));
    textureStore(tex, id.xy, 2u, vec4f(0.0)); // albedo
    textureStore(tex, id.xy, 3u, vec4f(0.0)); // normal
  } else {
    textureStore(tex, id.xy, 0u, mixColor);
    textureStore(tex, id.xy, 1u, vec4f(
      pos,
      prevpos.w + 1.0
    ));
    textureStore(tex, id.xy, 2u, prevalbedo + currColor); // albedo
    textureStore(tex, id.xy, 3u, vec4f(normal, 1.0)); // normal
  }
}

struct HitInfo {
  hit: bool,
  pos: vec3f,
  normal: vec3f,
  inside: bool,
}

fn marchRay(
  pos: vec3f,
  dir: vec3f,
  iters: u32
) -> HitInfo {
  var posTemp = pos;
  for (var i = 0u; i < iters; i++) {
    let dist = sdf(posTemp);
    posTemp += dir * abs(dist);
  }

  let distSample = sdf(posTemp);

  let normal = normalize(vec3f(
    sdf(posTemp + vec3f(0.01, 0.0, 0.0)) - distSample,
    sdf(posTemp + vec3f(0.0, 0.01, 0.0)) - distSample,
    sdf(posTemp + vec3f(0.0, 0.0, 0.01)) - distSample,
  ));

  return HitInfo(
    abs(distSample) < 0.01,
    posTemp,
    normal,
    distSample < 0.0
  );
}

// MARCH_FUNCTION 