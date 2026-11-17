"""Build an editable Notion research deck. Dependency: python-pptx + Pillow."""
from pathlib import Path
import json,math
from pptx import Presentation
from pptx.util import Inches,Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE,MSO_CONNECTOR
from pptx.enum.text import MSO_ANCHOR,PP_ALIGN
from PIL import Image,ImageFont
ROOT=Path(__file__).resolve().parent
DATA=json.loads((ROOT/'content.json').read_text())
BLUE='1260D6';INK='111827';MUTED='4B5563';LINE='DCE4EF';PALE='EFF5FF';WHITE='FFFFFF'
prs=Presentation();prs.slide_width=Inches(16);prs.slide_height=Inches(9)
def rgb(c):return RGBColor.from_string(c)
def shape(sl,x,y,w,h,fill=WHITE,border=None,kind=MSO_SHAPE.ROUNDED_RECTANGLE):
 s=sl.shapes.add_shape(kind,Inches(x),Inches(y),Inches(w),Inches(h));s.fill.solid();s.fill.fore_color.rgb=rgb(fill)
 if border:s.line.color.rgb=rgb(border);s.line.width=Pt(.7)
 else:s.line.fill.background()
 if kind==MSO_SHAPE.ROUNDED_RECTANGLE:s.adjustments[0]=.09
 return s
def box(sl,x,y,w,h,txt,size=18,bold=False,color=INK,fill=None,align=PP_ALIGN.LEFT):
 if fill:s=shape(sl,x,y,w,h,fill)
 else:s=sl.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h))
 tf=s.text_frame;tf.clear();tf.word_wrap=True;tf.margin_left=tf.margin_right=Inches(.02);tf.margin_top=Inches(.02);tf.margin_bottom=Inches(.01)
 for j,line in enumerate(txt.split('\n')):
  p=tf.paragraphs[0] if j==0 else tf.add_paragraph();p.text=line;p.font.name='Arial';p.font.size=Pt(size);p.font.bold=bold;p.font.color.rgb=rgb(color);p.space_before=Pt(0);p.space_after=Pt(3);p.line_spacing=1.08;p.alignment=align
 return s
def line(sl,x1,y1,x2,y2,c=BLUE,width=1.4):
 s=sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x1),Inches(y1),Inches(x2),Inches(y2));s.line.color.rgb=rgb(c);s.line.width=Pt(width);return s
def icon(sl,name,x,y,w=.32):
 # Editable line-art symbols, distinct from the untouched Notion screenshots.
 def ln(a,b,c,d):line(sl,x+a*w,y+b*w,x+c*w,y+d*w)
 def rect(a,b,c,d,kind=MSO_SHAPE.RECTANGLE):return shape(sl,x+a*w,y+b*w,c*w,d*w,WHITE,BLUE,kind)
 if name=='search':rect(.05,.05,.6,.6,MSO_SHAPE.OVAL);ln(.58,.58,.95,.95)
 elif name in ('users','bot'):
  rect(.02,.04,.34,.34,MSO_SHAPE.OVAL);rect(.56,.04,.34,.34,MSO_SHAPE.OVAL);ln(0,.85,.42,.85);ln(.5,.85,1,.85);ln(.2,.5,.2,.85);ln(.72,.5,.72,.85)
 elif name in ('db','board','form','chart'):
  rect(.02,.02,.9,.9);ln(0,.28,.9,.28)
  if name=='chart':ln(.22,.75,.22,.55);ln(.48,.75,.48,.35);ln(.72,.75,.72,.47)
  else:ln(.32,.28,.32,.9);ln(.62,.28,.62,.9);ln(0,.58,.9,.58)
 elif name in ('check','clock'):
  rect(.03,.03,.88,.88,MSO_SHAPE.OVAL)
  if name=='check':ln(.23,.48,.44,.7);ln(.44,.7,.8,.29)
  else:ln(.48,.18,.48,.51);ln(.48,.51,.73,.62)
 elif name=='mobile':rect(.18,0,.58,1);ln(.33,.84,.6,.84)
 elif name=='mic':rect(.3,0,.4,.65,MSO_SHAPE.ROUNDED_RECTANGLE);ln(.15,.4,.15,.75);ln(.85,.4,.85,.75);ln(.15,.75,.85,.75);ln(.5,.75,.5,1)
 elif name in ('link','sync','clip'):
  rect(.02,.25,.57,.32,MSO_SHAPE.OVAL);rect(.4,.45,.57,.32,MSO_SHAPE.OVAL)
 elif name in ('spark','bolt'):ln(.5,0,.25,.55);ln(.25,.55,.68,.4);ln(.68,.4,.45,1)
 elif name=='code':ln(.3,.15,0,.5);ln(0,.5,.3,.85);ln(.7,.15,1,.5);ln(1,.5,.7,.85)
 else:
  rect(.1,0,.74,.96);ln(.23,.28,.7,.28);ln(.23,.5,.7,.5);ln(.23,.72,.58,.72)
def photo(sl,f,x,y,w,h):
 with Image.open(ROOT/f) as im:iw,ih=im.size
 r=min(w/iw,h/ih);nw,nh=iw*r,ih*r
 pic=sl.shapes.add_picture(str(ROOT/f),Inches(x+(w-nw)/2),Inches(y+(h-nh)/2),width=Inches(nw),height=Inches(nh));return pic
def frame(sl,x,y,w,h):return shape(sl,x,y,w,h,WHITE,LINE)
def base(s,i):
 sl=prs.slides.add_slide(prs.slide_layouts[6]);sl.background.fill.solid();sl.background.fill.fore_color.rgb=rgb(WHITE)
 shape(sl,0,0,16,.055,BLUE,kind=MSO_SHAPE.RECTANGLE)
 box(sl,.6,.3,14.8,.24,f'PHẦN II · NGHIÊN CỨU THỊ TRƯỜNG     /     NOTION {s["group"]}',11,True,BLUE)
 title=s['title'];ts=29 if len(title)<78 else 26
 box(sl,.6,.77,14.8,.56,title,ts,True)
 box(sl,.6,1.45,14.8,.42,s['subtitle'],17,False,MUTED)
 box(sl,.6,8.76,14,.19,'Notion · Tài liệu chính thức · Đối chiếu 16/11/2026 · Nguồn chi tiết trong ghi chú',9,False,MUTED)
 box(sl,14.8,8.72,.6,.25,f'{i:02d} / 09',10,False,MUTED,align=PP_ALIGN.RIGHT)
 return sl
def value(sl,txt):
 shape(sl,.6,8.12,14.8,.48,PALE);shape(sl,.6,8.12,.04,.48,BLUE,kind=MSO_SHAPE.RECTANGLE)
 box(sl,.78,8.18,14.42,.34,'GIÁ TRỊ  '+txt,15.5,True,BLUE)
def workflow(sl,steps):
 n=len(steps);w=(14.8-(n-1)*.27)/n
 for j,t in enumerate(steps):
  x=.6+j*(w+.27);shape(sl,x,7.48,w,.44,PALE);box(sl,x+.05,7.55,w-.1,.28,t,13,True,BLUE,align=PP_ALIGN.CENTER)
  if j<n-1:box(sl,x+w+.03,7.55,.2,.25,'→',14,False,MUTED)
def overview(sl,s):
 frame(sl,.6,2.08,4.25,3.05);photo(sl,s['image'],.66,2.14,4.13,2.93)
 box(sl,.64,5.42,4.1,.36,'UNE SEULE BASE DE CONNAISSANCES' if False else 'ĐIỂM KẾT NỐI',12,True,BLUE)
 statements={'CAPTURE':'Tài liệu + dữ liệu + cuộc họp\nđược ghi nhận ngay tại nơi nhóm làm việc.','FIND':'Tổ chức + xác minh + tìm kiếm\ngiúp lần từ câu hỏi đến thông tin có căn cứ.','AUTOMATE':'Chỉ dẫn + dữ liệu + hành động\nbiến quy trình lặp lại thành luồng tự động.'}
 box(sl,.64,5.92,4.1,1.3,statements[s['group']],21,True)
 gap=.16;w=(10.35-2*gap)/3;h=1.86
 for j,c in enumerate(s['cards']):
  x=5.05+(j%3)*(w+gap);y=2.08+(j//3)*(h+.12);frame(sl,x,y,w,h);icon(sl,c['icon'],x+.15,y+.15)
  box(sl,x+.59,y+.13,w-.73,.6,c['title'],15.4,True)
  box(sl,x+.16,y+.82,w-.32,.45,c['description'],13.8,False,MUTED)
  box(sl,x+.16,y+1.32,w-.32,.43,c['value'],13.5,False,BLUE)
 value(sl,s['value'])
def deep(sl,s,i):
 frame(sl,.6,2.08,8.95,5.15)
 if i==5:
  box(sl,.8,2.2,8.5,.22,'CÂU HỎI VÀ NGUỒN ĐƯỢC TÌM THẤY',10,True,BLUE)
  photo(sl,s['images'][0],.8,2.5,8.55,1.35)
  box(sl,.8,3.96,8.5,.22,'TRÍCH CÂU TRẢ LỜI VỚI DẤU DẪN NGUỒN',10,True,BLUE)
  photo(sl,s['images'][1],.8,4.22,8.55,2.8)
 elif i==9:
  box(sl,.8,2.21,8.5,.23,'CẤU HÌNH KÍCH HOẠT THEO SỰ KIỆN',10,True,BLUE)
  photo(sl,s['images'][0],.8,2.6,5.72,4.2)
  box(sl,6.72,3.1,2.54,.35,'TẠO AGENT',10,True,BLUE);photo(sl,s['images'][1],6.72,3.56,2.54,1.45)
  box(sl,6.72,5.24,2.54,1.15,'Ảnh gốc: chọn lịch hoặc sự kiện; ví dụ Forms được mô tả ở sơ đồ bên dưới.',12,False,MUTED)
 else:photo(sl,s['images'][0],.72,2.2,8.71,4.91)
 x=9.9;w=5.5
 for j,(t,desc) in enumerate(s['points']):
  y=2.1+j*1.13;box(sl,x,y,w,.35,t,18,True,BLUE);box(sl,x,y+.4,w,.65,desc,16.4,False,INK)
 shape(sl,x,5.65,w,1.57,PALE)
 box(sl,x+.16,5.79,w-.32,.28,'VÍ DỤ NGHIỆP VỤ',10.5,True,BLUE)
 box(sl,x+.16,6.2,w-.32,.86,s['example'],15.5)
 workflow(sl,s['steps']);value(sl,s['value'])
for i,s in enumerate(DATA['slides'],1):
 sl=base(s,i)
 if 'cards'in s:overview(sl,s)
 else:deep(sl,s,i)
 notes=[s['title'],s['notes'],'\nVí dụ là tình huống minh họa nghiệp vụ; nội dung trong screenshot giữ nguyên bản gốc.','\nNguồn:']+list(dict.fromkeys(s['urls']))
 sl.notes_slide.notes_text_frame.text='\n\n'.join(notes)
prs.core_properties.title='Notion — Capture, Find, Automate';prs.core_properties.subject='Nghiên cứu tính năng Notion cho Ban lãnh đạo MISA';prs.core_properties.author='Product Research';prs.core_properties.keywords='Notion, Capture, Find, Automate, official UI'
prs.save(ROOT/'Notion_Feature_Research_9_Slides.pptx')
print('Saved 9 editable slides')
