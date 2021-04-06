import os, cv2
import numpy as np
from skimage import io
from skimage.filters.rank import entropy
from skimage.morphology import disk

def segmentToOutlineFromPath(imgPath):
    rawImg = io.imread(os.path.join("./Images/", imgPath))
    if len(rawImg.shape) != 2:
        print("Specified image path does not corresspond to a gray/binary segment")
        exit(-1)
    return segmentToOutline(rawImg)

def segmentToOutline(rawImg):
    if len(rawImg.shape) != 2:
        print("Image must be gray/binary")
        exit(-1)
    return entropy(rawImg, disk(3))

def readAsGray(imgPath):
    rawImg = io.imread(os.path.join("./Images", imgPath))
    if len(rawImg.shape) == 3:
        return toGray(rawImg)
    else:
        return rawImg

def toGray(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def toBinary(img):
    if len(img.shape) == 3:
        img = toGray(img)
    return cv2.threshold(img, 10, 255, cv2.THRESH_BINARY)[1]

def saveImg(img, imgPath, imgName):
    directory = os.path.join("./Saved_Images/", imgPath)
    
    if imgName[-4:] not in [".jpg", ".png"]:
        imgName += ".jpg"
    if not os.path.exists(directory):
        os.makedirs(directory)

    fullPath = os.path.join(directory, imgName)
    if cv2.imwrite(fullPath, img):
        print("Image Saved as " + fullPath)
    else:
        print("Could not save image")

def saveBinaryImg(img, imgPath, imgName):
    saveImg(img * 255, imgPath, imgName)