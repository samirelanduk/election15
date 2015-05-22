from bs4 import BeautifulSoup
import json

f = open("map4.svg")
soup = BeautifulSoup(f.read(), "xml")
f.close()

#Get Map names
f = open("Mconstituencies.json", "r")
m_names = json.load(f)
f.close()

#Get voting data
f = open("votes.json", "r")
votes = json.load(f)
f.close()

def fix_names():
    for const in votes:
        original = const["id"]
        while const["id"] not in m_names:
            longest = max(original.split("_"),key=len)
            possibles = [x for x in m_names if longest in x]
            inp = input("New ID for " + original + " (" + str(possibles) + ")\n\t")
            if inp.isnumeric():
                const["id"] = possibles[int(inp)]
            else:
                const["id"] = inp

def fix_map():
    for country in soup.find_all("g")[:4]:
        print(country.attrs["id"])
        for path in country.contents:
            if path != "\n":
                print(path.attrs["id"])
                found = False
                for cons in votes:
                    if cons["id"] == path.attrs["id"]:
                        found = True
                        results = cons["results"]
                        winner = ""
                        points = 0
                        for party in results:
                            if party["votes"] > points:
                                points = party["votes"]
                                winner = party["party"]
                                if winner == "Labour":
                                    winner = "labour"
                                elif winner == "Conservative":
                                    winner = "tory"
                                elif winner == "Liberal Democrat":
                                    winner = "libdem"
                                elif winner == "Scottish National Party":
                                    winner = "snp"
                                elif winner == "Plaid Cymru":
                                    winner = "pc"
                                elif winner == "UKIP":
                                    winner = "ukip"
                                elif winner == "Green Party":
                                    winner = "green"
                                elif winner == "Sinn Fein":
                                    winner = "sf"
                                elif winner == "Democratic Unionist Party":
                                    winner = "dup"
                                elif winner == "Social Democratic & Labour Party":
                                    winner = "sdlp"
                                elif winner == "Ulster Unionist Party":
                                    winner = "uup"
                                elif winner == "Respect":
                                    winner = "respect"
                                else:
                                    winner = "ind"
                                print("\t" + winner)
                                path.attrs["class"] = winner + " seat"
                                break
                if not found: print("\tCould not find data for " + path.attrs["id"])
