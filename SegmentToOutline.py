import os
import cv2
import numpy as np
from skimage import io
import ImgTools as imt

if __name__ == "__main__":
    chairs = os.listdir("./Images/Chairs")
    lamps = os.listdir("./Images/Table Lamps")
    tables = os.listdir("./Images/Tables")

    for chair in chairs:
        img = imt.readAsGray("Chairs/" + chair)
        imgOutline = imt.segmentToOutline(imt.toBinary(img))
        imt.saveBinaryImg(imgOutline, "Image_Outlines/Chairs/", chair)
     
    for lamp in lamps:
        img = imt.readAsGray("Table Lamps/" + lamp)
        imgOutline = imt.segmentToOutline(imt.toBinary(img))
        imt.saveBinaryImg(imgOutline, "Image_Outlines/Table Lamps/", lamp)
    
    for table in tables:
        img = imt.readAsGray("Tables/" + table)
        imgOutline = imt.segmentToOutline(imt.toBinary(img))
        imt.saveBinaryImg(imgOutline, "Image_Outlines/Tables/" , table)
    

    
