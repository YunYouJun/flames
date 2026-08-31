# Preset Configuration

Every preset selects a `void`, `lotus`, `cold`, or `fluid` kernel and provides four visual controls:

| Field | Purpose |
| --- | --- |
| `speed` | Animation clock multiplier |
| `scale` | Flame footprint inside the canvas |
| `turbulence` | Domain distortion strength |
| `intensity` | Emissive color multiplier |

Use `validateFlamePreset` during authoring, and `validateFlameCatalog` to reject duplicate ids or ranks.

Reviewed variants use typed kernel options. Lotus presets select a `bloomMode`; fluid presets currently use the `tidal` flow mode.

Runtime quality can be set to `high`, `balanced`, or `lite`. The associated device-pixel-ratio caps are 2, 1.5, and 1.
