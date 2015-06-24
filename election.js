window.onload = function() {
	//Get the JSON with all the votes
	var votes_object;
	var request = new XMLHttpRequest();
	request.open("GET", "votes.json");
	request.onload = function() {
		if (request.status == 200) {
			//votes_object = JSON.parse(request.responseText);
			window.votes = JSON.parse(request.responseText);
			window.alternate = JSON.parse(request.responseText);
			
			//Call some functions
			addChange();
			updateCommons();
			
			if (document.getElementById("content").offsetWidth == 1100) {
				document.getElementById("map").data = "map_data.svg";
			}
		} else {
			alert(request.status + " - nae success");
		}
	};
	request.send(null);
};

function deleteMe(event) {
	document.getElementById("controls").removeChild(event.target.parentNode.parentNode);
}

function addChange() {
	var controls = document.getElementById("controls");
	var options = "<option selected disabled hidden value=''></option><option value='Labour'>Labour</option><option value='Conservative'>Conservative</option><option value='Liberal Democrat'>Liberal Democrat</option><option value='UKIP'>UKIP</option><option value='Green'>Green</option><option value='SNP'>SNP</option><option value='Plaid Cymru'>Plaid Cymru</option><Option value='DUP'>DUP</option><Option value='SDLP'>SDLP</option><Option value='Sinn Fein'>Sinn Fein</option><Option value='UUP'>UUP</option>";
	var change = document.createElement("div");
	change.className = "change";
	change.style.fontSize = "80%";
	change.innerHTML = 'If <input type="text" name="percent" size="3" autocomplete="off">% of <select name="original">' + options + '</select> voters voted for <select name="new">'+ options + '</select> in <select name="region"><option value="UK">All UK</option><option value="england">England</option><option value="scotland">Scotland</option><option value="wales">Wales</option><option value="northern-ireland">Northern Ireland</option></select>...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size: 70%" onclick=deleteMe(event)><a href="javascript:void;">Remove</a></span>';
	controls.insertBefore(change, document.getElementById("buttons"));
}

function checkWinner(constituency) {
	var results = constituency["results"];
	var top = 0;
	var winner = "";
	for (j=0;j<results.length;j++) {
		if (results[j]["votes"] > top) {
			top = results[j]["votes"];
			winner = results[j]["party"];
		}
	}
	return winner;
}


function sortNtotal(table) {
	var rows = table.getElementsByTagName('tbody').item(0).getElementsByTagName('tr');
	//Re-order the table
	for (var i=0; i<rows.length-1;i++) {
        for (var j=0;j<rows.length-(i+1);j++) {
            if (parseInt(rows.item(j).getElementsByTagName('td').item(1).innerHTML) < parseInt(rows.item(j+1).getElementsByTagName('td').item(1).innerHTML)){
                table.getElementsByTagName("tbody").item(0).insertBefore(rows.item(j+1),rows.item(j));
            }
        }
    }
	//Put other at the end
	var other = 0;
	for (var i=0; i<rows.length;i++) {
		if (rows.item(i).getElementsByTagName('td').item(0).innerHTML == "Other") {
			other = rows.item(i).innerHTML;
			table.getElementsByTagName('tbody').item(0).removeChild(rows.item(i));
		}
	}
	new_other = document.createElement("tr");
	new_other.innerHTML = other;
	table.getElementsByTagName('tbody').item(0).appendChild(new_other);
	//Put total in
	total_row = document.createElement("tr");
	total_row.style.fontWeight = "bold";
	total = 0;
	rows = table.getElementsByTagName('tbody').item(0).getElementsByTagName('tr');
	for (var i=0; i<rows.length;i++) {
		total = total + parseInt(rows.item(i).getElementsByTagName('td').item(1).innerHTML);
	}
	td1 = document.createElement("td");
	td1.innerHTML = "Totals";
	td1.className = "party_name";
	td2 = document.createElement("td");
	td2.className = "num_cell";
	td2.innerHTML = total;
	total_row.appendChild(td1)
	total_row.appendChild(td2)
	table.getElementsByTagName('tbody').item(0).appendChild(total_row);
	//Put commas in
	for (var i=0; i<rows.length;i++) {
		rows.item(i).getElementsByTagName('td').item(1).innerHTML = numeral(rows.item(i).getElementsByTagName('td').item(1).innerHTML).format("0,0");
	}
}

function getColor(name) {
	d = {"Conservative": "#00F", "Labour": "#F00", "Liberal Democrat": "#FC0", "UKIP": "#B3009D", "Green": "#0F0", "SNP": "#FF0", "Plaid Cymru": "#6C3", "DUP": "#C30", "UUP": "#99F", "Sinn Fein": "#060;", "SDLP": "#3C3"};
	if (name in d) {
		return d[name];
	} else {
		return "#C0C0C0";
	}
}

function getWidth(val, max) {
	width = Math.ceil((val/max)*400);
	if (width == 0) {
		return 1;
	} else {
		return width;
	}
}

function populateCommonsTable(table, name, results, max) {
	head = document.createElement("tr");
	head_td = document.createElement("td")
	head_td.colSpan='3';
	head_td.innerHTML = name;
	head_td.className = 'table_head'
	head.appendChild(head_td);
	tbody = document.createElement("tbody");
	for (i=0;i<Object.keys(results).length;i++) {
		var row = document.createElement("tr");
		var td1 = document.createElement("td");
		td1.className = "party_name";
		td1.innerHTML = Object.keys(results)[i];
		var td2 = document.createElement("td");
		td2.className = "num_cell";
		td2.innerHTML = results[Object.keys(results)[i]];
		var td3 = document.createElement("td");
		td3.innerHTML = "<div class='bar' style='background-color:" + getColor(Object.keys(results)[i]) + "; height:15px; width:" + getWidth(parseInt(results[Object.keys(results)[i]]),max) + "px;'></div>";
		row.appendChild(td1);
		row.appendChild(td2);
		row.appendChild(td3);
		tbody.appendChild(row)
	}
	table.appendChild(head);
	table.appendChild(tbody);
	sortNtotal(table);
}

function addPie(div, data) {
	codes = {"Conservative":"CON", "Labour":"LAB", "Liberal Democrat":"LIBDEM", "UKIP":"UKIP", "Green":"GREEN", "SNP":"SNP", "Plaid Cymru": "PLAID", "DUP": "DUP", "SDLP":"SDLP", "Sinn Fein": "SF", "UUP": "UUP", "Other": "OTHER"};
	sorted_keys = Object.keys(data).sort(function(a,b){return data[b]-data[a]});
	//alert(sorted_keys);
	
	DPs = [];
	colors = [];
	for (i=0;i<sorted_keys.length;i++) {
		if (data[sorted_keys[i]] > 0) {
			DPs.push({y: data[sorted_keys[i]], legendText: codes[sorted_keys[i]], indexLabel: sorted_keys[i]});
			colors.push(getColor(sorted_keys[i]));
			//alert(sorted_keys[i] + " - " + getColor(sorted_keys[i]));
		}
	}
	CanvasJS.addColorSet("mycolors", colors);
	var chart = new CanvasJS.Chart(div,
	{
		colorSet: "mycolors",
		title:{
			text: ""
		},
                animationEnabled: true,
		legend:{
			verticalAlign: "bottom",
			horizontalAlign: "center"
		},
		data: [
		{        
			indexLabelFontSize: 12,
			indexLabelFontFamily: "Monospace",       
			indexLabelFontColor: "black", 
			indexLabelLineColor: "black",        
			indexLabelPlacement: "outside",
			type: "pie",       
			showInLegend: false,
			toolTipContent: "{y} - <strong>#percent%</strong>",
			dataPoints: DPs
		}
		]
	});
	chart.render();
	//Clean up the chart
	var container = div.children[0];
	var needed = container.children[0];
	needed.style.position = "static";
	container.innerHTML = "";
	container.appendChild(needed);
	
}

function updateCommons() {
	var results = {"Conservative":0, "Labour":0, "Liberal Democrat":0, "UKIP":0, "Green":0, "SNP":0, "Plaid Cymru": 0, "DUP": 0, "SDLP":0, "Sinn Fein": 0, "UUP": 0, "Other": 0};
	var votes = {"Conservative":0, "Labour":0, "Liberal Democrat":0, "UKIP":0, "Green":0, "SNP":0, "Plaid Cymru": 0, "DUP": 0, "SDLP":0, "Sinn Fein": 0, "UUP": 0, "Other": 0};

	var seats = document.getElementById("seats1");
	var votez = document.getElementById("votes1");
	seats.innerHTML = "";
	votez.innerHTML = "";
	for (i=0;i<window.alternate.length;i++) {
		winner = checkWinner(window.alternate[i]);
		if (winner in results) {
			results[winner]++;
			for (r=0;r<window.alternate[i]["results"].length;r++) {
				if (window.alternate[i]["results"][r]["party"] in votes) {
					votes[window.alternate[i]["results"][r]["party"]] = votes[window.alternate[i]["results"][r]["party"]] + window.alternate[i]["results"][r]["votes"];
				} else {
					votes["Other"] = votes["Other"] + window.alternate[i]["results"][r]["votes"];
				}
			}
		} else {
			results["Other"]++;
		}
	}
	populateCommonsTable(seats, "Seats", results, 650);
	populateCommonsTable(votez, "Votes", votes, 30000000);
	
	//Now the pie charts
	var seats = document.getElementById("seats2");
	var votez = document.getElementById("votes2");
	
	addPie(seats, results);
	addPie(votez, votes);
}
	

function checkInConstituency(party, results) {
	contained = false;
	for (x=0;x<results.length;x++) {
		if (party == results[x]["party"]) {
			contained = true;
			break;
		}
	}
	return contained;
}

function updateMap() {
	key = {"Labour":"labour", "Conservative":"tory", "Liberal Democrat":"libdem", "UKIP":"ukip", "Green":"green","SNP":"snp","Plaid Cymru":"pc", "DUP":"dup", "SDLP": "sdlp", "Sinn Fein": "sf", "UUP": "uup", "Other":"ind"};
	map = document.getElementById("map");
	svg = map.contentDocument;
	countries = [svg.getElementById("england"), svg.getElementById("wales"), svg.getElementById("scotland"), svg.getElementById("northern-ireland")];
	for (c=0;c<countries.length;c++) {
		for (p=0; p<countries[c].children.length; p++) {
			var constituency = {};
			for (a=0;a<window.alternate.length;a++) {
				if (window.alternate[a]["id"] == countries[c].children[p].id) {
					constituency = window.alternate[a];
					break;
				}
			}
			winner = checkWinner(constituency);
			if (!(winner in key)) {
				winner = "Other";
			}
			countries[c].children[p].setAttribute("class", key[winner] + " seat");
		}
	}
}

function apply() {
	window.alternate = [];
	
	//Get the rules specified
	var changes_html = document.getElementById("controls").children;
	var changes = [];
	for (i=0;i<changes_html.length-1;i++) {
		changes.push([parseFloat(changes_html[i].children[0].value), changes_html[i].children[1].value, changes_html[i].children[2].value, changes_html[i].children[3].value]);
	}

	for (i=0;i<window.votes.length;i++) {
		//Get the original votes
		var results = JSON.parse(JSON.stringify(window.votes[i]["results"]));
		var new_results = JSON.parse(JSON.stringify(results));
		
		//Apply each rule and create new voting data
		for (r=0;r<changes.length;r++) {
			//Can this transfer happen here?
			if (checkInConstituency(changes[r][1], results) && checkInConstituency(changes[r][2], results) && (changes[r][3] == window.votes[i]["regions"][0] || changes[r][3] == window.votes[i]["regions"][1])) {
				//Yes, so work out what needs to be transferred (from ORIGINAL DATA)
				var transfer = 0;
				for (y=0;y<results.length;y++) {
					if (results[y]["party"] == changes[r][1]) {
						transfer = Math.floor((changes[r][0]/100) * parseInt(results[y]["votes"]));
					}
				}
				//Now make that transfer
				for (y=0;y<new_results.length;y++) {
					if (new_results[y]["party"] == changes[r][1]) {
						new_results[y]["votes"] = (new_results[y]["votes"] - transfer);
					} else if (new_results[y]["party"] == changes[r][2]) {
						new_results[y]["votes"] = (new_results[y]["votes"] + transfer);
					}
				}
			}
		}
		var constituency = {"name":window.votes[i]["name"], "id":window.votes[i]["id"], "results": new_results};
		window.alternate.push(constituency);
	}

	updateCommons();
	updateMap();
}