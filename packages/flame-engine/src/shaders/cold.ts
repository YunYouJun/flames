import { sharedFragment } from './shared'

export const coldFragmentShader = /* glsl */ `
  ${sharedFragment}

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    point.y += 0.08;

    float lift = smoothstep(-0.68, 0.82, point.y);
    float wandering = sin(point.y * 3.6 - clock * 1.18) * 0.042;
    wandering += sin(point.y * 8.7 + clock * 1.74) * 0.014;
    wandering += (fbmFast(vec2(point.y * 2.25 - clock * 0.16, clock * 0.31)) - 0.5) * 0.19 * uTurbulence;
    wandering += uPointer.x * lift * 0.075;
    point.x -= wandering;
    point.y += (fbmFast(vec2(point.x * 1.8 - clock * 0.12, clock * 0.24)) - 0.5) * 0.038;

    vec2 flowingPoint = advectFlame(point, clock * 0.96);
    vec2 counterFlow = advectFlame(vec2(-point.x, point.y + 0.035), clock * 1.17);
    counterFlow.x *= -1.0;
    flowingPoint += (counterFlow - point) * (0.18 + lift * 0.08);

    vec3 outerPlume = plumeLayers(flowingPoint, clock * 0.92, 0.94 + uPressed * 0.05, 0.027);
    vec3 innerPlume = plumeLayers(flowingPoint * vec2(1.34, 1.0), clock * 1.08, 0.70, 0.020);

    float tongues = flameTongue(flowingPoint, clock, -0.24, 1.4, 0.86, 0.095);
    tongues = max(tongues, flameTongue(flowingPoint, clock, -0.11, 3.8, 1.20, 0.090));
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.02, 6.2, 1.38, 0.085));
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.15, 8.7, 1.06, 0.092));
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.27, 11.3, 0.78, 0.078));

    float coreTongues = flameTongue(flowingPoint, clock * 1.08, -0.08, 5.1, 0.86, 0.055);
    coreTongues = max(coreTongues, flameTongue(flowingPoint, clock * 1.08, 0.08, 9.4, 1.02, 0.052));

    float body = max(outerPlume.x, tongues * 0.92);
    vec3 textureField = fireTexture(flowingPoint * vec2(1.12, 0.92), clock * 0.94);
    vec3 fineTexture = fireTexture(flowingPoint * vec2(1.76, 1.28) + vec2(2.7, -1.3), clock * 1.21);
    float breakup = flameBreakup(flowingPoint, textureField, 0.72 + uQuality * 0.16);
    float highBreakup = smoothstep(0.48, 0.82, fineTexture.x * 0.54 + fineTexture.y * 0.46) * lift;
    float livingBody = body * (1.0 - breakup * 0.72) * (1.0 - highBreakup * 0.24);

    float hotCore = max(innerPlume.x * 0.84, coreTongues * 0.78);
    hotCore *= livingBody;
    hotCore *= 0.58 + textureField.z * 0.42;
    float coldShell = max(livingBody - hotCore * 0.62, 0.0);
    float filaments = livingBody * smoothstep(0.58, 0.86, fineTexture.y);
    filaments *= 0.44 + textureField.z * 0.56;
    float aura = max(outerPlume.y - livingBody * 0.56, 0.0);

    vec2 ringPoint = point - vec2(uPointer.x * 0.045, -0.48 + uPointer.y * 0.025);
    ringPoint.y *= 1.72;
    float ringWarp = (fbmFast(ringPoint * 5.6 + vec2(-clock * 0.42, clock * 0.18)) - 0.5) * 0.055;
    float frostRadius = length(ringPoint) + ringWarp;
    float frostRing = exp(-abs(frostRadius - 0.18 - uPressed * 0.15) * 38.0) * uPressed;
    frostRing *= 0.56 + fineTexture.x * 0.44;

    float baseMist = softGlow(point, vec2(0.0, -0.49), vec2(1.75, 6.2), 1.15);
    baseMist *= 0.34 + fbmFast(point * vec2(3.1, 5.4) + vec2(clock * 0.13, -clock * 0.31)) * 0.42;
    baseMist *= 1.0 - smoothstep(0.24, 0.68, abs(point.x));
    float motes = 0.0;
    if (uQuality > 0.25)
      motes = emberField(point * vec2(1.0, 0.82), clock * 0.72, 0.06 + uQuality * 0.07);

    float flicker = mix(0.86, flameFlicker(flowingPoint, clock), 0.68);
    float temperaturePulse = 0.5 + 0.5 * sin(clock * 1.52 - flowingPoint.y * 8.0 + textureField.x * 4.0);
    vec3 color = uOuter * (coldShell * (0.62 + temperaturePulse * 0.22) + aura * 0.88 + baseMist * 0.24);
    color += uInner * (livingBody * 0.30 + filaments * 0.72 + frostRing * 0.94 + motes * 1.35);
    color += uCore * (hotCore * (1.14 + temperaturePulse * 0.36) + filaments * 0.25 + frostRing * 0.48);
    color *= uIntensity * flicker;

    float alpha = saturate(livingBody * (0.56 + textureField.z * 0.28) + hotCore * 0.28);
    alpha += aura * 0.20 + filaments * 0.18 + frostRing * 0.42 + baseMist * 0.11 + motes * 0.82;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
