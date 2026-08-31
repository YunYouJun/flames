# Preset Configuration

Every preset selects one of nine kernels—`void`, `lotus`, `cold`, `fluid`, `gale`, `spirit`, `soul`, `crown`, or `geofire`—and provides four visual controls:

| Field | Purpose |
| --- | --- |
| `speed` | Animation clock multiplier |
| `scale` | Flame footprint inside the canvas |
| `turbulence` | Domain distortion strength |
| `intensity` | Emissive color multiplier |

Use `validateFlamePreset` during authoring, and `validateFlameCatalog` to reject duplicate ids or ranks.

Variant families use typed kernel options: `bloomMode`, `flowMode`, `galeMode`, `spiritMode`, `soulMode`, `crownMode`, and `earthMode`. `void` and `cold` do not require variant options.

Runtime quality can be set to `high`, `balanced`, or `lite`. The associated device-pixel-ratio caps are 2, 1.5, and 1.
