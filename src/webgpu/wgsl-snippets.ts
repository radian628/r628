export const WgslSnippets = {
  unitQuadSigned: {
    src: `const UNIT_QUAD_SIGNED = array(
    vec2( 1.0,  1.0),
    vec2( 1.0, -1.0),
    vec2(-1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0, -1.0),
    vec2(-1.0,  1.0),
)`,
  },
  unitQuadUnsigned: {
    src: `const UNIT_QUAD_UNSIGNED = array(
    vec2(1.0, 0.0),
    vec2(1.0, 1.0),
    vec2(0.0, 1.0),
    vec2(1.0, 0.0),
    vec2(0.0, 1.0),
)`,
  },
  logistic: {
    src: `fn logistic(x: f32) -> f32 {
  return 1.0 / (1.0 + exp(-x)); 
}`,
  },
  DITHER256_THRESHOLDS: {
    src: `array<f32, 256>(
  0,
  128,
  32,
  160,
  8,
  136,
  40,
  168,
  2,
  130,
  34,
  162,
  10,
  138,
  42,
  170,
  192,
  64,
  224,
  96,
  200,
  72,
  232,
  104,
  194,
  66,
  226,
  98,
  202,
  74,
  234,
  106,
  48,
  176,
  16,
  144,
  56,
  184,
  24,
  152,
  50,
  178,
  18,
  146,
  58,
  186,
  26,
  154,
  240,
  112,
  208,
  80,
  248,
  120,
  216,
  88,
  242,
  114,
  210,
  82,
  250,
  122,
  218,
  90,
  12,
  140,
  44,
  172,
  4,
  132,
  36,
  164,
  14,
  142,
  46,
  174,
  6,
  134,
  38,
  166,
  204,
  76,
  236,
  108,
  196,
  68,
  228,
  100,
  206,
  78,
  238,
  110,
  198,
  70,
  230,
  102,
  60,
  188,
  28,
  156,
  52,
  180,
  20,
  148,
  62,
  190,
  30,
  158,
  54,
  182,
  22,
  150,
  252,
  124,
  220,
  92,
  244,
  116,
  212,
  84,
  254,
  126,
  222,
  94,
  246,
  118,
  214,
  86,
  3,
  131,
  35,
  163,
  11,
  139,
  43,
  171,
  1,
  129,
  33,
  161,
  9,
  137,
  41,
  169,
  195,
  67,
  227,
  99,
  203,
  75,
  235,
  107,
  193,
  65,
  225,
  97,
  201,
  73,
  233,
  105,
  51,
  179,
  19,
  147,
  59,
  187,
  27,
  155,
  49,
  177,
  17,
  145,
  57,
  185,
  25,
  153,
  243,
  115,
  211,
  83,
  251,
  123,
  219,
  91,
  241,
  113,
  209,
  81,
  249,
  121,
  217,
  89,
  15,
  143,
  47,
  175,
  7,
  135,
  39,
  167,
  13,
  141,
  45,
  173,
  5,
  133,
  37,
  165,
  207,
  79,
  239,
  111,
  199,
  71,
  231,
  103,
  205,
  77,
  237,
  109,
  197,
  69,
  229,
  101,
  63,
  191,
  31,
  159,
  55,
  183,
  23,
  151,
  61,
  189,
  29,
  157,
  53,
  181,
  21,
  149,
  255,
  127,
  223,
  95,
  247,
  119,
  215,
  87,
  253,
  125,
  221,
  93,
  245,
  117,
  213,
  85
)}`,
  },

  dither256: {
    src: `fn dither256(factor: f32, coord: vec2i) -> bool {
  let x = coord.x % 16;
  let y = coord.y % 16;
  let threshold = DITHER256_THRESHOLDS[y * 16 + x] / 256.0;
  return factor > threshold ;
}`,
    deps: ["DITHER256_THRESHOLDS"],
  },

  // thank you https://gist.github.com/munrocket/236ed5ba7e409b8bdf1ff6eca5dcdc39
  hash: {
    src: `// https://www.pcg-random.org/
fn hash11(n: u32) -> u32 {
    var h = n * 747796405u + 2891336453u;
    h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u;
    return (h >> 22u) ^ h;
}

fn hash22(p: vec2u) -> vec2u {
    var v = p * 1664525u + 1013904223u;
    v.x += v.y * 1664525u; v.y += v.x * 1664525u;
    v ^= v >> vec2u(16u);
    v.x += v.y * 1664525u; v.y += v.x * 1664525u;
    v ^= v >> vec2u(16u);
    return v;
}

// http://www.jcgt.org/published/0009/03/02/
fn hash33(p: vec3u) -> vec3u {
    var v = p * 1664525u + 1013904223u;
    v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
    v ^= v >> vec3u(16u);
    v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
    return v;
}

// http://www.jcgt.org/published/0009/03/02/
fn hash44(p: vec4u) -> vec4u {
    var v = p * 1664525u + 1013904223u;
    v.x += v.y*v.w; v.y += v.z*v.x; v.z += v.x*v.y; v.w += v.y*v.z;
    v ^= v >> vec4u(16u);
    v.x += v.y*v.w; v.y += v.z*v.x; v.z += v.x*v.y; v.w += v.y*v.z;
    return v;
}`,
  },

  rand: {
    src: `fn rand11(f: f32) -> f32 { return f32(hash11(bitcast<u32>(f))) / f32(0xffffffff); }
fn rand22(f: vec2f) -> vec2f { return vec2f(hash22(bitcast<vec2u>(f))) / f32(0xffffffff); }
fn rand33(f: vec3f) -> vec3f { return vec3f(hash33(bitcast<vec3u>(f))) / f32(0xffffffff); }
fn rand44(f: vec4f) -> vec4f { return vec4f(hash44(bitcast<vec4u>(f))) / f32(0xffffffff); }`,
    deps: ["hash"],
  },

  valueNoise: {
    src: `
   // WTFPL License
fn noise(p: f32) -> f32 {
    let fl = floor(p);
    return mix(rand11(fl), rand11(fl + 1.), fract(p));
}
    
// WTFPL License
fn noise2(n: vec2f) -> f32 {
    let d = vec2f(0., 1.);
    let b = floor(n);
    let f = smoothStep(vec2f(0.), vec2f(1.), fract(n));
    return mix(mix(rand22(b), rand22(b + d.yx), f.x), mix(rand22(b + d.xy), rand22(b + d.yy), f.x), f.y);
}

// MIT License. © Stefan Gustavson, Munrocket
//
fn mod289(x: vec4f) -> vec4f { return x - floor(x * (1. / 289.)) * 289.; }
fn perm4(x: vec4f) -> vec4f { return mod289(((x * 34.) + 1.) * x); }

fn noise3(p: vec3f) -> f32 {
    let a = floor(p);
    var d: vec3f = p - a;
    d = d * d * (3. - 2. * d);

    let b = a.xxyy + vec4f(0., 1., 0., 1.);
    let k1 = perm4(b.xyxy);
    let k2 = perm4(k1.xyxy + b.zzww);

    let c = k2 + a.zzzz;
    let k3 = perm4(c);
    let k4 = perm4(c + 1.);

    let o1 = fract(k3 * (1. / 41.));
    let o2 = fract(k4 * (1. / 41.));

    let o3 = o2 * d.z + o1 * (1. - d.z);
    let o4 = o3.yw * d.x + o3.xz * (1. - d.x);

    return o4.y * d.y + o4.x * (1. - d.y);
}
    `,
    deps: ["rand"],
  },

  permute4: {
    src: `
fn permute4(x: vec4f) -> vec4f { return ((x * 34. + 1.) * x) % vec4f(289.); }
    `,
  },

  // note: Operator % has changed, probably current code with it need a fix
  perlinNoise: {
    src: `
   // MIT License. © Stefan Gustavson, Munrocket
fn fade2(t: vec2f) -> vec2f { return t * t * t * (t * (t * 6. - 15.) + 10.); }

fn perlinNoise2(P: vec2f) -> f32 {
    var Pi: vec4f = floor(P.xyxy) + vec4f(0., 0., 1., 1.);
    let Pf = fract(P.xyxy) - vec4f(0., 0., 1., 1.);
    Pi = Pi % vec4f(289.); // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;
    let i = permute4(permute4(ix) + iy);
    var gx: vec4f = 2. * fract(i * 0.0243902439) - 1.; // 1/41 = 0.024...
    let gy = abs(gx) - 0.5;
    let tx = floor(gx + 0.5);
    gx = gx - tx;
    var g00: vec2f = vec2f(gx.x, gy.x);
    var g10: vec2f = vec2f(gx.y, gy.y);
    var g01: vec2f = vec2f(gx.z, gy.z);
    var g11: vec2f = vec2f(gx.w, gy.w);
    let norm = 1.79284291400159 - 0.85373472095314 *
        vec4f(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 = g00 * norm.x;
    g01 = g01 * norm.y;
    g10 = g10 * norm.z;
    g11 = g11 * norm.w;
    let n00 = dot(g00, vec2f(fx.x, fy.x));
    let n10 = dot(g10, vec2f(fx.y, fy.y));
    let n01 = dot(g01, vec2f(fx.z, fy.z));
    let n11 = dot(g11, vec2f(fx.w, fy.w));
    let fade_xy = fade2(Pf.xy);
    let n_x = mix(vec2f(n00, n01), vec2f(n10, n11), vec2f(fade_xy.x));
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}
    
// MIT License. © Stefan Gustavson, Munrocket
fn taylorInvSqrt4(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }
fn fade3(t: vec3f) -> vec3f { return t * t * t * (t * (t * 6. - 15.) + 10.); }

fn perlinNoise3(P: vec3f) -> f32 {
    var Pi0 : vec3f = floor(P); // Integer part for indexing
    var Pi1 : vec3f = Pi0 + vec3f(1.); // Integer part + 1
    Pi0 = Pi0 % vec3f(289.);
    Pi1 = Pi1 % vec3f(289.);
    let Pf0 = fract(P); // Fractional part for interpolation
    let Pf1 = Pf0 - vec3f(1.); // Fractional part - 1.
    let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    let iy = vec4f(Pi0.yy, Pi1.yy);
    let iz0 = Pi0.zzzz;
    let iz1 = Pi1.zzzz;

    let ixy = permute4(permute4(ix) + iy);
    let ixy0 = permute4(ixy + iz0);
    let ixy1 = permute4(ixy + iz1);

    var gx0: vec4f = ixy0 / 7.;
    var gy0: vec4f = fract(floor(gx0) / 7.) - 0.5;
    gx0 = fract(gx0);
    var gz0: vec4f = vec4f(0.5) - abs(gx0) - abs(gy0);
    var sz0: vec4f = step(gz0, vec4f(0.));
    gx0 = gx0 + sz0 * (step(vec4f(0.), gx0) - 0.5);
    gy0 = gy0 + sz0 * (step(vec4f(0.), gy0) - 0.5);

    var gx1: vec4f = ixy1 / 7.;
    var gy1: vec4f = fract(floor(gx1) / 7.) - 0.5;
    gx1 = fract(gx1);
    var gz1: vec4f = vec4f(0.5) - abs(gx1) - abs(gy1);
    var sz1: vec4f = step(gz1, vec4f(0.));
    gx1 = gx1 - sz1 * (step(vec4f(0.), gx1) - 0.5);
    gy1 = gy1 - sz1 * (step(vec4f(0.), gy1) - 0.5);

    var g000: vec3f = vec3f(gx0.x, gy0.x, gz0.x);
    var g100: vec3f = vec3f(gx0.y, gy0.y, gz0.y);
    var g010: vec3f = vec3f(gx0.z, gy0.z, gz0.z);
    var g110: vec3f = vec3f(gx0.w, gy0.w, gz0.w);
    var g001: vec3f = vec3f(gx1.x, gy1.x, gz1.x);
    var g101: vec3f = vec3f(gx1.y, gy1.y, gz1.y);
    var g011: vec3f = vec3f(gx1.z, gy1.z, gz1.z);
    var g111: vec3f = vec3f(gx1.w, gy1.w, gz1.w);

    let norm0 = taylorInvSqrt4(
        vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 = g000 * norm0.x;
    g010 = g010 * norm0.y;
    g100 = g100 * norm0.z;
    g110 = g110 * norm0.w;
    let norm1 = taylorInvSqrt4(
        vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 = g001 * norm1.x;
    g011 = g011 * norm1.y;
    g101 = g101 * norm1.z;
    g111 = g111 * norm1.w;

    let n000 = dot(g000, Pf0);
    let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
    let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
    let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
    let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
    let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
    let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
    let n111 = dot(g111, Pf1);

    var fade_xyz: vec3f = fade3(Pf0);
    let temp = vec4f(f32(fade_xyz.z)); // simplify after chrome bug fix
    let n_z = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), temp);
    let n_yz = mix(n_z.xy, n_z.zw, vec2f(f32(fade_xyz.y))); // simplify after chrome bug fix
    let n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}
    `,
    deps: ["rand", "permute4"],
  },

  rescale: {
    src: ["f32", "vec2f", "vec3f", "vec4f"]
      .map(
        (v, i) => `
      fn rescale${i}(x: ${v}, a1: ${v}, b1: ${v}, a2: ${v}, b2: ${v}) -> ${v} {
        let temp = (x - a1) / (b1 - a1);
        return mix(a2, b2, temp);
      } 
    `
      )
      .join("\n\n"),
  },
} satisfies Record<string, { src: string; deps?: string[] }>;

function useWgslSnippetsRaw(ss: string[]) {
  return (
    "\n" +
    ss
      .map((s) => `// IMPORTED_SNIPPET: ${s}\n${WgslSnippets[s].src}`)
      .join("\n\n")
  );
}

function snippetWithDependencies(sn: string, deps = new Set<string>()) {
  deps.add(sn);

  for (const d of WgslSnippets[sn]?.deps ?? []) {
    snippetWithDependencies(d, deps);
  }

  return deps;
}

export function useWgslSnippets(str: string) {
  const snippetNames = str.split(/\s+/g);

  const withdeps = new Set(
    snippetNames.flatMap((s) => [...snippetWithDependencies(s)])
  );

  return useWgslSnippetsRaw([...withdeps]);
}
