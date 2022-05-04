# from konlpy.tag import Twitter
from konlpy.tag import Okt
f = open("example.txt", "r", encoding="utf-8")

lines = f.read()

nlpy = Okt()

nouns = nlpy.nouns(lines)

print(nouns)