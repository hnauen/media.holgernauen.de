# Music

## Images

- Booklet
  - 12x12 cm
  - 1cm Rand
  - 600 dpi, 5910 x 3070
  - 1200 dpi, 11820 x 6140
  - Unscharf maskieren: Radius 1px, Faktor 0.5, Schwellwenwert 0%
  - JPEG 85%
- Cover
  - 12x12 cm
  - 1cm Rand
  - 1200 dpi, 6140 x 6140
  - JPEG, ca. 300-400kB
- Inlay
  - 15,1x11,8 cm
  - 1cm Rand
  - 1200 dpi: 7610 x 6050

## Converter

```sh
for f in *.wma; do echo "$f"; done
for f in *.wma; do ffmpeg -i "$f" -codec alac ../"${f%.wma}.m4a"; done
```

## Stuff

DE: „Gänsefüßchen“ ‚Gänsefüßchen‘
EN: “Gänsefüßchen” ‘Gänsefüßchen’
FR: «Gänsefüßchen» ‹Gänsefüßchen›

℗
©

- dash
– en dash
— em dash
