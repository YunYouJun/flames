import { sharedFragment } from './shared'

export const spiritFragmentShader = /* glsl */ `
  ${sharedFragment}

  float ellipseMask(vec2 point, vec2 center, vec2 scale, float softness) {
    float distanceToEdge = length((point - center) / scale);
    return 1.0 - smoothstep(1.0 - softness, 1.0, distanceToEdge);
  }

  vec3 thunderDragons(vec2 point, float clock) {
    vec2 orbitPoint = point - vec2(uPointer.x * 0.035, -0.03 + uPointer.y * 0.02);
    orbitPoint.y *= 1.12;
    float radius = length(orbitPoint);
    float angle = atan(orbitPoint.y, orbitPoint.x);
    float trails = 0.0;
    float heads = 0.0;
    float lightning = 0.0;

    for (int index = 0; index < 9; index += 1) {
      float unit = float(index) / 9.0;
      float phase = unit * PI * 2.0 + clock * (0.22 + mod(float(index), 3.0) * 0.025);
      float orbitRadius = 0.24 + mod(float(index), 3.0) * 0.075 + uPressed * 0.035;
      vec2 headCenter = vec2(cos(phase), sin(phase)) * orbitRadius;
      headCenter.y *= 0.82;
      float head = ellipseMask(orbitPoint, headCenter, vec2(0.038, 0.026), 0.36);
      heads = max(heads, head);

      float spiral = abs(sin(angle * 4.5 - radius * 17.0 + phase * 1.8 + uDrag * 2.0));
      float trail = 1.0 - smoothstep(0.035, 0.14, abs(radius - orbitRadius + spiral * 0.045));
      trail *= 1.0 - smoothstep(0.11, 0.52, radius);
      trails = max(trails, trail * (0.48 + head * 0.52));
    }

    float spoke = abs(sin(angle * 9.0 + floor(radius * 18.0) * 0.72 - clock * 1.8));
    lightning = 1.0 - smoothstep(0.015, 0.085, spoke);
    lightning *= smoothstep(0.10, 0.17, radius) * (1.0 - smoothstep(0.42, 0.56, radius));
    lightning *= 0.46 + uPressed * 0.54;
    return vec3(trails, heads, lightning);
  }

  vec3 starlitDragon(vec2 point, float clock) {
    float vertical = point.y + 0.48;
    float progress = saturate(vertical / 1.30);
    float center = sin(progress * 8.2 - clock * 0.58) * (0.18 + progress * 0.05);
    center += sin(progress * 17.0 + clock * 0.31) * 0.032;
    center += uPointer.x * progress * 0.10;
    float width = mix(0.080, 0.032, progress);
    float body = 1.0 - smoothstep(width * 0.42, width, abs(point.x - center));
    body *= smoothstep(-0.02, 0.06, vertical) * (1.0 - smoothstep(1.06, 1.28, vertical));
    float scales = smoothstep(0.55, 0.90, 0.5 + 0.5 * sin(vertical * 28.0 - clock * 0.92));
    body *= 0.54 + scales * 0.46;

    vec2 headPoint = point - vec2(center + 0.05, 0.69 + uPressed * 0.055);
    float head = ellipseMask(headPoint, vec2(0.0), vec2(0.15, 0.09), 0.30);
    float starArc = 1.0 - smoothstep(0.014, 0.040, abs(length(point * vec2(0.82, 1.1)) - 0.48 - sin(atan(point.y, point.x) * 4.0 + clock * 0.32) * 0.025));
    starArc *= 1.0 - smoothstep(0.34, 0.76, abs(point.y + 0.02));
    return vec3(body, head, starArc);
  }

  vec3 turtleForm(vec2 point, float clock) {
    vec2 shellPoint = point - vec2(uPointer.x * 0.025, -0.24 + uPointer.y * 0.012);
    float shellDistance = length(shellPoint / vec2(0.52 + uPressed * 0.05, 0.30 + uPressed * 0.025));
    float shell = 1.0 - smoothstep(0.92, 1.02, shellDistance);
    shell *= smoothstep(-0.54, -0.40, point.y) * (1.0 - smoothstep(0.04, 0.18, point.y));
    float cell = sin(shellPoint.x * 22.0 + sin(shellPoint.y * 14.0) * 2.2);
    cell *= sin(shellPoint.y * 25.0 - shellPoint.x * 7.0 + clock * 0.18);
    float cracks = 1.0 - smoothstep(0.04, 0.24, abs(cell));
    cracks *= shell;

    float head = ellipseMask(point, vec2(0.50 + uPointer.x * 0.035, -0.22), vec2(0.17, 0.11), 0.30);
    float tail = 1.0 - smoothstep(0.018, 0.055, abs(point.y + 0.23 + (point.x + 0.48) * 0.20));
    tail *= smoothstep(-0.70, -0.55, point.x) * (1.0 - smoothstep(-0.46, -0.30, point.x));
    float spikes = 1.0 - smoothstep(0.014, 0.045, abs(fract((point.x + 0.6) * 6.0) - 0.5));
    spikes *= smoothstep(-0.12, 0.02, point.y) * (1.0 - smoothstep(0.12, 0.28, point.y));
    spikes *= 1.0 - smoothstep(0.54, 0.68, abs(point.x));
    return vec3(shell, cracks, max(max(head, tail), spikes));
  }

  vec3 beastChoir(vec2 point, float clock) {
    vec3 plume = plumeLayers(point, clock, 1.06 + uPressed * 0.06, 0.030);
    float masks = 0.0;
    float horns = 0.0;
    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) / 7.0;
      float angle = unit * PI * 2.0 + clock * 0.11 + uDrag * (mod(float(index), 2.0) * 2.0 - 1.0) * 0.35;
      vec2 center = vec2(cos(angle), sin(angle)) * vec2(0.42, 0.30) + vec2(0.0, -0.02);
      vec2 local = rotate2d(-angle) * (point - center);
      float face = ellipseMask(local, vec2(0.0), vec2(0.075, 0.060), 0.34);
      masks = max(masks, face);
      float hornPair = 1.0 - smoothstep(0.010, 0.030, abs(abs(local.x) - (0.040 + local.y * 0.35)));
      hornPair *= smoothstep(0.02, 0.07, local.y) * (1.0 - smoothstep(0.11, 0.16, local.y));
      horns = max(horns, hornPair);
    }
    return vec3(plume.x, masks, horns);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float thunder = 1.0 - step(0.5, abs(uVariant));
    float starlit = 1.0 - step(0.5, abs(uVariant - 1.0));
    float turtle = 1.0 - step(0.5, abs(uVariant - 2.0));
    float beasts = step(2.5, uVariant);
    point.y += 0.03;

    vec3 thunderField = vec3(0.0);
    vec3 starlitField = vec3(0.0);
    vec3 turtleField = vec3(0.0);
    vec3 beastField = vec3(0.0);
    if (thunder > 0.5)
      thunderField = thunderDragons(point, clock);
    if (starlit > 0.5)
      starlitField = starlitDragon(point, clock);
    if (turtle > 0.5)
      turtleField = turtleForm(point, clock);
    if (beasts > 0.5)
      beastField = beastChoir(point, clock);

    vec3 basePlume = plumeLayers(point, clock, 0.92, 0.032);
    float baseBody = basePlume.x * (thunder * 0.58 + starlit * 0.34);
    float thunderMask = max(thunderField.x, max(thunderField.y, thunderField.z));
    float starlitMask = max(starlitField.x, max(starlitField.y, starlitField.z));
    float turtleMask = max(turtleField.x, max(turtleField.y, turtleField.z));
    float beastMask = max(beastField.x * 0.72, max(beastField.y, beastField.z));
    float mask = max(baseBody, thunderMask * thunder);
    mask = max(mask, starlitMask * starlit);
    mask = max(mask, turtleMask * turtle);
    mask = max(mask, beastMask * beasts);

    vec3 textureField = fireTexture(point, clock * 0.86);
    float filament = smoothstep(0.58, 0.86, textureField.y) * mask;
    float motes = 0.0;
    if (uQuality > 0.25)
      motes = emberField(point * vec2(0.86, 0.74), clock * mix(0.72, 0.44, turtle), 0.045 + starlit * 0.055 + beasts * 0.035);

    vec3 color = uOuter * (mask * 0.48 + basePlume.y * 0.16);
    color += uInner * (mask * 0.42 + filament * 0.58 + thunderField.x * 0.48 + turtleField.x * 0.30);
    color += uCore * (filament * 0.64 + thunderField.y * 1.30 + thunderField.z * 1.08 + starlitField.y * 1.12 + starlitField.z * 0.92 + turtleField.y * 1.16 + beastField.z * 1.02 + motes * 1.34);
    color *= uIntensity * (0.88 + 0.12 * sin(clock * (1.5 + beasts * 0.7)));

    float alpha = mask * (0.50 + textureField.x * 0.20 + textureField.z * 0.18);
    alpha += filament * 0.22 + motes * 0.74;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
