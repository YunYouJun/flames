import { sharedFragment } from './shared'

export const voidFragmentShader = /* glsl */ `
  ${sharedFragment}

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    point.y += 0.04;

    vec2 pull = point - uPointer * vec2(0.28, 0.20);
    float pointerWell = exp(-dot(pull, pull) * 13.0) * (0.25 + uPressed * 0.75);
    float angle = atan(point.y + 0.1, point.x);
    point = rotate2d((0.08 + uDrag * 0.16) * sin(clock * 0.35 + angle)) * point;

    vec2 flowingPoint = advectFlame(point, clock);
    vec3 outerPlume = plumeLayers(flowingPoint, clock, 0.86 + pointerWell * 0.1, 0.022);
    vec3 innerPlume = plumeLayers(flowingPoint * vec2(1.42, 1.0), clock + 1.8, 0.72, 0.018);
    float tongues = flameTongue(flowingPoint, clock, -0.16, 2.2, 1.18, 0.13);
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.12, 5.7, 1.34, 0.14));
    float body = max(outerPlume.x, tongues * 0.72);
    float core = innerPlume.x;
    vec3 textureField = fireTexture(flowingPoint, clock * 0.94);
    float breakup = flameBreakup(flowingPoint, textureField, 0.88);
    float livingBody = body * (1.0 - breakup * 0.46);
    float dimensionalVortex = smoothstep(0.30, 0.70, uQuality);
    livingBody *= mix(1.0, 0.66, dimensionalVortex);
    float edge = saturate(livingBody - core * 0.78);
    float turbulence = textureField.x;

    vec2 ringPoint = (flowingPoint - vec2(0.0, -0.16)) * vec2(0.72, 1.0);
    float ringRadius = length(ringPoint);
    float ringAngle = atan(ringPoint.y, ringPoint.x);
    float ring = exp(-abs(ringRadius - (0.26 + pointerWell * 0.05)) * 34.0);
    ring *= 0.38 + 0.42 * noise21(vec2(ringAngle * 9.0, clock)) + textureField.z * 0.20;

    float spiralPhase = ringAngle * 3.0 - log(max(ringRadius, 0.035)) * 8.0 + clock * 1.1 + uDrag * 2.2;
    float spiral = pow(0.5 + 0.5 * cos(spiralPhase), 9.0);
    spiral *= smoothstep(0.08, 0.24, ringRadius) * (1.0 - smoothstep(0.28, 0.66, ringRadius));
    spiral *= 0.42 + pointerWell * 0.58;

    float swallow = saturate(core * (0.72 + turbulence * 0.30) + breakup * livingBody * 0.42);
    vec3 rimColor = mix(uOuter, uInner, turbulence);
    float aura = max(outerPlume.y - body * 0.64, 0.0);
    float embers = 0.0;
    if (uQuality > 0.25)
      embers = emberField(rotate2d(-0.32) * point, clock * 0.78, 0.06 + uQuality * 0.08);

    float flicker = flameFlicker(flowingPoint, clock);
    vec3 color = rimColor * edge * (1.02 + turbulence * 0.78 + textureField.y * 0.34) * flicker;
    color += uCore * (ring * (0.72 + uPressed * 0.82) + spiral * 0.52 + embers * 1.28);
    color += uOuter * aura * 0.62;
    color *= uIntensity * mix(1.0, 0.78, dimensionalVortex);
    color *= 1.0 - swallow * 0.76;

    float alpha = saturate(livingBody * (0.58 + textureField.z * 0.24) + edge * 0.48 + ring * 0.44 + spiral * 0.26 + aura * 0.20 + embers * 0.82 + pointerWell * 0.10);
    alpha *= mix(1.0, 0.80, dimensionalVortex);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
