from bs4 import BeautifulSoup
import requests

#Go to constituencies page
soup = BeautifulSoup(requests.get("http://www.bbc.co.uk/news/politics/constituencies").text)

#Get a list of 650 urls
urls = []
div = soup.find(attrs={"id":"council_data-az_constituency_list"})
div = [x for x in div if x != "\n"]
for table in div:
    a = table.find_all("a")
    urls += ["http://www.bbc.co.uk" + x["href"] for x in a]

#Go to each url and get the data there
data = []
x = 1
for url in urls:
    print("Starting " + str(x) + " of 650")
    #Get data
    datum = {}
    constituency = BeautifulSoup(requests.get(url).text)
    datum["name"] = constituency.find("h1", attrs={"class":"constituency-title__title"}).text
    parties = constituency.find(attrs={"id":"general_election_data-constituency_result_table"}).find_all(attrs={"class":"party"})
    parties = [{"party":x.find(attrs={"class":"party__name--long"}).text,
                "votes":int(x.find(attrs={"class":"party__result--votes"}).text.split(" ")[0].replace(",","")),
                "percentage":float(x.find(attrs={"class":"party__result--votesshare essential"}).text.split("%")[0].replace(",",""))} for x in parties]
    datum["results"] = parties
    #Sanity checks
    none_free = None not in [x["party"] for x in datum["results"]] and None not in [x["votes"] for x in datum["results"]] and None not in [x["percentage"] for x in datum["results"]]
    hundred = sum([x["percentage"] for x in datum["results"]]) == 99.9 or sum([x["percentage"] for x in datum["results"]]) == 100
    if not none_free: print("\t(" + datum["name"] + ") Some Nones here...")
    if not hundred: print("\t(" + datum["name"] + ") Adds up to " + str(round(sum([x["percentage"] for x in datum["results"]]),3)) + "...")
    data.append(datum)
    print("\tDone")
    x += 1
