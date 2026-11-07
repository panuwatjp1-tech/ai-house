import sys,glob
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+'/stills/*.jpg')); cols=int(sys.argv[2]) if len(sys.argv)>2 else 5; W=300;H=533
rows=(len(fs)+cols-1)//cols; im=Image.new('RGB',(W*cols,H*rows))
for i,f in enumerate(fs): im.paste(Image.open(f).resize((W,H)),((i%cols)*W,(i//cols)*H))
im.save(d+'/sheet.jpg',quality=85)
