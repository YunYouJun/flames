import { sharedFragment } from './shared'

export const coldFragmentShader = /* glsl */ `
  ${sharedFragment}

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    point.y += 0.09;
    point.x += sin(point.y * 4.0 + clock * 0.45) * 0.018;

    float body = plume(point, clock * 0.72, 0.78 + uPressed * 0.06, 0.022);
    float detail = fbm(point * vec2(7.0, 5.2) - vec2(0.0, clock * 0.38));

    vec2 crystalPoint = point - vec2(0.0, -0.28);
    float radius = length(crystalPoint);
    float angle = atan(crystalPoint.y, crystalPoint.x);
    float rays = pow(abs(cos(angle * 6.0 + clock * 0.08)), 22.0);
    rays *= smoothstep(0.42, 0.08, radius) * (0.55 + uPressed * 0.45);

    vec2 pointerDelta = point - uPointer * vec2(0.48, 0.38);
    float frostRadius = length(pointerDelta);
    float frostRing = exp(-abs(frostRadius - 0.16 - uPressed * 0.05) * 32.0) * uPressed;
    frostRing *= 0.55 + 0.45 * cos(angle * 8.0);

    float mask = max(body, rays * 0.82);
    float heat = saturate(mask * (0.58 + detail * 0.58));
    vec3 color = flameGradient(heat) * (0.78 + heat * 0.92);
    color += uCore * (rays * 0.45 + frostRing * 0.65);
    color *= uIntensity;

    float alpha = saturate(mask * (0.65 + detail * 0.36) + frostRing * 0.32);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
  }
`
