from svgpathtools import svg2paths2
from svgpathtools.path import CubicBezier, Line
from svgpathtools.paths2svg import wsvg
import numpy as np
import sys
import os


def parse_and_create(filename):
    paths, attributes,svg_attrib = svg2paths2(filename)
    for path in paths:
        j=0
        while j < len(path):
            if type(path[j]) == CubicBezier: 
                res = cubic_to_line2(path[j])
                path[j] = res[0]
                res.pop(0)
                for i in res:
                    path.insert(j+1,i)
                    j += 1
            else:
                j+=1
    wsvg(paths, attributes=attributes, svg_attributes=svg_attrib, filename='output1.svg')
    dataset_filename = filename[:filename.find(".")]+"_dataset.txt"
    dataset_file = open(dataset_filename,"w")
    dataset_arr = create_dataset(paths)
    for data in dataset_arr:
        dataset_file.write(str(data))
    dataset_file.close()

def create_dataset(paths):
    data = []
    new_path= True
    for path in paths:
        for stroke in path:
            if(new_path):
                new_path = False
                delX = stroke.start.real
                delY = stroke.start.imag
                penState = 0
                data.append([delX,delY,penState])
                delX = stroke.end.real - stroke.start.real
                delY = stroke.end.imag - stroke.start.imag
                penState = 1
            else:
                if type(stroke) == Line:
                    delX = stroke.start.real - stroke.end.real
                    delY = stroke.start.imag - stroke.end.imag
                    penState = 1
                else:
                    print("Non Line Object Found",type(stroke))
                    return None
            data.append([delX,delY,penState])
    return data

def cubic_to_line2(pathObj):
    points = []
    res = []
    tvals = np.linspace(0,1,10)
    points =(pathObj.poly()(tvals))
    for i in range(len(points)-1):
        x = Line(points[i], points[i+1])
        res.append(x)
    return res

def main():
    if len(sys.argv) >2:
        print("Expected 1 arguement got",len(sys.argv)-1)
        print("Exiting Program")
        quit()
    if len(sys.argv) == 1:
        print("Enter the file/folder path")
        filename = input()
    else:
        filename = sys.argv[1]
    
    if os.path.isdir(filename):
        files = os.listdir(filename)
        for f in files:
            if os.path.isfile(os.path.join(filename,f)):
                parse_and_create(os.path.join(filename,f)) 
                
    else:
        parse_and_create(filename)


if __name__ == "__main__":
    main()