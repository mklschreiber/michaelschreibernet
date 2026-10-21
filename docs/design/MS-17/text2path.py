# Converts the logo wordmark (Roboto Light/Medium, 54.167px) into one <path> per glyph,
# in the coordinate system of the original <text> group in app/public/logo.svg.
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
FS=54.167; Y=1259.924
fonts={'L':TTFont('/Library/Fonts/Roboto-Light.ttf' if __import__('os').path.exists('/Library/Fonts/Roboto-Light.ttf') else __import__('os').path.expanduser('~/Library/Fonts/Roboto-Light.ttf')),
       'M':TTFont('/Library/Fonts/Roboto-Medium.ttf' if __import__('os').path.exists('/Library/Fonts/Roboto-Medium.ttf') else __import__('os').path.expanduser('~/Library/Fonts/Roboto-Medium.ttf'))}
# (text, weight, start x, explicit per-char x overrides)
runs=[('michael','L',562.118,{}),('schreiber','M',749.744,{4:855.274,5:883.627}),('.net','L',975.72,{})]
out=[]
for text,w,x,over in runs:
    f=fonts[w]; upm=f['head'].unitsPerEm; s=FS/upm; gs=f.getGlyphSet(); cmap=f.getBestCmap(); hmtx=f['hmtx']
    for i,ch in enumerate(text):
        if i in over: x=over[i]
        g=cmap[ord(ch)]
        pen=SVGPathPen(gs, ntos=lambda v: ('%.2f'%v).rstrip('0').rstrip('.'))
        gs[g].draw(TransformPen(pen,(s,0,0,-s,x,Y)))
        out.append((ch,w,pen.getCommands()))
        x+=hmtx[g][0]*s
for ch,w,d in out: print(f'<path data-char="{ch}" data-weight="{"light" if w=="L" else "medium"}" d="{d}"/>')
