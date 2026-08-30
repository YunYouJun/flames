import { sharedFragment } from './shared'

export const lotusFragmentShader = /* glsl */ `
  ${sharedFragment}

  float petal(vec2 point, float angle, float spread, float petalLength) {
    point = rotate2d(angle) * point;
    point.y += 0.22;
    point.x /= spread;
    point.y /= petalLength;
    float radius = length(point);
    float cusp = abs(point.x) * 0.30;
    return 1.0 - smoothstep(0.68, 1.0, radius + cusp);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    point.y += 0.08;
    point += uPointer * vec2(0.025, -0.016) * (0.3 + uPressed * 0.7);

    vec2 flowingPoint = advectFlame(point, clock);
    vec3 plume = plumeLayers(flowingPoint, clock, 0.92 + uPressed * 0.08, 0.030);
    float tongues = flameTongue(flowingPoint, clock, -0.13, 1.8, 1.22, 0.13);
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.08, 4.1, 1.38, 0.15));
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.22, 6.8, 1.08, 0.10));
    float body = max(plume.x, tongues * 0.88);
    vec3 textureField = fireTexture(flowingPoint, clock);
    float breakup = flameBreakup(flowingPoint, textureField, 0.72);
    float livingBody = body * (1.0 - breakup * 0.68);
    float dimensionalBloom = smoothstep(0.30, 0.70, uQuality);
    livingBody *= mix(1.0, 0.58, dimensionalBloom);

    float petals = 0.0;
    float bloom = 0.15 + uPressed * 0.10 + sin(clock * 1.9) * 0.012;

    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) / 6.0;
      float angle = mix(-1.25, 1.25, unit);
      angle += sin(clock * 1.45 + unit * PI * 2.0) * 0.026;
      float petalBreath = 0.90 + 0.10 * sin(clock * 2.15 + unit * PI * 2.0);
      vec2 petalPoint = point - vec2(sin(angle) * bloom * petalBreath, -0.32 + cos(angle) * 0.055);
      petals = max(petals, petal(petalPoint, angle * 0.72, 0.15, 0.31));
    }

    float innerPetals = petal(point - vec2(0.0, -0.15), 0.0, 0.12, 0.30);
    float flatPetalFallback = 1.0 - smoothstep(0.0, 0.30, uQuality);
    float petalMask = max(petals * 0.76, innerPetals * 0.86) * (1.0 - breakup * 0.22);
    petalMask *= flatPetalFallback;
    float mask = max(livingBody, petalMask);
    float detail = textureField.x;
    float filament = textureField.y * (0.56 + textureField.z * 0.44) * livingBody;
    float heat = saturate(mask * (0.22 + detail * 0.38) + filament * 0.30 + textureField.z * livingBody * 0.04 + tongues * 0.10);
    heat += exp(-dot(point - vec2(0.0, -0.22), point - vec2(0.0, -0.22)) * 24.0) * mix(0.36, 0.18, dimensionalBloom);

    float halo = softGlow(point, vec2(0.0, -0.08), vec2(0.72, 1.0), 2.8) * 0.15;
    halo += max(plume.y - plume.x * 0.72, 0.0) * 0.16;
    float embers = 0.0;
    if (uQuality > 0.25)
      embers = emberField(point, clock, 0.08 + uQuality * 0.09);

    float flicker = flameFlicker(flowingPoint, clock);
    vec3 color = flameRadiance(heat) * (0.58 + heat * 0.62) * flicker * uIntensity;
    color *= mix(1.0, 0.72, dimensionalBloom);
    color += uOuter * halo * 0.75 + mix(uInner, uCore, 0.72) * embers * 1.65;
    float alpha = saturate(mask * (0.55 + detail * 0.32 + textureField.z * 0.12) + filament * 0.12 + halo * 0.52 + embers);
    alpha *= mix(1.0, 0.72, dimensionalBloom);

    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
