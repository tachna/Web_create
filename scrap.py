# 날씨 스크래핑

import requests 
import re # 정규식
from bs4 import BeautifulSoup
headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"}
url = "https://www.coupang.com/np/search?q=%EB%85%B8%ED%8A%B8%EB%B6%81&channel=user&component=&eventCategory=SRP&trcid=&traid=&sorter=scoreDesc&minPrice=&maxPrice=&priceRange=&filterType=&listSize=36&filter=&isPriceRange=false&brand=&offerCondition=&rating=0&page=1&rocketAll=false&searchIndexingToken=1=4&backgroundColor="
res = requests.get(url, headers=headers)
res.raise_for_status()
soup= BeautifulSoup(res.text,"lxml")
items = soup.find_all("li", attrs={"class": re.compile("^search-product")})  #li태그 중에서 class정보가 sear-product로 시작하는 모든 엘리먼트를 다 가져옴
#print(items[0].find("div", attrs={"class","name"}).get_text())
for item in items:
    #광고제품은 제외
    ad_badge = item.find("span", attrs={"class":"ad-badge-text"})
    if ad_badge:
        print(" 광고상품 제외합니다")
        continue
    name = item.find("div", attrs={"class":"name"}).get_text()
    price = item.find("strong", attrs={"class":"price-value"}).get_text() #가격
    rate = item.find("em", attrs={"class":"rating"}) #평점
    if rate: #값이 있다면
        rate = rate.get_text()
    else:
        rate = "평점 없음"
    rate_count = item.find("span", attrs={"class":"rating-total-count"})#평점수
    if rate_count:
        rate_count = rate_count.get_text()
    else:
        rate_count = "평점수 없음"
    print(name, price, rate, rate_count)