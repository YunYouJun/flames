# What is Flames?

Flames is a small, framework-agnostic Three.js runtime for procedural flame experiences. A preset selects one of a limited set of shader kernels and supplies palette, movement, turbulence, scale, and intensity parameters.

It powers the companion “异火榜” web experience, but the engine itself has no dependency on Vue or Nuxt.

The project deliberately avoids one complete shader per catalog entry. Shared kernels keep GPU program count bounded while optional special passes can preserve the identity of exceptional flames.
