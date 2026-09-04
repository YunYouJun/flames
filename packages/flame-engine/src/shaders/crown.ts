import { sharedFragment } from './shared'

export const crownFragmentShader = /* glsl */ `
  ${sharedFragment}

  float ellipseMask(vec2 p, vec2 c, vec2 scale, float s) {
    float d = length((p - c) / scale);
    return 1.0 - smoothstep(1.0 - s, 1.0, d);
  }

  vec3 goldCrown(vec2 p, float t) {
    vec2 q = p - vec2(uPointer.x * 0.028, uPointer.y * 0.012);
    vec2 f = advectFlame(q, t * 1.34);
    vec2 d = q * 1.72 + vec2(6.4, -3.1);
    f += (advectFlame(d, t * 2.18) - d) * (0.18 + smoothstep(-0.52, 0.86, q.y) * 0.56);
    vec2 e = vec2(-0.17 + sin(t * 0.73) * 0.07, -0.02 + sin(t * 0.43) * 0.13);
    vec2 v = f - e;
    f = e + rotate2d(sin(t * 1.62) * 0.92 * (1.0 - smoothstep(0.06, 0.48, length(v)))) * v;
    e = vec2(0.16 + sin(t * 0.58 + 2.0) * 0.07, 0.24 + sin(t * 0.51 + 1.3) * 0.12);
    v = f - e;
    f = e + rotate2d(-sin(t * 1.37 + 1.7) * 0.84 * (1.0 - smoothstep(0.05, 0.44, length(v)))) * v;
    float c = (1.0 - smoothstep(0.04, 0.17, abs(sin(atan(v.y, v.x) + length(v) * 13.0 + t * 2.7)))) * (1.0 - smoothstep(0.08, 0.43, length(v)));

    vec3 pm = plumeLayers(f * vec2(0.86, 0.82), t * 1.28, 1.06, 0.028);
    float tg = 0.0;
    float cs = 0.0;
    for (int i = 0; i < 7; i += 1) {
      float u = float(i) - 3.0;
      float ph = float(i) * 1.37 + 0.6;
      float ps = noise21(vec2(t * 0.72 + ph, ph * 2.71));
      float dr = noise21(vec2(t * 0.41 + ph * 1.9, ph * 0.83));
      float lf = smoothstep(0.12, 0.64, ps);
      float cx = u * 0.105 + (dr - 0.5) * 0.18;
      float ht = (0.76 + (1.0 - abs(u) * 0.095) * 0.42 + uPressed * 0.12) * (0.58 + ps * 0.62);
      float tn = flameTongue(f, t * 1.72, cx, ph, ht, (0.14 - abs(u) * 0.008) * (0.72 + dr * 0.46)) * lf;
      tg = max(tg, tn);
      cs = max(cs, pow(tn, 2.2));
    }

    float ba = ellipseMask(f, vec2(0.0, -0.49), vec2(0.52 + uPressed * 0.06, 0.115), 0.32);
    float sp = pm.x * (1.0 - smoothstep(0.04, 0.72, f.y));
    float bd = max(max(sp, tg), ba);
    float er = fbmFast(f * vec2(5.8, 3.7) + vec2(-t * 0.44, -t * 2.36));
    float br = smoothstep(0.60, 0.84, er) * smoothstep(-0.22, 0.86, f.y);
    bd *= 1.0 - br * 0.76;
    float g = fbmFast(f * vec2(7.4, 4.6) + vec2(t * 0.32, -t * 2.08));
    float hh = max(cs, pow(sp, 1.65));
    hh = max(hh, ellipseMask(f, vec2(0.0, -0.49), vec2(0.33, 0.065), 0.42));
    hh *= 0.42 + smoothstep(0.32, 0.78, g) * 0.78;
    hh = max(hh, c * bd * 0.68);

    float hr = length(q * vec2(1.0, 1.04));
    float ha = 1.0 - smoothstep(0.016, 0.052, abs(hr - (0.51 + uPressed * 0.04)));
    return vec3(bd, hh, ha);
  }

  vec3 desolationWings(vec2 q, float t) {
    vec2 p = q - vec2(uPointer.x * 0.018, -0.04 + uPointer.y * 0.012);
    float x = abs(p.x);
    float b = pow(0.5 + 0.5 * sin(t * 0.86), 3.0);
    float e = 0.92 + uPressed * 0.15 + b * 0.10;
    float a = x / e;
    float h = 0.28 - a * 0.40 - b * 0.035 + sin(t * 0.94 + x * 5.0) * 0.035;
    h += sign(p.x) * (uPointer.x * x + uDrag * sin(a * PI)) * 0.05;
    float w = 0.035 + sin(saturate(a) * PI) * (0.22 + uPressed * 0.030);
    float n = fbmFast(p * vec2(5.4, 7.2) + vec2(-t * 0.42, t * 0.18));
    w = max(w + (sin(x * 33.0 - t * 2.1) + sin(x * 51.0 + t * 1.6)) * 0.012 * a + (n - 0.5) * 0.08 * (0.25 + a * 0.75), 0.018);
    float d = max((p.y - h) / (w * 0.62), (h - p.y) / (w * 1.38));
    float v = (1.0 - smoothstep(0.84, 1.03, d)) * smoothstep(0.04, 0.13, x);
    v *= (1.0 - smoothstep(e - 0.12, e, x)) * (0.82 + 0.18 * smoothstep(-0.5, 0.72, sin(x * 35.0 - (p.y - h) * 17.0 - t * 1.2)));
    float c = flameTongue(q, t * 1.32, 0.0, 1.9, 0.82 + uPressed * 0.12, 0.145);
    float f = fract(t * 0.34);
    float r = 1.0 - smoothstep(0.012, 0.055, abs(q.y + 0.16 + f * 0.42 + x * 0.10 - sin(x * 8.0 - t * 2.0) * 0.025));
    r *= (1.0 - f) * (1.0 - smoothstep(0.28, e, x)) * smoothstep(0.10, 0.20, x);
    float z = 1.0 - smoothstep(0.010, 0.032, abs(n - 0.58));
    v *= 0.62 + smoothstep(0.22, 0.78, n) * 0.38;
    v *= 1.0 - smoothstep(0.68, 0.82, n) * smoothstep(0.42, 0.96, d) * 0.78;
    float l = 0.0;
    for (int i = 0; i < 5; i += 1) {
      float fi = float(i);
      float side = step(0.0, p.x);
      float ps = noise21(vec2(t * 0.42 + fi * 1.3 + side * 7.1, fi * 2.9));
      float cx = 0.16 + fi * 0.17 + sin(t * (0.58 + fi * 0.09) + fi * 2.1 + side * 3.7) * 0.025;
      vec2 lp = vec2(x, p.y - h - w * 0.60 - 0.52);
      l = max(l, flameTongue(lp, t * 1.46, cx, fi * 1.71 + side * 4.2, 0.12 + ps * 0.30, 0.065 + fi * 0.004) * smoothstep(0.24, 0.66, ps));
    }
    v = max(v, l * 0.86);
    return vec3(v, max(max(max(v * smoothstep(0.62, 0.93, d), z * v * 0.58), l * 0.82), smoothstep(0.52, 0.76, n) * v * 0.36), max(c, r));
  }

  vec3 oldSeal(vec2 p, float t) {
    vec2 q = p - vec2(uPointer.x * 0.018, -0.10 + uPointer.y * 0.01);
    vec2 f = advectFlame(q, t * 0.72);
    vec3 pm = plumeLayers(f * vec2(1.28, 0.92), t * 0.82, 0.68, 0.026);
    float b = (1.0 - smoothstep(0.11, 0.16, abs(q.x))) * smoothstep(-0.58, -0.46, q.y) * (1.0 - smoothstep(0.38, 0.55, q.y));
    float sh = (1.0 - smoothstep(0.17, 0.22, abs(q.x))) * smoothstep(-0.30, -0.20, q.y) * (1.0 - smoothstep(0.18, 0.31, q.y));
    float n = fbmFast(q * vec2(5.2, 3.8) + vec2(t * 0.18, -t * 0.72));
    float a = flameTongue(f, t * 1.18, 0.0, 5.7, 0.96 + uPressed * 0.12, 0.15);
    float d = max(max(b, sh) * (0.52 + n * 0.28), max(pm.x * 0.78, a));
    d *= 1.0 - smoothstep(0.70, 0.86, n) * smoothstep(-0.12, 0.78, q.y) * 0.58;
    d *= smoothstep(-0.60, -0.43, q.y);
    float g = (1.0 - smoothstep(0.012, 0.036, abs(sin(q.y * 21.0 - t * 0.86) * 0.12 + q.x))) * max(b, pm.x * 0.62);
    g *= smoothstep(0.30, 0.68, n);
    float hr = length(q * vec2(1.0, 0.94));
    float h = 1.0 - smoothstep(0.014, 0.040, abs(hr - (0.39 + uPressed * 0.045)));
    h *= 0.56 + 0.44 * smoothstep(0.35, 0.88, 0.5 + 0.5 * sin(atan(q.y, q.x) * 8.0 + t * 0.7));
    return vec3(d, max(max(g, a * 0.58), pm.x * pm.x * 0.34), h);
  }

  vec3 empRings(vec2 p, float t) {
    vec2 q = p - vec2(uPointer.x * 0.028, -0.04 + uPointer.y * 0.018);
    float r = length(q * vec2(1.0, 1.06));
    float a = atan(q.y, q.x);
    float rs = 0.0;
    for (int i = 0; i < 4; i += 1) {
      float u = float(i) / 3.0;
      float direction = mod(float(i), 2.0) * 2.0 - 1.0;
      float rr = 0.17 + u * 0.145 + uPressed * u * 0.060;
      float w = sin(a * (5.0 + float(i) * 2.0) + t * direction * (0.42 + u * 0.28)) * 0.014;
      float g = 1.0 - smoothstep(0.009, 0.029, abs(r - rr - w));
      float segment = 0.5 + 0.5 * sin(a * (7.0 + float(i) * 2.0) - t * direction * (0.54 + u * 0.24) + float(i));
      g *= 0.32 + smoothstep(0.28, 0.72, segment) * 0.68;
      rs = max(rs, g * (0.78 + u * 0.22));
    }
    float s = 1.0 - smoothstep(0.014, 0.052, abs(sin(a * 11.0 - t * 0.46)));
    float inward = 1.0 - smoothstep(0.045, 0.16, abs(fract(r * 4.2 + t * 0.34) - 0.5));
    s *= smoothstep(0.11, 0.20, r) * (1.0 - smoothstep(0.54, 0.66, r)) * (0.34 + inward * 0.66);

    vec3 pm = plumeLayers(p * vec2(1.18, 0.88), t * 0.72, 0.76, 0.026);
    float tongues = flameTongue(p, t * 0.92, -0.10, 1.4, 0.88 + uPressed * 0.10, 0.105);
    tongues = max(tongues, flameTongue(p, t * 0.84, 0.08, 4.8, 1.00 + uPressed * 0.12, 0.115));
    tongues = max(tongues, flameTongue(p, t * 0.96, 0.0, 7.2, 1.14 + uPressed * 0.14, 0.095));
    float flame = max(pm.x * 0.62, tongues);
    float kernel = ellipseMask(q, vec2(0.0, -0.02), vec2(0.105 + uPressed * 0.015, 0.145 + uPressed * 0.022), 0.38);
    float halo = softGlow(q, vec2(0.0, -0.02), vec2(5.2, 4.2), 1.5) * 0.24;
    return vec3(max(rs, s), flame, max(kernel, halo));
  }

  void main() {
    vec2 p = stagePoint();
    float t = uTime * uSpeed;
    float gc = 1.0 - step(0.5, abs(uVariant));
    float dw = 1.0 - step(0.5, abs(uVariant - 1.0));
    float anc = 1.0 - step(0.5, abs(uVariant - 2.0));
    float ce = step(2.5, uVariant);
    p.y += 0.02;

    vec3 gold = vec3(0.0);
    vec3 wing = vec3(0.0);
    vec3 seal = vec3(0.0);
    vec3 emp = vec3(0.0);
    if (gc > 0.5)
      gold = goldCrown(p, t);
    if (dw > 0.5)
      wing = desolationWings(p, t);
    if (anc > 0.5)
      seal = oldSeal(p, t);
    if (ce > 0.5)
      emp = empRings(p, t);

    float mask = max(max(gold.x, max(gold.y, gold.z)) * gc, max(wing.x, max(wing.y, wing.z)) * dw);
    mask = max(mask, max(seal.x, max(seal.y, seal.z)) * anc);
    mask = max(mask, max(emp.x, max(emp.y, emp.z)) * ce);
    vec3 tex = fireTexture(p, t * 0.82);
    float fil = smoothstep(0.58, 0.86, tex.y) * mask * (1.0 - dw * 0.88);
    float m = 0.0;
    if (uQuality > 0.25)
      m = emberField(p * vec2(0.84, 0.68), t * mix(0.68, 0.82, ce), 0.042 + gc * 0.075 + dw * 0.052 + ce * 0.045);

    vec3 col = uOuter * (mask * 0.38 + wing.x * 0.30 + seal.x * 0.08);
    col += uInner * (mask * 0.43 + gold.x * 0.62 + gold.y * 0.74 + wing.z * 0.82 + seal.x * 0.22 + seal.z * 0.52 + emp.x * 0.68);
    col += uCore * (fil * 0.72 + gold.x * 0.24 + gold.y * 1.18 + gold.z * 1.42 + wing.y * 0.95 + seal.y * 1.10 + emp.z * 1.28 + m * 1.32);
    if (gc > 0.5) {
      col = uOuter * (gold.x * 0.88 + gold.z * 0.10);
      col += uInner * (gold.x * 0.18 + gold.y * 0.86 + gold.z * 0.24);
      col += uCore * (fil * 0.12 + gold.y * 0.20 + m * 1.18);
    }
    if (ce > 0.5) {
      float angle = atan(p.y + 0.04, p.x);
      float spectrum = 0.5 + 0.5 * sin(angle * 3.0 + t * 0.58);
      float goldBand = 0.5 + 0.5 * sin(angle * 5.0 - t * 0.42 + 1.4);
      vec3 spectrumColor = mix(vec3(0.14, 0.54, 1.0), vec3(1.0, 0.16, 0.38), spectrum);
      spectrumColor = mix(spectrumColor, vec3(1.0, 0.66, 0.12), goldBand * 0.48);
      col = uOuter * (emp.y * 0.10 + emp.x * 0.12);
      col += spectrumColor * emp.x * 1.45;
      col += uInner * (emp.y * 0.82 + emp.x * 0.18);
      col += uCore * (emp.z * 0.88 + fil * 0.46 + m * 1.18);
    }
    col *= uIntensity * (0.88 + 0.12 * sin(t * mix(1.7, 1.1, anc)));

    float al = mask * (0.45 + tex.x * 0.18 + tex.z * 0.17);
    al += fil * 0.22 + m * 0.70 + emp.z * 0.16 + wing.y * 0.30;
    if (gc > 0.5) {
      float fa = gold.x * (0.62 + tex.x * 0.06 + tex.z * 0.12);
      al = fa + gold.y * 0.26 + fil * 0.12 + m * 0.54 + gold.z * 0.08;
    }
    al = saturate(al);
    if (al < 0.012) discard;
    gl_FragColor = vec4(col, al);
    #include <colorspace_fragment>
  }
`
