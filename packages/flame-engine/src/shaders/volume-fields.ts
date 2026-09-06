/** Family-specific three-dimensional density fields; all coordinates are object-space. */
export const volumeFields = /* glsl */ `
  float ball(vec3 p, vec3 radii) {
    return 1.0 - smoothstep(0.65, 1.0, length(p / radii));
  }
  float carved(vec3 p, vec3 radii) {
    vec3 q = abs(p / radii);
    return 1.0 - smoothstep(0.7, 1.0, pow(dot(q * q, q * q), 0.25));
  }
  float tube(float distanceToAxis, float width) {
    return 1.0 - smoothstep(width * 0.4, width, distanceToAxis);
  }
  float ringField(vec3 p, float radius, float width) {
    return tube(length(vec2(length(p.xz) - radius, p.y)), width);
  }
  vec2 turn(vec2 p, float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
  }
  // Per-sample anatomy channels keep eye emission separate from the flame body.
  float dragonMask;
  float dragonDensity;
  float dragonEyes;
  float beastMask;
  float beastDensity;
  float beastEyes;
  float filament(vec3 p, vec3 start, vec3 end, float width) {
    vec3 axis = end - start;
    float along = clamp(dot(p - start, axis) / dot(axis, axis), 0.0, 1.0);
    return tube(length(p - start - axis * along), width);
  }
  float dragonHead(vec3 q, float grain) {
    if (abs(q.x) > 0.5 || abs(q.y) > 0.58 || abs(q.z) > 0.52) return 0.0;
    float jawOpen = 0.035 + uPressed * 0.075 + (0.5 + 0.5 * sin(uTime * 1.7)) * 0.014;
    vec3 cranium = q - vec3(0.0, 0.015, -0.065);
    cranium.x *= 1.0 + smoothstep(-0.05, 0.19, q.z) * 0.35;
    float skull = ball(cranium, vec3(0.20, 0.16, 0.205));
    float muzzle = carved(q - vec3(0.0, -0.015, 0.22), vec3(0.087, 0.060, 0.20));
    vec3 jaw = q - vec3(0.0, -0.075, 0.18);
    jaw.y += jawOpen * smoothstep(0.0, 0.35, q.z);
    float mandible = carved(jaw, vec3(0.086, 0.035, 0.175));
    float nostrils = ball(vec3(abs(q.x) - 0.064, q.y - 0.025, q.z - 0.354), vec3(0.028, 0.033, 0.045));
    float socket = ball(vec3(abs(q.x) - 0.135, q.y - 0.04, q.z - 0.085), vec3(0.085, 0.055, 0.11));
    float brow = ball(vec3(abs(q.x) - 0.12, q.y - 0.095 - (abs(q.x) - 0.1) * 0.5, q.z - 0.055), vec3(0.10, 0.035, 0.11));
    // Broad roots taper into swept tips, sized to survive balanced-quality steps.
    float hornProgress = clamp((q.y - 0.08) / 0.39, 0.0, 1.0);
    vec2 hornAxis = vec2(0.13 + hornProgress * 0.13, -0.10 - hornProgress * hornProgress * 0.18);
    float horns = tube(length(vec2(abs(q.x), q.z) - hornAxis), mix(0.060, 0.012, hornProgress));
    horns *= smoothstep(0.045, 0.10, q.y) * (1.0 - smoothstep(0.43, 0.49, q.y));
    vec3 side = vec3(abs(q.x), q.y, q.z);
    horns = max(horns, filament(side, vec3(0.20, 0.29, -0.16), vec3(0.30, 0.37, -0.10), 0.024));
    float flutter = sin(uTime * 3.0 + q.z * 10.0) * 0.025;
    float whiskers = filament(side, vec3(0.105, -0.03, 0.29), vec3(0.28, -0.08 + flutter, 0.26), 0.021);
    whiskers = max(whiskers, filament(side, vec3(0.28, -0.08 + flutter, 0.26), vec3(0.43, -0.025 + flutter, 0.02), 0.015));
    float eye = ball(vec3(abs(q.x) - 0.14, q.y - 0.045 - (abs(q.x) - 0.14) * 0.45, q.z - 0.12), vec3(0.045, 0.019, 0.065));
    float neck = ball(q - vec3(0.0, -0.17, -0.12), vec3(0.115, 0.23, 0.13));
    float anatomy = max(max(skull * (1.0 - socket), muzzle * (1.0 - nostrils) * 1.25), mandible * 1.3);
    anatomy = max(anatomy, neck * 0.75);
    float fireGrain = noise(q * 20.0 - vec3(0.0, uTime * 2.5, 0.0));
    anatomy = max(anatomy, max(brow * 1.3, horns * 1.5)) * (0.45 + grain * 0.25) * (0.35 + fireGrain * 0.95);
    anatomy = max(anatomy, max(whiskers * (0.5 + grain * 0.4), eye * 1.7));
    float mask = ball(q - vec3(0.0, 0.07, 0.06), vec3(0.34, 0.33, 0.46));
    dragonMask = max(dragonMask, mask);
    dragonDensity = max(dragonDensity, anatomy);
    dragonEyes = max(dragonEyes, eye);
    return anatomy;
  }
  float familyDensity(vec3 p, float base) {
    if (uFamily == 0.0 && uVariant == 0.0) return base;
    float t = uTime;
    // Bend the family silhouette too, not only the generic central flame.
    if (uFamily >= 4.0 && uFamily <= 7.0)
      p.xz -= uBend.xz * p.y * p.y * 0.65;
    vec3 anatomy = p;
    float n = fbm(p * 5.0 - vec3(0.0, t * 2.0, 0.0));
    float warp = uFamily == 4.0 && uVariant == 1.0 ? 0.035 : 0.11;
    p.xz += vec2(n - 0.5, noise(p * 7.0 - vec3(0.0, t * 2.4, 0.0)) - 0.5) * warp * min(p.y, 1.0);
    float a = atan(p.z, p.x);
    float r = length(p.xz);
    float shape = 0.0;
    if (uFamily == 1.0) {
      float earth = step(1.5, uVariant);
      float karmic = 1.0 - step(0.5, abs(uVariant - 1.0));
      // Rounded petal sections wrap around the axis in true object space.
      // Earth opens low; purification opens upward; karma closes into a bud.
      float lift = mix(0.22, 0.10, earth);
      lift = mix(lift, 0.62, karmic);
      float petalAngle = a + t * mix(0.12, 0.045, earth);
      float lobes = pow(0.5 + 0.5 * cos(petalAngle * 8.0 + p.y * karmic * 2.0), 2.0);
      float petalHeight = 0.12 + r * lift + lobes * mix(0.11, 0.05, earth);
      float reach = mix(0.62, 0.68, earth);
      reach = mix(reach, 0.39, karmic);
      float petals = tube(abs(p.y - petalHeight), 0.045 + n * 0.035);
      petals *= smoothstep(0.1, 0.22, r) * (1.0 - smoothstep(reach * 0.65, reach, r));
      petals *= (0.18 + lobes * 0.82) * (0.35 + n);
      if (karmic > 0.5) {
        float budRadius = 0.15 + sin(clamp(p.y / 1.15, 0.0, 1.0) * 3.14159) * 0.18;
        float ribs = pow(0.5 + 0.5 * cos(a * 5.0 + p.y * 5.0 - t * 0.8), 4.0);
        float bud = tube(abs(r - budRadius), 0.055 + n * 0.045);
        petals = max(petals, bud * ribs * smoothstep(0.18, 0.35, p.y) * (1.0 - smoothstep(0.85, 1.18, p.y)) * (0.3 + n));
        // Spider-lily-inspired curling flame threads, not a botanical replacement.
        float curl = 0.37 + 0.13 * sin(p.y * 5.5 - 0.8);
        float threads = pow(max(0.0, cos(a * 7.0 + p.y * 3.0 + sin(t * 0.9) * 0.4)), 18.0);
        float filament = tube(abs(r - curl), 0.035 + n * 0.025) * threads;
        filament *= smoothstep(0.2, 0.4, p.y) * (1.0 - smoothstep(0.7, 0.98, p.y));
        petals = max(petals, filament * (0.6 + n) * (0.65 + uPressed * 0.5));
      }
      return max(base * mix(0.9, 0.65, karmic), petals);
    }
    // Swallowing void: a hollow, flowing corona around the opaque 3D core.
    if (uFamily == 2.0) {
      vec3 q = p - vec3(0.0, 0.89, 0.0);
      float distanceToCore = length(q);
      distanceToCore *= 1.0 + uPressed * 0.12;
      float inflow = noise(normalize(q + vec3(0.001)) * 5.0 * (distanceToCore + t * 0.23));
      float shell = abs(distanceToCore - (0.50 + 0.08 * inflow));
      shape = tube(shell, 0.085) * smoothstep(0.3, 0.7, inflow);
      float spiral = pow(max(0.0, cos(a * 3.0 + distanceToCore * 14.0 + t * 2.2)), 6.0);
      shape += ringField(q, 0.62, 0.09) * spiral * 0.8;
      return shape * (1.0 + uPressed * 0.65);
    }
    // Cold fire: six angular ribs and a thin, rising inner flame.
    if (uFamily == 3.0) {
      float ribs = pow(max(0.0, cos(a * 6.0 + p.y * 0.7 + sin(p.y * 5.0 - t * 1.6) * 0.25)), 6.0);
      float radius = 0.38 * (1.0 - p.y / 1.8);
      shape = tube(abs(r - radius), 0.065) * ribs;
      float fracture = smoothstep(0.24, 0.64, n);
      float coldRing = ringField(p - vec3(0.0, 0.13, 0.0), 0.28 + uPressed * 0.26, 0.035);
      coldRing *= (0.25 + uPressed) * (0.35 + 0.65 * fracture);
      return max(coldRing, max(base * 0.72, shape * fracture * 1.35)) * (1.0 - smoothstep(1.35, 1.8, p.y));
    }
    if (uFamily == 4.0) {
      if (uVariant == 1.0) {
        // Living fire: upright pointed leaves arranged around a central stem.
        shape = tube(r, 0.065) * (1.0 - smoothstep(1.3, 1.65, p.y));
        for (int i = 0; i < 5; i++) {
          float cycle = fract(t * 0.12 + float(i) * 0.19);
          float growth = smoothstep(0.0, 0.38, cycle) * (1.0 - smoothstep(0.78, 1.0, cycle));
          float h = 0.16 + float(i) * 0.23;
          vec3 q = p - vec3(0.0, h, 0.0);
          q.xz = turn(q.xz, float(i) * 2.4 + sin(t * 0.7) * 0.08);
          float progress = q.y / (0.43 + growth * 0.12 + uPressed * 0.07);
          float profile = sin(clamp(progress, 0.0, 1.0) * 3.14159);
          float width = 0.19 * pow(max(profile, 0.0), 0.85) * (0.65 + growth * 0.35);
          // Tip remains above the root through growth and sway; no leaf flips.
          q.x -= 0.015 + progress * 0.36;
          q.z -= sin(progress * 3.0 + t * 1.1 + float(i)) * profile * 0.025;
          float section = length(vec2(q.x / max(width, 0.003), q.z / (0.035 + profile * 0.03)));
          float leaf = 1.0 - smoothstep(0.65, 1.0, section);
          float ends = smoothstep(0.0, 0.09, progress) * (1.0 - smoothstep(0.9, 1.0, progress));
          float vein = tube(length(q.xz), 0.022) * ends;
          leaf *= ends * (0.45 + growth * 0.55) * (0.5 + n * 0.35);
          shape = max(shape, max(leaf, vein * (1.0 + growth * 0.6)));
        }
        return max(shape, base * 0.17);
      }
      if (uVariant == 2.0) {
        // Two torn cloud shelves connected by fine downward-running flame threads.
        for (int i = 0; i < 2; i++) {
          float h = 0.38 + float(i) * 0.55 + sin(t + float(i)) * 0.04;
          vec3 q = p - vec3(sin(t * 0.6 + float(i)) * 0.08, h, 0.0);
          q.xz = turn(q.xz, float(i) * 1.3 + sin(t * 0.25) * 0.12);
          float span = length(q.xz / vec2(0.61 - float(i) * 0.06, 0.40));
          float billow = sin(q.x * 9.0 - t * 1.3 + float(i)) * 0.055
            + sin(q.z * 11.0 + t * 0.9) * 0.04;
          float shred = noise(q * 21.0 - vec3(t * 0.3, t * 2.0, 0.0));
          float sheet = tube(abs(q.y - billow), 0.025 + n * 0.035 + shred * 0.025 + uPressed * 0.025);
          float tornEdge = 1.0 - smoothstep(0.55 + shred * 0.18, 0.80 + shred * 0.25, span);
          float fireGrain = 0.3 + 0.7 * smoothstep(0.3, 0.65, n);
          shape = max(shape, sheet * tornEdge * fireGrain * 0.9);
        }
        float strands = pow(max(0.0, cos(a * 7.0 + sin(p.y * 4.0 + t) * 0.5)), 14.0);
        strands *= tube(abs(r - 0.29), 0.085) * smoothstep(0.27, 0.4, p.y) * (1.0 - smoothstep(0.8, 0.96, p.y));
        strands *= 0.35 + 0.65 * pow(0.5 + 0.5 * sin(p.y * 20.0 + t * 4.0), 3.0);
        return max(base * 0.16, max(shape, strands * (0.8 + uPressed * 0.5)));
      }
      if (uVariant == 3.0) {
        // Poison: a heavy low pool and falling globules around the plume.
        vec3 pool = p - vec3(0.0, 0.18, 0.0);
        pool.y += sin(a * 5.0 + t * 1.4) * 0.025 + (n - 0.5) * 0.09;
        shape = ball(pool, vec3(0.61, 0.16, 0.61)) * (0.2 + smoothstep(0.30, 0.65, n) * 0.65);
        for (int i = 0; i < 4; i++) {
          float phase = float(i) * 1.57 + t * 0.35;
          float cycle = fract(float(i) * 0.27 + t * 0.24);
          vec3 drop = vec3(cos(phase) * 0.37, 0.18 + cycle * 0.25, sin(phase) * 0.37);
          float size = 0.045 + cycle * 0.085;
          float bubble = ball(p - drop, vec3(size)) * (1.0 - smoothstep(0.7, 1.0, cycle));
          float hollow = 1.0 - ball(p - drop, vec3(size * 0.64));
          shape = max(shape, bubble * hollow * 1.2);
        }
        float feelers = pow(max(0.0, cos(a * 2.0 + p.y * 3.0 - t * 0.5)), 12.0);
        feelers *= tube(abs(r - (0.35 - p.y * 0.1)), 0.075) * (1.0 - smoothstep(0.8, 1.3 + uPressed * 0.2, p.y));
        return max(base * 0.32, max(shape * 0.65, feelers * (0.35 + n)));
      }
      // Sea-heart: a rotating, flared wave funnel, open at its center.
      float flare = 0.15 + p.y * 0.42;
      float waves = sin(a * 3.0 - t * 2.0 + p.y * 4.0) * (0.06 + uPressed * 0.055);
      flare -= smoothstep(0.65, 1.1, p.y) * 0.22;
      shape = tube(abs(r - flare - waves), 0.10) * (1.0 - smoothstep(0.8, 1.2, p.y));
      return max(base * 0.25, shape * (0.4 + n * 0.6));
    }
    if (uFamily == 5.0) {
      float angle = p.y * 5.8 - t * 2.1;
      if (uVariant == 1.0) {
        // Wind dragon: a thick ascending coil and a forked crest.
        vec2 spine = vec2(cos(angle), sin(angle)) * (0.30 - p.y * 0.09);
        // Keep a readable coil, but break its silhouette into hot, shed filaments.
        shape = tube(length(p.xz - spine), 0.12 + 0.09 * n);
        vec2 secondSpine = -spine * 0.85;
        shape = max(shape, tube(length(p.xz - secondSpine), 0.065 + n * 0.045) * 0.7);
        shape *= 1.0 - smoothstep(1.5, 1.8, p.y);
        vec3 head = anatomy - vec3(cos(8.8-t*2.1)*0.17, 1.52 + uPressed * 0.08, sin(8.8-t*2.1)*0.17);
        head.xz = turn(head.xz, 8.8 - t * 2.1);
        shape = max(shape, dragonHead(head, n));
        float mane = tube(abs(length(head.xz) - 0.22), 0.045);
        mane *= pow(max(0.0, cos(atan(head.z, head.x) * 5.0 + head.y * 9.0 - t * 3.0)), 4.0);
        shape = max(shape, mane * (1.0 - smoothstep(0.10, 0.31, abs(head.y))));
      }
      else {
        // Seven low, cross-flowing wind bands leave an open eye, not a tornado cone.
        for (int i = 0; i < 7; i++) {
          float layer = float(i);
          float drift = sin(t * 0.8 + layer * 2.4) * 0.038;
          vec3 q = p - vec3(sin(t * 0.5 + layer) * 0.055, 0.22 + layer * 0.145 + drift, 0.0);
          q.xz = turn(q.xz, sin(t * 0.3 + layer) * 0.18 + layer * 0.22);
          float sweep = sin(q.x * 5.0 - t * (1.6 + layer * 0.12) + layer) * (0.04 + uPressed * 0.055);
          float band = tube(abs(q.y - sweep), 0.035 + n * 0.025 + uPressed * 0.018);
          float reach = 0.57 + sin(layer * 2.1 + t * 0.6) * 0.10;
          band *= 1.0 - smoothstep(0.7, 1.0, length(q.xz / vec2(reach, 0.3)));
          band *= smoothstep(0.12, 0.24, r) * (0.25 + n * 0.65);
          shape = max(shape, band);
        }
        return max(base * 0.07, shape);
      }
      return max(base * 0.65, shape * smoothstep(0.2, 0.7, n) * 1.4);
    }
    if (uFamily == 6.0) {
      if (uVariant == 1.0) {
        // Long stellar dragon: a slower serpentine arc, distinct from the wind coil.
        float phase = p.y * 3.9 + t * 0.4;
        vec2 spine = vec2(sin(phase) * 0.29, cos(phase * 0.8) * 0.18);
        shape = tube(length(p.xz - spine), 0.095 + n * 0.07) * (0.4 + n * 0.5);
        shape *= smoothstep(0.05, 0.18, p.y) * (1.0 - smoothstep(1.4, 1.63, p.y));
        float headPhase = 1.43 * 3.9 + t * 0.4;
        vec3 head = anatomy - vec3(sin(headPhase) * 0.29, 1.43 + uPressed * 0.08, cos(headPhase * 0.8) * 0.18);
        head.xz = turn(head.xz, sin(t * 0.4) * 0.5);
        shape = max(shape, dragonHead(head, n));
        for (int i = 0; i < 3; i++) {
          float phase = t * (0.7 + float(i) * 0.13) + float(i) * 2.1;
          vec3 star = vec3(cos(phase) * 0.53, 0.78 + sin(phase * 2.0) * 0.26, sin(phase) * 0.53);
          shape = max(shape, ball(p - star, vec3(0.075)));
        }
        return max(base * 0.3, shape);
      }
      if (uVariant == 2.0) {
        // Turtle: domed shell, forward head, and four low flame limbs.
        vec3 shell = p - vec3(0.0, 0.44, 0.0);
        float shellRadius = length(shell / vec3(0.48, 0.29, 0.56));
        float plates = pow(0.5 + 0.5 * cos(a * 6.0 + sin(r * 9.0)), 9.0);
        float seams = max(plates, pow(0.5 + 0.5 * cos(r * 28.0), 12.0));
        shape = tube(abs(shellRadius - 0.88), 0.18) * (0.2 + seams * 0.85);
        shape *= smoothstep(0.18, 0.3, p.y);
        float head = carved(p - vec3(0.0, 0.44, 0.59), vec3(0.11, 0.10, 0.19));
        float mouth = tube(abs(p.y - 0.40), 0.025) * smoothstep(0.59, 0.66, p.z);
        shape = max(shape, head * (1.0 - mouth));
        float eyes = ball(vec3(abs(p.x) - 0.07, p.y - 0.48, p.z - 0.68), vec3(0.025, 0.021, 0.038));
        shape = max(shape, eyes * 1.6);
        float feet = carved(vec3(abs(p.x) - 0.38, p.y - 0.18, abs(p.z) - 0.34), vec3(0.13, 0.10, 0.18));
        shape = max(shape, feet * (0.35 + n * 0.8));
        vec3 tail = p - vec3(sin(t * 0.6) * 0.045, 0.25, -0.56);
        shape = max(shape, ball(tail, vec3(0.11, 0.09, 0.23)));
        // Flame spines and forward tusks, not a smooth decorative turtle shell.
        for (int i = 0; i < 5; i++) {
          float index = float(i);
          vec3 root = vec3(sin(index * 2.4) * 0.24, 0.63 - mod(index, 2.0) * 0.045, (index - 2.0) * 0.11);
          vec3 tip = root + vec3(root.x * 0.25, 0.16 + uPressed * 0.10 + n * 0.04, -0.05);
          shape = max(shape, filament(p, root, tip, 0.04) * (0.8 + uPressed * 0.5));
        }
        vec3 tusk = vec3(abs(p.x), p.y, p.z);
        shape = max(shape, filament(tusk, vec3(0.08, 0.42, 0.64), vec3(0.11, 0.57, 0.70), 0.03) * 1.2);
        return max(base * 0.32, shape * (0.25 + smoothstep(0.2, 0.72, n) * 0.95 + uPressed * 0.3));
      }
      if (uVariant == 3.0) {
        // Red fire stays the subject. Seven is an art-direction budget, not a lore claim.
        float phase = mod(atan(anatomy.x, anatomy.z) + 3.14159265 + t * 0.12, 6.2831853);
        float identity = floor(phase / 0.8975979);
        float sector = phase - (identity + 0.5) * 0.8975979;
        float radius = length(anatomy.xz);
        float cycle = pow(0.5 + 0.5 * sin(t * 1.15 + identity * 2.4), 2.0);
        float emergence = mix(cycle, 1.0, uPressed);
        float height = 0.48 + fract(identity * 0.618) * 0.60 + sin(t * 1.4 + identity) * 0.025;
        vec3 face = vec3(radius * sin(sector), anatomy.y - height, radius * cos(sector) - (0.46 + sin(identity * 2.0) * 0.025));
        if (abs(face.x) < 0.24 && abs(face.y) < 0.38 && abs(face.z) < 0.26) {
          float kind = mod(identity, 3.0);
          float pointed = 1.0 - step(0.5, kind);
          float horned = step(1.5, kind);
          vec3 side = vec3(abs(face.x), face.y, face.z);
          vec3 skullPoint = face;
          skullPoint.x *= 1.0 + (1.0 - smoothstep(-0.18, 0.0, face.y)) * 0.3;
          float skull = carved(skullPoint, vec3(0.15, 0.16, 0.11));
          float sockets = ball(side - vec3(0.083, 0.027, 0.090), vec3(0.060, 0.043, 0.075));
          float muzzle = carved(face - vec3(0.0, -0.060, 0.11), vec3(0.08, 0.052, 0.09 + pointed * 0.05));
          float jawGap = tube(abs(face.y + 0.082 + uPressed * 0.025), 0.018) * smoothstep(0.075, 0.11, face.z);
          float earWidth = mix(0.065, 0.035, pointed);
          float ears = ball(side - vec3(0.125, 0.16 + pointed * 0.025, -0.015), vec3(earWidth, 0.065 + pointed * 0.085, 0.055));
          float horns = filament(side, vec3(0.13, 0.12, -0.02), vec3(0.19, 0.32, -0.075), 0.032) * horned;
          float brow = filament(side, vec3(0.035, 0.07, 0.12), vec3(0.135, 0.095, 0.07), 0.028);
          float eyes = ball(side - vec3(0.084, 0.031, 0.12), vec3(0.031, 0.018, 0.035));
          float grain = noise(face * 24.0 - vec3(0.0, t * 3.5, 0.0));
          float faceFire = max(skull * (1.0 - sockets), muzzle * (1.0 - jawGap));
          faceFire = max(faceFire, max(brow, max(ears, horns)));
          faceFire *= (0.40 + grain * 0.70) * emergence;
          beastMask = ball(face, vec3(0.21, 0.22, 0.24)) * emergence;
          beastDensity = max(faceFire, eyes * emergence * 1.3);
          beastEyes = eyes * emergence;
          shape = beastDensity;
          // A ragged rising wake reconnects each apparition to the fire, not a rigid orbit.
          float wake = tube(length(face.xz + vec2(sin(face.y * 9.0 - t * 3.0) * 0.045, 0.025)), 0.06 + n * 0.045);
          wake *= smoothstep(0.14, 0.20, face.y) * (1.0 - smoothstep(0.25, 0.38, face.y));
          shape = max(shape, wake * emergence * 0.6);
        }
        return max(base * 0.85, shape);
      }
      // Three orbital levels, three heads each: nine sources with broken arc tails.
      for (int i = 0; i < 3; i++) {
        float layer = float(i);
        float phase = a - t * (0.75 + layer * 0.14) - layer * 0.7;
        float sector = mod(phase + 1.0472, 2.0944) - 1.0472;
        float radius = 0.48 - layer * 0.045;
        float height = 0.32 + layer * 0.46;
        float headPhase = atan(anatomy.z, anatomy.x) - t * (0.75 + layer * 0.14) - layer * 0.7;
        float headSector = mod(headPhase + 1.0472, 2.0944) - 1.0472;
        float headRadius = length(anatomy.xz);
        vec3 head = vec3(headRadius * sin(headSector), anatomy.y - height, headRadius * cos(headSector) - radius);
        // Turn each snout along its orbit; the same carved silhouette scales down.
        head.xz = turn(head.xz, 1.5708);
        float heads = dragonHead(head * 1.4, n);
        float jitter = sin(floor(a * 16.0) * 2.7 + floor(t * 8.0) + layer) * 0.028;
        vec3 arc = p - vec3(0.0, height + sin(phase * 3.0) * 0.07, 0.0);
        float tail = ringField(arc, radius + jitter, 0.05);
        tail *= smoothstep(-1.0, -0.2, sector) * (1.0 - smoothstep(0.3, 0.85, sector));
        shape = max(shape, max(heads, tail * (1.1 + n)));
      }
      return max(base * 0.35, shape);
    }
    if (uFamily == 7.0) {
      if (uVariant == 1.0) {
        float phase = p.y * 4.0 - t;
        vec2 axis = vec2(cos(phase), sin(phase)) * 0.24;
        shape = max(tube(length(p.xz - axis), 0.15), tube(length(p.xz + axis), 0.15));
        float seal = ringField(p - vec3(0.0, 0.13, 0.0), 0.38 + uPressed * 0.08, 0.028);
        return max(seal, shape * (1.0 - smoothstep(1.1, 1.65, p.y)) * (0.5 + 0.5 * n));
      }
      // The heart is a heat pulse, not a solid anatomical heart or a white egg.
      float beatPhase = fract(t * 0.43);
      float beat = exp(-pow((beatPhase - 0.12) * 20.0, 2.0)) + 0.6 * exp(-pow((beatPhase - 0.32) * 20.0, 2.0));
      float snakeAngle = p.y * 5.0 - t * 0.65;
      vec2 snake = vec2(cos(snakeAngle), sin(snakeAngle)) * (0.27 + sin(p.y * 3.0) * 0.06);
      float serpent = tube(length(p.xz - snake), 0.07 + uPressed * 0.02) * (1.0 - smoothstep(1.25, 1.5, p.y));
      float headAngle = 1.37 * 5.0 - t * 0.65;
      vec3 head = vec3(cos(headAngle), 0.0, sin(headAngle)) * (0.27 + sin(1.37 * 3.0) * 0.06);
      head.y = 1.37;
      serpent = max(serpent, ball(p - head, vec3(0.075, 0.11, 0.08)) * 0.7);
      float pulseRing = ringField(p - vec3(0.0, 0.76, 0.0), 0.19 + beatPhase * 0.36 + uPressed * 0.13, 0.028);
      pulseRing *= (1.0 - beatPhase) * (0.55 + beat * 0.65 + uPressed * 0.4);
      return max(base * 0.09, max(serpent * (0.32 + n * 0.32 + uPressed * 0.14), pulseRing));
    }
    if (uFamily == 8.0) {
      if (uVariant == 1.0) {
        // A compact seed with fissures, surrounded by short, uneven flame shoots.
        vec3 seed = p - vec3(0.0, 0.22, 0.0);
        float shell = ball(seed, vec3(0.27, 0.23, 0.27));
        float fissures = pow(0.5 + 0.5 * sin(a * 5.0 + p.y * 12.0 + n * 3.0), 8.0);
        shape = shell * (0.18 + fissures * 0.95);
        float shoots = pow(max(0.0, cos(a * 3.0 + p.y * 5.0 - t * 1.2)), 4.0);
        float collar = tube(abs(r - (0.27 - p.y * 0.18)), 0.08 + n * 0.04);
        shape = max(shape, collar * shoots * smoothstep(0.05, 0.2, p.y) * (1.0 - smoothstep(0.45, 0.9, p.y)));
        return max(base * 0.85, shape);
      }
      float angular = 0.4 + 0.07 * cos(a * 5.0);
      shape = tube(abs(r - angular * (1.0 - p.y)), 0.13) * (1.0 - smoothstep(0.65, 1.0, p.y));
      float fissures = pow(max(0.0, cos(a * 5.0 + sin(p.y * 9.0 + t * 0.6) * 0.5)), 10.0);
      shape *= 0.1 + fissures * (0.5 + n);
      return max(base * (0.85 + sin(t * 2.2) * 0.15), shape);
    }
    if (uFamily == 0.0 && uVariant > 0.5) {
      if (uVariant == 1.0) {
        // A pair of swept membranes, not eight identical radial spokes.
        float reach = abs(p.x);
        float sweep = sin(reach * 6.0 - t * 1.8) * reach * 0.10;
        float lift = 0.28 + reach * 0.87 + sweep + uPressed * reach * 0.12;
        float ribs = pow(0.5 + 0.5 * sin(reach * 24.0 + p.z * 6.0 - t * 1.2), 4.0);
        float swept = p.z + reach * reach * 0.42;
        float spread = tube(abs(swept), 0.19 + reach * 0.08);
        float fan = sin(clamp(reach / 0.82, 0.0, 1.0) * 3.14159);
        float thickness = 0.08 + fan * 0.22 + ribs * 0.05 + uPressed * 0.045;
        float wing = tube(abs(p.y - lift), thickness);
        wing *= spread * smoothstep(0.065, 0.16, reach) * (1.0 - smoothstep(0.67, 0.79, reach));
        // Continuous burning membranes with brighter veins, not isolated feather dots.
        shape = wing * (0.75 + ribs * 0.50) * (0.65 + n * 0.45);
        // The axial fire remains visible edge-on, when the wings overlap.
        return max(base * 1.1, shape);
      }
      if (uVariant == 2.0) {
        float width = 0.27 - floor(p.y * 3.0) * 0.04;
        shape = 1.0 - smoothstep(width * 0.65, width, max(abs(p.x), abs(p.z)));
        float cracks = pow(0.5 + 0.5 * sin(p.y * 29.0 + sin(a * 4.0) * 2.0), 12.0);
        shape *= (0.16 + cracks * 0.85) * (1.0 - smoothstep(1.2, 1.55, p.y));
        for (int i = 0; i < 3; i++) {
          float level = float(i);
          vec3 q = p - vec3(0.0, 0.30 + level * 0.36, 0.0);
          float fragments = smoothstep(-0.1, 0.4, sin(a * 5.0 + level * 1.7 + t * 0.24));
          shape = max(shape, ringField(q, 0.34 - level * 0.045, 0.045) * fragments * (0.8 + uPressed * 0.4));
        }
        return max(base * 0.32, shape * (0.7 + n * 0.65) * 1.5);
      }
      // A taller converging core anchors four orbital crowns, instead of stacked loose rings.
      for (int i = 0; i < 4; i++) {
        float level = float(i);
        float direction = mod(level, 2.0) * 2.0 - 1.0;
        vec3 q = p - vec3(0.0, 0.30 + level * 0.33, 0.0);
        q.xz -= uBend.xz * (0.15 + level * 0.12);
        q.xz = turn(q.xz, t * (0.18 + level * 0.07) * direction);
        q.xy = turn(q.xy, sin(t * 0.24 + level * 1.8) * 0.11);
        float orbitRadius = 0.56 - level * 0.09 + uPressed * (0.065 - level * 0.008);
        float crownAngle = atan(q.z, q.x);
        float breaks = smoothstep(-0.55, 0.10, cos(crownAngle * 5.0 + level));
        float crown = ringField(q, orbitRadius, 0.055 + n * 0.025) * (0.3 + breaks * 0.7);
        float rays = pow(max(0.0, cos(crownAngle * 11.0)), 18.0) * tube(abs(q.y), 0.035);
        float inward = pow(0.5 + 0.5 * sin(length(q.xz) * 20.0 + t * 2.5), 3.0);
        rays *= smoothstep(0.10, 0.20, length(q.xz)) * (1.0 - smoothstep(orbitRadius * 0.8, orbitRadius, length(q.xz)));
        shape = max(shape, max(crown * (0.7 + n * 0.4), rays * inward * (0.25 + uPressed * 0.85)));
      }
      float convergence = pow(max(0.0, cos(a * 3.0 - p.y * 5.0 + t)), 6.0);
      float mantle = tube(abs(r - (0.43 - p.y * 0.19)), 0.07 + n * 0.04);
      mantle *= convergence * smoothstep(0.12, 0.30, p.y) * (1.0 - smoothstep(1.35, 1.85, p.y));
      return max(base * 1.15, max(shape * 0.85, mantle * (0.55 + n + uPressed * 0.3)));
    }
    return base;
  }
`
