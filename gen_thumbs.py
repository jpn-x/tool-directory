import os

BG = {
    "stop-gap":  ("#FF8C69", "#FFC15E"),
    "screener":  ("#8B7CF8", "#5FA8F7"),
    "stop-data": ("#FFA94D", "#FFD43B"),
    "taisyaku":  ("#2FCF9E", "#7EE8B8"),
    "tdnet":     ("#3FA9F5", "#7BDFF2"),
    "watch":     ("#FF7A9C", "#FFA5A5"),
    "holdings":  ("#9775FA", "#C0A6FF"),
    "ipo":       ("#20C99E", "#7BE0A8"),
    "xsearch":   ("#5C6470", "#8C97A6"),
    "nisa":      ("#4FC3F7", "#5CE0B8"),
}

GLYPH = {
"stop-gap": '''
  <line x1="58" y1="152" x2="82" y2="152" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="58" y1="152" x2="58" y2="112" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="118" y1="152" x2="142" y2="152" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="142" y1="152" x2="142" y2="66" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="88" y1="112" x2="108" y2="112" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 12" opacity="0.85"/>
  <path d="M62 108 C 85 70, 110 60, 132 62" stroke="#FFF6B7" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M118 56 L134 60 L128 76" stroke="#FFF6B7" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
''',
"screener": '''
  <polyline points="48,130 72,95 92,118 112,68 132,100" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="128" cy="128" r="26" fill="none" stroke="#fff" stroke-width="11"/>
  <line x1="146" y1="146" x2="164" y2="164" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
''',
"stop-data": '''
  <rect x="46" y="60" width="108" height="20" rx="10" fill="#fff"/>
  <rect x="46" y="90" width="80" height="20" rx="10" fill="#fff" opacity="0.9"/>
  <rect x="46" y="120" width="56" height="20" rx="10" fill="#fff" opacity="0.75"/>
  <text x="164" y="76" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="#fff" text-anchor="end" opacity="0.9">1</text>
''',
"taisyaku": '''
  <rect x="54" y="42" width="92" height="116" rx="12" fill="none" stroke="#fff" stroke-width="10"/>
  <line x1="72" y1="74" x2="128" y2="74" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
  <line x1="72" y1="98" x2="128" y2="98" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
  <line x1="72" y1="122" x2="108" y2="122" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
  <circle cx="146" cy="52" r="14" fill="#FFE066"/>
  <text x="146" y="58" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#8a6d00" text-anchor="middle">!</text>
''',
"tdnet": '''
  <circle cx="100" cy="118" r="12" fill="#fff"/>
  <path d="M78 100 A 32 32 0 0 1 122 100" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
  <path d="M62 84 A 56 56 0 0 1 138 84" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.85"/>
  <path d="M46 68 A 80 80 0 0 1 154 68" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.65"/>
''',
"watch": '''
  <path d="M100 46 L156 148 L44 148 Z" fill="none" stroke="#fff" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>
  <line x1="100" y1="86" x2="100" y2="118" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
  <circle cx="100" cy="134" r="6.5" fill="#fff"/>
''',
"holdings": '''
  <circle cx="100" cy="100" r="54" fill="none" stroke="#fff" stroke-width="8" opacity="0.55"/>
  <circle cx="100" cy="100" r="34" fill="none" stroke="#fff" stroke-width="8" opacity="0.8"/>
  <circle cx="100" cy="100" r="8" fill="#fff"/>
  <line x1="100" y1="100" x2="140" y2="62" stroke="#FFF6B7" stroke-width="8" stroke-linecap="round"/>
  <circle cx="140" cy="62" r="9" fill="#FFF6B7"/>
''',
"ipo": '''
  <rect x="48" y="52" width="104" height="98" rx="14" fill="none" stroke="#fff" stroke-width="10"/>
  <line x1="48" y1="82" x2="152" y2="82" stroke="#fff" stroke-width="10"/>
  <line x1="76" y1="38" x2="76" y2="60" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
  <line x1="124" y1="38" x2="124" y2="60" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
  <circle cx="100" cy="116" r="22" fill="none" stroke="#FFF6B7" stroke-width="8"/>
  <line x1="100" y1="116" x2="100" y2="102" stroke="#FFF6B7" stroke-width="7" stroke-linecap="round"/>
  <line x1="100" y1="116" x2="110" y2="122" stroke="#FFF6B7" stroke-width="7" stroke-linecap="round"/>
''',
"xsearch": '''
  <circle cx="90" cy="90" r="40" fill="none" stroke="#fff" stroke-width="11"/>
  <line x1="118" y1="118" x2="156" y2="156" stroke="#fff" stroke-width="13" stroke-linecap="round"/>
  <line x1="74" y1="74" x2="106" y2="106" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  <line x1="106" y1="74" x2="74" y2="106" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
''',
"nisa": '''
  <line x1="52" y1="150" x2="152" y2="150" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity="0.6"/>
  <rect x="58" y="120" width="20" height="30" rx="5" fill="#fff"/>
  <rect x="90" y="98" width="20" height="52" rx="5" fill="#fff" opacity="0.9"/>
  <rect x="122" y="70" width="20" height="80" rx="5" fill="#fff" opacity="0.8"/>
  <path d="M58 96 L92 66 L124 78 L146 48" fill="none" stroke="#FFF6B7" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M132 46 L148 46 L148 62" fill="none" stroke="#FFF6B7" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
''',
}

svg_tpl = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g-{name}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="44" fill="url(#g-{name})"/>
  {glyph}
</svg>'''

os.makedirs("thumb-icons", exist_ok=True)
for name, (c1, c2) in BG.items():
    svg = svg_tpl.format(name=name, c1=c1, c2=c2, glyph=GLYPH[name])
    with open(f"thumb-icons/{name}.svg", "w", encoding="utf-8") as f:
        f.write(svg)

print("done", len(BG))
