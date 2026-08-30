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

    float body = plume(point, clock, 0.86 + pointerWell * 0.1, 0.026);
    float core = plume(point * vec2(1.42, 1.0), clock + 1.8, 0.72, 0.02);
    float edge = saturate(body - core * 0.78);
    float turbulence = fbm(point * 6.0 - vec2(clock * 0.32, clock * 0.58));

    float ringRadius = length((point - vec2(0.0, -0.16)) * vec2(0.72, 1.0));
    float ring = exp(-abs(ringRadius - (0.26 + pointerWell * 0.05)) * 34.0);
    ring *= 0.45 + 0.55 * noise21(vec2(angle * 9.0, clock));

    float swallow = saturate(core * (0.78 + turbulence * 0.35));
    vec3 rimColor = mix(uOuter, uInner, turbulence);
    vec3 color = rimColor * edge * (1.2 + turbulence * 0.8);
    color += uCore * ring * (0.6 + uPressed * 0.7);
    color *= uIntensity;
    color *= 1.0 - swallow * 0.76;

    float alpha = saturate(body * 0.78 + edge * 0.42 + ring * 0.38 + pointerWell * 0.10);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
  }
`
