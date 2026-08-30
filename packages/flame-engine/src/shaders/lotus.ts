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
    return smoothstep(1.0, 0.68, radius + cusp);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    point.y += 0.08;
    point += uPointer * vec2(0.025, -0.016) * (0.3 + uPressed * 0.7);

    float body = plume(point, clock, 0.92 + uPressed * 0.08, 0.035);
    float petals = 0.0;
    float bloom = 0.15 + uPressed * 0.10;

    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) / 6.0;
      float angle = mix(-1.25, 1.25, unit);
      vec2 petalPoint = point - vec2(sin(angle) * bloom, -0.32 + cos(angle) * 0.055);
      petals = max(petals, petal(petalPoint, angle * 0.72, 0.15, 0.31));
    }

    float innerPetals = petal(point - vec2(0.0, -0.15), 0.0, 0.12, 0.30);
    float mask = max(body, max(petals * 0.76, innerPetals * 0.86));
    float detail = fbm(point * vec2(5.8, 4.2) - vec2(0.0, clock * 0.9));
    float heat = saturate(mask * (0.40 + detail * 0.52));
    heat += exp(-dot(point - vec2(0.0, -0.22), point - vec2(0.0, -0.22)) * 24.0) * 0.36;

    float halo = exp(-dot(point * vec2(0.72, 1.0), point * vec2(0.72, 1.0)) * 2.8) * 0.15;
    vec3 color = flameGradient(heat) * (heat * 1.08 + halo) * uIntensity;
    float alpha = saturate(mask * (0.66 + detail * 0.52) + halo * 0.4);

    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
  }
`
