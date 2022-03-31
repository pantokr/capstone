import sys
import requests
import json
import cv2

API_URL = 'https://dapi.kakao.com/v2/vision/face/detect'
RESTAPI_KEY = '1f40ce773d5aff058e6b6a6abab38983'


def detect_face(filename):
    headers = {'Authorization': 'KakaoAK {}'.format(RESTAPI_KEY)}

    try:
        files = {'image': open(filename, 'rb')}
        resp = requests.post(API_URL, headers=headers, files=files)
        data = resp.json()
        with open('output.json', 'w') as f:
            json.dump(data, f)
        return resp.json()
    except Exception as e:
        print('error')
        print(str(e))
        sys.exit(0)


data = detect_face('byun.jpeg')
img = cv2.imread('byun.jpeg', cv2.IMREAD_COLOR)

width = data['result']['width']
height = data['result']['height']
face = data['result']['faces'][0]


x = int(face['x']*width)
w = int(face['w']*width)
y = int(face['y']*height)
h = int(face['h']*height)
cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 0), 3)

facial_points = face['facial_points']
for dots in facial_points.values():
    for dot in dots:
        _x = int(width * dot[0])
        _y = int(height * dot[1])
        cv2.circle(img, (_x, _y), 3, (0, 0, 0), -1)


cv2.imshow('img', img)
cv2.waitKey(0)
