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
    float headDetails = 0.0;
    float lightning = 0.0;

    for (int index = 0; index < 9; index += 1) {
      float unit = float(index) / 9.0;
      float phase = unit * PI * 2.0 + clock * (0.22 + mod(float(index), 3.0) * 0.025);
      float orbitRadius = 0.24 + mod(float(index), 3.0) * 0.075 + uPressed * 0.035;
      vec2 headCenter = vec2(cos(phase), sin(phase)) * orbitRadius;
      headCenter.y *= 0.82;
      vec2 headPoint = rotate2d(-phase) * (orbitPoint - headCenter);
      float skull = ellipseMask(headPoint, vec2(-0.010, 0.0), vec2(0.052, 0.036), 0.34);
      float snout = ellipseMask(headPoint, vec2(0.036, -0.006), vec2(0.048, 0.022), 0.36);
      float jaw = 1.0 - smoothstep(0.006, 0.016, abs(headPoint.y + 0.025 + headPoint.x * 0.20));
      jaw *= smoothstep(0.012, 0.030, headPoint.x) * (1.0 - smoothstep(0.070, 0.095, headPoint.x));
      float horn = 1.0 - smoothstep(0.007, 0.017, abs(abs(headPoint.y) - 0.032 + (headPoint.x + 0.025) * 0.34));
      horn *= smoothstep(-0.080, -0.045, headPoint.x) * (1.0 - smoothstep(-0.005, 0.015, headPoint.x));
      float eye = ellipseMask(headPoint, vec2(0.018, 0.011), vec2(0.009), 0.32);
      float head = max(skull, snout);
      heads = max(heads, head);
      headDetails = max(headDetails, max(eye, max(jaw * 0.70, horn * 0.72)));

      float spiral = abs(sin(angle * 4.5 - radius * 17.0 + phase * 1.8 + uDrag * 2.0));
      float trail = 1.0 - smoothstep(0.030, 0.120, abs(radius - orbitRadius + spiral * 0.040));
      trail *= 1.0 - smoothstep(0.11, 0.52, radius);
      float trailBreakup = noise21(vec2(angle * 7.0 + float(index), clock * 0.72 - radius * 9.0));
      trails = max(trails, trail * (0.32 + trailBreakup * 0.48 + head * 0.20));
    }

    float spoke = abs(sin(angle * 9.0 + floor(radius * 18.0) * 0.72 - clock * 1.8));
    lightning = 1.0 - smoothstep(0.015, 0.085, spoke);
    lightning *= smoothstep(0.10, 0.17, radius) * (1.0 - smoothstep(0.42, 0.56, radius));
    lightning *= 0.46 + uPressed * 0.54;
    return vec3(max(trails, heads * 0.82), headDetails, lightning);
  }

  vec3 starlitDragon(vec2 point, float clock) {
    float vertical = point.y + 0.48;
    float progress = saturate(vertical / 1.30);
    float center = sin(progress * 8.2 - clock * 0.58) * (0.18 + progress * 0.05);
    center += sin(progress * 17.0 + clock * 0.31) * 0.032;
    center += uPointer.x * progress * 0.10;
    float width = mix(0.13, 0.040, progress);
    float bodyWindow = smoothstep(-0.02, 0.06, vertical) * (1.0 - smoothstep(1.06, 1.28, vertical));
    float starNoise = fbmFast(vec2(vertical * 5.2 - clock * 0.24, (point.x - center) * 8.0 + clock * 0.18));
    float body = 1.0 - smoothstep(width * 0.45, width, abs(point.x - center) + (starNoise - 0.5) * 0.052);
    body *= bodyWindow;
    float scales = smoothstep(0.55, 0.90, 0.5 + 0.5 * sin(vertical * 28.0 - clock * 0.92));
    body *= 0.54 + scales * 0.46;
    float aura = 1.0 - smoothstep(width * 0.92, width * 2.0, abs(point.x - center) + (starNoise - 0.5) * 0.09);
    aura *= bodyWindow * (0.18 + starNoise * 0.58);
    float scaleGlints = 1.0 - smoothstep(0.012, 0.030, abs(point.x - center - sin(vertical * 19.0 + clock * 0.68) * width * 0.62));
    scaleGlints *= bodyWindow * smoothstep(0.66, 0.90, scales + starNoise * 0.18);

    vec2 headPoint = point - vec2(center + 0.045, 0.69 + uPressed * 0.055);
    headPoint = rotate2d(-0.22 + uPointer.x * 0.10) * headPoint;
    float skull = ellipseMask(headPoint, vec2(-0.025, 0.0), vec2(0.15, 0.095), 0.30);
    float snout = ellipseMask(headPoint, vec2(0.085, -0.018), vec2(0.12, 0.052), 0.34);
    float eye = ellipseMask(headPoint, vec2(0.025, 0.030), vec2(0.016), 0.34);
    vec2 hornPoint = headPoint - vec2(-0.07, 0.065);
    float horn = 1.0 - smoothstep(0.010, 0.026, abs(hornPoint.y + hornPoint.x * 0.46 + hornPoint.x * hornPoint.x * 2.6));
    horn *= smoothstep(-0.20, -0.12, hornPoint.x) * (1.0 - smoothstep(0.005, 0.030, hornPoint.x));
    float head = max(skull, snout) * (0.68 + starNoise * 0.32);
    vec2 jawPoint = headPoint - vec2(0.012, -0.052);
    float jaw = 1.0 - smoothstep(0.008, 0.022, abs(jawPoint.y + jawPoint.x * 0.16));
    jaw *= smoothstep(-0.02, 0.02, jawPoint.x) * (1.0 - smoothstep(0.15, 0.22, jawPoint.x));
    vec2 whiskerPoint = headPoint - vec2(0.050, -0.034);
    float whisker = 1.0 - smoothstep(0.008, 0.020, abs(whiskerPoint.y + sin(whiskerPoint.x * 12.0) * 0.016 + whiskerPoint.x * 0.10));
    whisker *= smoothstep(0.025, 0.065, whiskerPoint.x) * (1.0 - smoothstep(0.21, 0.29, whiskerPoint.x));
    head *= 1.0 - jaw * 0.68;

    vec2 arcPoint = point - vec2(0.0, -0.04);
    float arcRadius = length(arcPoint * vec2(0.86, 1.14));
    float arcAngle = atan(arcPoint.y, arcPoint.x);
    float arcBreakup = noise21(vec2(arcAngle * 4.0 - clock * 0.24, floor(arcRadius * 16.0)));
    float outerArc = 1.0 - smoothstep(0.012, 0.034, abs(arcRadius - 0.48 - sin(arcAngle * 4.0 + clock * 0.32) * 0.022));
    float innerArc = 1.0 - smoothstep(0.010, 0.029, abs(arcRadius - 0.34 - sin(arcAngle * 5.0 - clock * 0.26) * 0.018));
    float starArc = max(outerArc, innerArc * 0.72) * smoothstep(0.30, 0.68, arcBreakup);
    return vec3(max(body, aura * 0.58), max(max(max(scaleGlints * 0.76, eye), horn * 0.62), max(jaw * 0.44, whisker * 0.42)), max(starArc, head * 0.92));
  }

  vec3 turtleForm(vec2 point, float clock) {
    vec2 shellPoint = point - vec2(uPointer.x * 0.025, -0.24 + uPointer.y * 0.012);
    float shellDistance = length(shellPoint / vec2(0.52 + uPressed * 0.05, 0.30 + uPressed * 0.025));
    float shell = 1.0 - smoothstep(0.92, 1.02, shellDistance);
    shell *= smoothstep(-0.54, -0.40, point.y) * (1.0 - smoothstep(0.04, 0.18, point.y));
    float cell = sin(shellPoint.x * 19.0 + sin(shellPoint.y * 13.0) * 2.0);
    cell *= sin(shellPoint.y * 23.0 - shellPoint.x * 6.0 + clock * 0.26);
    float crackFlow = noise21(vec2(shellPoint.x * 5.0 - clock * 0.20, shellPoint.y * 7.0 + clock * 0.12));
    float cracks = 1.0 - smoothstep(0.035, 0.19, abs(cell) + (crackFlow - 0.5) * 0.08);
    cracks *= shell;

    float head = ellipseMask(point, vec2(0.50 + uPointer.x * 0.035, -0.22), vec2(0.17, 0.11), 0.30);
    float eye = ellipseMask(point, vec2(0.555 + uPointer.x * 0.035, -0.195), vec2(0.014), 0.30);
    float tusk = 1.0 - smoothstep(0.007, 0.019, abs(point.y + 0.275 + (point.x - 0.55) * 0.52));
    tusk *= smoothstep(0.53, 0.57, point.x) * (1.0 - smoothstep(0.65, 0.71, point.x));
    float tail = 1.0 - smoothstep(0.018, 0.055, abs(point.y + 0.23 + (point.x + 0.48) * 0.20 + sin((point.x + 0.5) * 10.0 + clock * 0.44) * 0.025));
    tail *= smoothstep(-0.70, -0.55, point.x) * (1.0 - smoothstep(-0.46, -0.30, point.x));
    float spikes = 1.0 - smoothstep(0.014, 0.045, abs(fract((point.x + 0.6) * 6.0) - 0.5));
    spikes *= smoothstep(-0.12, 0.02, point.y) * (1.0 - smoothstep(0.12, 0.28, point.y));
    spikes *= 1.0 - smoothstep(0.54, 0.68, abs(point.x));
    float shellFlames = 0.0;
    for (int index = 0; index < 6; index += 1) {
      float unit = float(index) / 5.0;
      vec2 flamePoint = point - vec2(mix(-0.38, 0.38, unit), 0.47 - abs(unit - 0.5) * 0.18);
      float flame = flameTongue(flamePoint, clock * 0.72, 0.0, float(index) * 1.31, 0.25 + mod(float(index), 2.0) * 0.07, 0.050);
      shellFlames = max(shellFlames, flame);
    }
    return vec3(max(shell, shellFlames * 0.64), max(max(cracks, eye), tusk * 0.82), max(max(head, tail), max(spikes, shellFlames * 0.92)));
  }

  vec3 beastChoir(vec2 point, float clock) {
    vec3 plume = plumeLayers(point, clock, 1.06 + uPressed * 0.06, 0.030);
    float masks = 0.0;
    float features = 0.0;
    float spiritTrails = 0.0;
    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) / 7.0;
      float angle = unit * PI * 2.0 + clock * 0.11 + uDrag * (mod(float(index), 2.0) * 2.0 - 1.0) * 0.35;
      vec2 center = vec2(cos(angle), sin(angle)) * vec2(0.42, 0.30) + vec2(0.0, -0.02);
      vec2 local = rotate2d(-angle) * (point - center);
      float archetype = mod(float(index), 3.0);
      float longFace = step(0.5, archetype) * (1.0 - step(1.5, archetype));
      float sharpFace = step(1.5, archetype);
      float face = ellipseMask(local, vec2(-0.012, 0.0), vec2(0.094 - sharpFace * 0.012, 0.070), 0.34);
      float snout = ellipseMask(local, vec2(0.065 + longFace * 0.025, -0.008), vec2(0.070 + longFace * 0.030, 0.032 - sharpFace * 0.009), 0.34);
      face = max(face, snout * 0.92);
      masks = max(masks, face);
      float hornPair = 1.0 - smoothstep(0.010, 0.030, abs(abs(local.x) - (0.040 + local.y * 0.35)));
      hornPair *= smoothstep(0.02, 0.07, local.y) * (1.0 - smoothstep(0.11, 0.16, local.y));
      float ears = ellipseMask(local, vec2(-0.045, 0.070), vec2(0.020 + longFace * 0.014, 0.060), 0.42);
      ears = max(ears, ellipseMask(local, vec2(0.020, 0.073), vec2(0.018 + longFace * 0.012, 0.055), 0.42));
      float eye = ellipseMask(local, vec2(0.025, 0.018), vec2(0.012), 0.32);
      float crest = max(hornPair * (1.0 - longFace), ears * max(longFace, sharpFace * 0.72));
      features = max(features, max(crest, eye));
      float trailNoise = noise21(vec2(length(local) * 12.0 - clock * 0.42, float(index) * 2.7));
      float trail = 1.0 - smoothstep(0.016, 0.045, abs(local.y + sin(local.x * 11.0 + float(index)) * 0.018));
      trail *= smoothstep(-0.22, -0.13, local.x) * (1.0 - smoothstep(-0.02, 0.03, local.x));
      spiritTrails = max(spiritTrails, trail * (0.34 + trailNoise * 0.66));
    }
    return vec3(max(plume.x, spiritTrails * 0.72), masks, features);
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
    color += uInner * (mask * 0.42 + filament * 0.58 + thunderField.x * 0.48 + starlitField.x * 0.48 + starlitField.z * 0.32 + turtleField.x * 0.30 + turtleField.z * 0.34 + beastField.y * 0.54);
    color += uCore * (filament * 0.64 + thunderField.y * 1.30 + thunderField.z * 1.08 + starlitField.y * 1.12 + starlitField.z * 0.72 + turtleField.y * 1.16 + beastField.z * 1.02 + motes * 1.34);
    color *= uIntensity * (0.88 + 0.12 * sin(clock * (1.5 + beasts * 0.7)));

    float alpha = mask * (0.50 + textureField.x * 0.20 + textureField.z * 0.18);
    alpha += filament * 0.22 + motes * 0.74;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
