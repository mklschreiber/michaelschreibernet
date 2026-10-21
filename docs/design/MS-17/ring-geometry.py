# MS-17 ring/trace geometry (rounds 2 and 3). Prints the end-state hole check of the design
# geometry, the snapped ring centres, the round-3 P4 timing and all logo-move-* keyframes of
# docs/architecture/MS-17-animated-svg-logo.md (D3, D3a, D3b, D3c). Standard library only.
# Not part of the build. Usage: python3 -I ring-geometry.py [model.json]
import math,sys,json
s=0.780343; k=0.579683
HW=10.68*s/2; R=k*17.5; RW=k*14.38; RIN=R-RW/2; ROUT=R+RW/2
O=(-343.300575,-582.182452)
def T(o,pts): return [(s*x+o[0],s*y+o[1]) for x,y in pts]
def dot(ox,oy): return (k*582.5+ox,k*1164.5+oy)
D={1:dot(-229.147554,-348.124167),2:dot(-254.89887,-554.915041),3:dot(-99.610629,-348.124167),4:dot(-99.610629,-410.551601),5:dot(26.024581,-481.562807),6:dot(98.596472,-519.019267),7:dot(72.064813,-555.695384)}
# name: (group offset, points in drawing order, end dot, delay, duration); P4 duration is derived below
P={'P1':(O,[(793.161,888.192),(663.676,1017.676),(555,909)],2,1.55,1.75),
'P2':(O,[(791.529,950.641),(661.085,1079.085),(580,998),(580,1152)],1,1.20,2.35),
'P3':(O,[(794,1118),(937,1118),(995,1067),(918,1004)],5,0.35,1.65),
'P4':(O,[(759,1166),(954,1166),(997,1125),(996,1068)],None,0.10,None),
'P5':(O,[(961,1097),(843,997),(899,947),(985,946)],6,1.30,1.65),
'P6':(O,[(841,995),(842,942),(887,899),(951.719,899)],7,2.10,0.95),
'P7':((-343.300575,-452.645528),[(755.281,988.719),(791.999,952.001)],None,0.10,0.25),
'P8':((-344.861261,-582.182452),[(795,1116),(795,889)],None,0.35,1.20),
'P9':(O,[(746,996),(746,1072)],4,1.55,0.40)}
Q={n:T(v[0],v[1]) for n,v in P.items()}
def cum(q):
    L=[0]
    for i in range(1,len(q)): L.append(L[-1]+math.dist(q[i-1],q[i]))
    return L
def segdist(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1];L2=dx*dx+dy*dy
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2)) if L2 else 0
    return math.dist(p,(a[0]+t*dx,a[1]+t*dy))
def polydist(p,q): return min(segdist(p,q[i],q[i+1]) for i in range(len(q)-1))
def proj(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1];t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)
    return (a[0]+t*dx,a[1]+t*dy)
def inter(a,b,c,d):
    x1,y1=a;x2,y2=b;x3,y3=c;x4,y4=d;den=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4)
    return (((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/den,((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/den)
print('line half width %.4f, ring r %.4f, band [%.4f, %.4f], no-notch limit %.3f'%(HW,R,RIN,ROUT,math.sqrt(ROUT**2-HW**2)))
print('\nDesign end state: ring centre to nearest trace axis (line in hole if < %.3f)'%(RIN+HW))
for d,c in D.items():
    m=min((polydist(c,q),n) for n,q in Q.items()); print(' D%d %s %.3f%s'%(d,m[1],m[0],'  INTRUDES' if m[0]<RIN+HW else ''))
own={1:'P2',2:'P1',4:'P9',5:'P3',6:'P5',7:'P6'}
N=dict(D)
for d,n in own.items(): N[d]=proj(D[d],Q[n][-2],Q[n][-1])
N[3]=inter(Q['P4'][0],Q['P4'][1],Q['P7'][0],Q['P7'][1])
print('\nSnapped ring centres (D3 table):')
for d in sorted(N): print(' D%d (%.3f, %.3f)  shift %.3f'%(d,*N[d],math.dist(D[d],N[d])))
print('Joint distances:',', '.join('%s-D%d %.3f'%(n,d,math.dist(Q[n][-1],N[d])) for d,n in own.items()),', P4-D3 %.3f, P7-D3 %.3f'%(math.dist(Q['P4'][0],N[3]),math.dist(Q['P7'][0],N[3])))
# Round 3: circle centre = trace tip at every vertex; on the last segment of a dot trace it runs
# ahead to the dot centre. So stop percentages are cumulative TRACE length / trace length.
def stops(name,delay,dur,endpt):
    q=Q[name];L=cum(q);pts=list(q)
    if endpt: pts[-1]=endpt
    return [(delay+dur*l/L[-1],p) for l,p in zip(L,pts)]
J=Q['P3'][2]                      # P3 corner = bottom-right junction
L3=cum(Q['P3']);tJ=0.35+1.65*L3[2]/L3[-1]
L4=cum(Q['P4']);ext=math.dist(Q['P4'][-1],J)
v4=(L4[-1]+ext)/(tJ-0.10);d4=L4[-1]/v4
print('\nRound 3 merge: junction J=(%.3f, %.3f), D5 circle at J at t=%.4fs'%(*J,tJ))
print(' P4: length %.2f + %.2f to J, speed %.1f u/s (others 150), trace duration %.4fs -> %.2fs'%(L4[-1],ext,v4,d4,round(d4,2)))
P4dur=round(d4,2)
M={}
for name,(o,pts,dd,dl,du) in P.items():
    if name=='P4': du=P4dur
    M[name]=dict(delay=dl,dur=du,tag='d%d'%dd if dd else 'p'+name[1:],stops=stops(name,dl,du,N[dd] if dd else None))
# P4 head: along P4 at P4's speed, then P4 end -> J, then congruent with D5 to D5's centre
h=stops('P4',0.10,P4dur,None)
d5=M['P3']['stops']
h=h+[(0.10+P4dur*(L4[-1]+ext)/L4[-1],J)]+[x for x in d5 if x[0]>tJ+1e-9]
M['P4']['head']=h
print('\nTiming table:')
for n,m in M.items():
    st=m.get('head',m['stops']);print(' %s trace %.2fs/%.2fs  circle %s %.2fs/%.2fs'%(n,m['delay'],m['dur'],m['tag'],st[0][0],st[-1][0]-st[0][0]))
def f(v): v=0.0 if abs(v)<0.005 else v; return ('%.2f'%v).rstrip('0').rstrip('.')
print('\nKeyframes (translate = position - final centre):')
for n,m in M.items():
    st=m.get('head',m['stops']);t0,t1=st[0][0],st[-1][0];end=st[-1][1]
    print('@keyframes logo-move-%s { /* %s, circle %.2fs @ %.2fs */'%(m['tag'],n,t1-t0,t0))
    for t,p in st:
        print('  %-7s { transform: translate(%spx, %spx); }'%(('%.1f'%(100*(t-t0)/(t1-t0))).rstrip('0').rstrip('.')+'%',f(p[0]-end[0]),f(p[1]-end[1])))
    print('}')
if len(sys.argv)>1:
    json.dump(dict(R=R,RIN=RIN,RW=RW,root=N[3],J=J,model={m['tag']:dict(stops=[(round(t,6),p) for t,p in m.get('head',m['stops'])],head=m['tag'][0]=='p',trace=n,delay=m['delay'],dur=m['dur']) for n,m in M.items()}),open(sys.argv[1],'w'))
