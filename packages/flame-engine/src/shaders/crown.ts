import { sharedFragment } from './shared'

export const crownFragmentShader = /* glsl */ `
  ${sharedFragment}

  float ellipseMask(vec2 point, vec2 center, vec2 scale, float softness) {
    float distanceToEdge = length((point - center) / scale);
    return 1.0 - smoothstep(1.0 - softness, 1.0, distanceToEdge);
  }

  vec3 goldenCrown(vec2 point, float clock) {
    vec2 royal = point - vec2(uPointer.x * 0.028, uPointer.y * 0.012);
    vec2 flow = advectFlame(royal, clock * 1.34);
    vec2 eddy = royal * 1.72 + vec2(6.4, -3.1);
    flow += (advectFlame(eddy, clock * 2.18) - eddy) * (0.18 + smoothstep(-0.52, 0.86, royal.y) * 0.56);
    vec2 eye = vec2(-0.17 + sin(clock * 0.73) * 0.07, -0.02 + sin(clock * 0.43) * 0.13);
    vec2 turn = flow - eye;
    flow = eye + rotate2d(sin(clock * 1.62) * 0.92 * (1.0 - smoothstep(0.06, 0.48, length(turn)))) * turn;
    eye = vec2(0.16 + sin(clock * 0.58 + 2.0) * 0.07, 0.24 + sin(clock * 0.51 + 1.3) * 0.12);
    turn = flow - eye;
    flow = eye + rotate2d(-sin(clock * 1.37 + 1.7) * 0.84 * (1.0 - smoothstep(0.05, 0.44, length(turn)))) * turn;
    float coil = (1.0 - smoothstep(0.04, 0.17, abs(sin(atan(turn.y, turn.x) + length(turn) * 13.0 + clock * 2.7)))) * (1.0 - smoothstep(0.08, 0.43, length(turn)));

    vec3 plume = plumeLayers(flow * vec2(0.86, 0.82), clock * 1.28, 1.06, 0.028);
    float tongues = 0.0;
    float cores = 0.0;
    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) - 3.0;
      float phase = float(index) * 1.37 + 0.6;
      float pulse = noise21(vec2(clock * 0.72 + phase, phase * 2.71));
      float drift = noise21(vec2(clock * 0.41 + phase * 1.9, phase * 0.83));
      float life = smoothstep(0.12, 0.64, pulse);
      float center = unit * 0.105 + (drift - 0.5) * 0.18;
      float height = (0.76 + (1.0 - abs(unit) * 0.095) * 0.42 + uPressed * 0.12) * (0.58 + pulse * 0.62);
      float tongue = flameTongue(flow, clock * 1.72, center, phase, height, (0.14 - abs(unit) * 0.008) * (0.72 + drift * 0.46)) * life;
      tongues = max(tongues, tongue);
      cores = max(cores, pow(tongue, 2.2));
    }

    float base = ellipseMask(flow, vec2(0.0, -0.49), vec2(0.52 + uPressed * 0.06, 0.115), 0.32);
    float support = plume.x * (1.0 - smoothstep(0.04, 0.72, flow.y));
    float body = max(max(support, tongues), base);
    float erosion = fbmFast(flow * vec2(5.8, 3.7) + vec2(-clock * 0.44, -clock * 2.36));
    float breakup = smoothstep(0.60, 0.84, erosion) * smoothstep(-0.22, 0.86, flow.y);
    body *= 1.0 - breakup * 0.76;
    float glow = fbmFast(flow * vec2(7.4, 4.6) + vec2(clock * 0.32, -clock * 2.08));
    float heat = max(cores, pow(support, 1.65));
    heat = max(heat, ellipseMask(flow, vec2(0.0, -0.49), vec2(0.33, 0.065), 0.42));
    heat *= 0.42 + smoothstep(0.32, 0.78, glow) * 0.78;
    heat = max(heat, coil * body * 0.68);

    float haloRadius = length(royal * vec2(1.0, 1.04));
    float halo = 1.0 - smoothstep(0.016, 0.052, abs(haloRadius - (0.51 + uPressed * 0.04)));
    return vec3(body, heat, halo);
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
    w = max(w + (sin(x * 33.0 - t * 2.1) + sin(x * 51.0 + t * 1.6)) * 0.012 * a, 0.018);
    float d = max((p.y - h) / (w * 0.62), (h - p.y) / (w * 1.38));
    float v = (1.0 - smoothstep(0.84, 1.03, d)) * smoothstep(0.04, 0.13, x);
    v *= (1.0 - smoothstep(e - 0.12, e, x)) * (0.82 + 0.18 * smoothstep(-0.5, 0.72, sin(x * 35.0 - (p.y - h) * 17.0 - t * 1.2)));
    float c = flameTongue(q, t * 1.32, 0.0, 1.9, 0.82 + uPressed * 0.12, 0.145);
    float f = fract(t * 0.34);
    float r = 1.0 - smoothstep(0.012, 0.055, abs(q.y + 0.16 + f * 0.42 + x * 0.10 - sin(x * 8.0 - t * 2.0) * 0.025));
    r *= (1.0 - f) * (1.0 - smoothstep(0.28, e, x)) * smoothstep(0.10, 0.20, x);
    return vec3(v, v * smoothstep(0.62, 0.93, d), max(c, r));
  }

  vec3 ancestralSeal(vec2 point, float clock) {
    vec2 sealPoint = point - vec2(uPointer.x * 0.018, -0.10 + uPointer.y * 0.01);
    float tower = 1.0 - smoothstep(0.12, 0.16, abs(sealPoint.x));
    tower *= smoothstep(-0.58, -0.46, sealPoint.y) * (1.0 - smoothstep(0.42, 0.58, sealPoint.y));
    float shoulders = 1.0 - smoothstep(0.17, 0.22, abs(sealPoint.x));
    shoulders *= smoothstep(-0.30, -0.20, sealPoint.y) * (1.0 - smoothstep(0.22, 0.34, sealPoint.y));
    float crown = 1.0 - smoothstep(0.014, 0.040, abs(abs(sealPoint.x) * 0.72 + sealPoint.y - (0.46 + uPressed * 0.04)));
    crown *= 1.0 - smoothstep(0.18, 0.27, abs(sealPoint.x));
    float glyph = 1.0 - smoothstep(0.012, 0.036, abs(sin(sealPoint.y * 21.0 + clock * 0.28) * 0.12 + sealPoint.x));
    glyph *= tower;
    float haloRadius = length(sealPoint * vec2(1.0, 0.94));
    float halo = 1.0 - smoothstep(0.014, 0.040, abs(haloRadius - (0.39 + uPressed * 0.045)));
    halo *= 0.56 + 0.44 * smoothstep(0.35, 0.88, 0.5 + 0.5 * sin(atan(sealPoint.y, sealPoint.x) * 8.0 + clock * 0.7));
    return vec3(max(max(tower, shoulders), crown), glyph, halo);
  }

  vec3 emperorConvergence(vec2 point, float clock) {
    vec2 centerPoint = point - vec2(uPointer.x * 0.028, -0.04 + uPointer.y * 0.018);
    float radius = length(centerPoint * vec2(1.0, 1.06));
    float angle = atan(centerPoint.y, centerPoint.x);
    float rings = 0.0;
    for (int index = 0; index < 4; index += 1) {
      float unit = float(index) / 3.0;
      float ringRadius = 0.16 + unit * 0.12 + uPressed * unit * 0.045;
      float ripple = sin(angle * (5.0 + float(index) * 2.0) + clock * (0.38 + unit * 0.24)) * 0.016;
      float ring = 1.0 - smoothstep(0.012, 0.038, abs(radius - ringRadius - ripple));
      rings = max(rings, ring);
    }
    float spokes = 1.0 - smoothstep(0.018, 0.070, abs(sin(angle * 11.0 - clock * 0.46)));
    spokes *= smoothstep(0.11, 0.20, radius) * (1.0 - smoothstep(0.48, 0.61, radius));
    vec3 plume = plumeLayers(point * vec2(0.98, 0.86), clock * 0.66, 0.84, 0.028);
    float core = softGlow(point, vec2(0.0, -0.06), vec2(4.2, 3.1), 1.0);
    return vec3(max(rings, spokes), plume.x, core);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float golden = 1.0 - step(0.5, abs(uVariant));
    float desolation = 1.0 - step(0.5, abs(uVariant - 1.0));
    float ancestral = 1.0 - step(0.5, abs(uVariant - 2.0));
    float emperor = step(2.5, uVariant);
    point.y += 0.02;

    vec3 gold = vec3(0.0);
    vec3 wing = vec3(0.0);
    vec3 seal = vec3(0.0);
    vec3 emp = vec3(0.0);
    if (golden > 0.5)
      gold = goldenCrown(point, clock);
    if (desolation > 0.5)
      wing = desolationWings(point, clock);
    if (ancestral > 0.5)
      seal = ancestralSeal(point, clock);
    if (emperor > 0.5)
      emp = emperorConvergence(point, clock);

    float mask = max(max(gold.x, max(gold.y, gold.z)) * golden, max(wing.x, max(wing.y, wing.z)) * desolation);
    mask = max(mask, max(seal.x, max(seal.y, seal.z)) * ancestral);
    mask = max(mask, max(emp.x, max(emp.y, emp.z)) * emperor);
    vec3 tex = fireTexture(point, clock * 0.82);
    float filament = smoothstep(0.58, 0.86, tex.y) * mask * (1.0 - desolation * 0.88);
    float motes = 0.0;
    if (uQuality > 0.25)
      motes = emberField(point * vec2(0.84, 0.68), clock * mix(0.68, 0.82, emperor), 0.042 + golden * 0.075 + emperor * 0.045);

    vec3 color = uOuter * (mask * 0.38 + wing.x * 0.30 + seal.x * 0.30);
    color += uInner * (mask * 0.43 + gold.x * 0.62 + gold.y * 0.74 + wing.z * 0.82 + seal.z * 0.52 + emp.x * 0.68);
    color += uCore * (filament * 0.72 + gold.x * 0.24 + gold.y * 1.18 + gold.z * 1.42 + wing.y * 0.95 + seal.y * 1.10 + emp.z * 1.28 + motes * 1.32);
    if (golden > 0.5) {
      color = uOuter * (gold.x * 0.88 + gold.z * 0.10);
      color += uInner * (gold.x * 0.18 + gold.y * 0.86 + gold.z * 0.24);
      color += uCore * (filament * 0.12 + gold.y * 0.20 + motes * 1.18);
    }
    if (emperor > 0.5) {
      float spectrum = 0.5 + 0.5 * sin(atan(point.y, point.x) * 3.0 + clock * 0.48);
      color += mix(vec3(0.18, 0.52, 1.0), vec3(1.0, 0.18, 0.36), spectrum) * emp.x * 0.72;
    }
    color *= uIntensity * (0.88 + 0.12 * sin(clock * mix(1.7, 1.1, ancestral)));

    float alpha = mask * (0.45 + tex.x * 0.18 + tex.z * 0.17);
    alpha += filament * 0.22 + motes * 0.70 + emp.z * 0.16 + wing.y * 0.30;
    if (golden > 0.5) {
      float flameAlpha = gold.x * (0.62 + tex.x * 0.06 + tex.z * 0.12);
      alpha = flameAlpha + gold.y * 0.26 + filament * 0.12 + motes * 0.54 + gold.z * 0.08;
    }
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
