from os import write
from svg.path import parse_path
from svg.path.path import *
import sys
import cmath
   
# def display_groups(start_index,end_index,s):
#     if len(end_index) == 0:
#         return;
#     st = 0
#     while st < len(start_index) and start_index[st] < end_index[0]:
#         st+=1
#     if st == len(start_index):
#         print(len(s[start_index[st-1]+1:end_index[0]]))
#     else:
#         print(len(s[start_index[st-1]+1:end_index[0]]),start_index[st-1],end_index[0])
#     print("****************")
#     start_index.pop(st-1)
#     end_index.pop(0)
#     display_groups(start_index, end_index,s)

# def create_grp(s):
#     start_index = [i for i, tag in enumerate(s) if tag.startswith("<g")]
#     end_index = [i for i, tag in enumerate(s) if tag.startswith("</g")]
#     lst = []
#     if start_index[0] != 0:
#         lst.append(s[0:start_index[0]])
#     start_index.pop(0)
#     end_index.pop(-1)
#     print(start_index,end_index)
#     display_groups(start_index,end_index,s)
#     return start_index, end_index

# def remove_grp(start_index,end_index,s):
#     s.pop(start_index)
#     s.pop(end_index)
#     return s

def cubicbezier(x0, y0, x1, y1, x2, y2, x3, y3, n=20):
    pts = []
    for i in range(n+1):
        t = i / n
        a = (1. - t)**3
        b = 3. * t * (1. - t)**2
        c = 3.0 * t**2 * (1.0 - t)
        d = t**3
 
        x = int(a * x0 + b * x1 + c * x2 + d * x3)
        y = int(a * y0 + b * y1 + c * y2 + d * y3)
        pts.append( (x, y) )
    return pts

def cubic_to_line(pathObj):
    start_x = pathObj.start.real
    start_y = pathObj.start.imag
    end_x = pathObj.end.real
    end_y = pathObj.end.imag
    x_con1 = pathObj.control1.real
    y_con1 = pathObj.control1.imag
    x_con2 = pathObj.control2.real
    y_con2 = pathObj.control2.imag

    line = cubicbezier(start_x,start_y,x_con1,y_con1,x_con2,y_con2,end_x,end_y)
    res = []
    for i in range(len(line)-1):
        x = Line(complex(line[i][0],line[i][1]),complex(line[i+1][0],line[i+1][1]))
        res.append(x)
        
    return res

def extract_paths(s):
    path_index = [i for i, path in enumerate(s) if path.startswith("<path")]
    lst = []
    for i in range(len(s)):
        if i in path_index:
            lst.append(parse_path(s[i][s[i].index("\""):s[i].index("\"",s[i].index("\"")+1)+1]))
    return lst
def create_svg(svg_parsed):
    svg_new = open("new.svg","w")
    svg_new.writelines("<svg id=\"Layer_1\" enable-background=\"new 0 0 512 512\" height=\"512\" viewBox=\"0 0 512 512\" width=\"512\" xmlns=\"http://www.w3.org/2000/svg\"><g>")
    for i in svg_parsed:
        svg_new.write("<path d=\"")
        svg_new.write(i.d())
        svg_new.write("\"/>")
    svg_new.writelines("</g></svg>")

if len(sys.argv) > 2:
    print("Extra arguements provided, expected only path to file")
if len(sys.argv) < 2:
    print("Enter file path")
    file_path = input()
else:
    file_path  = sys.argv[1]
svg_file = open(file_path,"r")
svg_data = svg_file.readline()
svg_data_lines = svg_data.split(">")
svg_file.close()
svg_data_lines.pop(0)
svg_parsed = extract_paths(svg_data_lines)
for i in svg_parsed:
    for j in range(len(i)):
        if type(i[j]) == CubicBezier:
            res = cubic_to_line(i[j])
            i[j] = res[0]
            res.pop(0)
            for t in res:
                i.insert(j+1,t)
                j+=1
create_svg(svg_parsed)



