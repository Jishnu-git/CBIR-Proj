function processQuery(queryText) {
    let req = new XMLHttpRequest();
    req.open("POST", "/postag/", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const taggedWords = JSON.parse(this.responseText);
            let valid = true;
            let query = "";
            console.log(taggedWords);
            console.log(this.responseText);
            let firstNN;
            let objects = [];
            for (const taggedWord of taggedWords) {
                if (taggedWord[1] === "NN" || models.includes(taggedWord[0])) {
                    if (models.includes(taggedWord[0])) {
                        query += "<span class=\"green\">"
                    } else {
                        query += "<span class=\"red\">"
                        valid = false;
                    }
                    if (!firstNN) firstNN = taggedWord[0];
                    objects.push({"name": taggedWord[0], "position": null});
                } else if (taggedWord[1] === "DIR") {
                    query += "<span class=\"blue\">"
                    if (objects[objects.length - 1].position) {
                        console.error("Multiple positions specifed for the same object! Compensating as the last one read.");
                    }
                    objects[objects.length - 1].position = generalizePosition(taggedWord[0]);
                } else {
                    query += "<span class=\"gray\">"
                }
                query += taggedWord[0] + "</span> ";
            } 
            document.getElementById("query").innerHTML = query;
            if (valid) {
                updateProgress(0, "");
                formatPositions(objects);
                startDrawing(objects);
                document.getElementById("error").style.visibility = "hidden";
            } else {
                if (document.getElementById("modelBtn").getAttribute("value") == 1) {
                    toggleList();
                }
                document.getElementById("error").style.visibility = "visible";
            }            
        }
    }
    req.send(JSON.stringify({text: queryText.toLowerCase()}));
}

function generalizePosition(pos) {
    for (var direction in directions) {
        if (directions[direction].includes(pos)) {
            return direction;
        }
    }
    console.error("Undefined position specified! Position is being compensated as \"side\"");
    return "side";
}

function formatPositions(objects) {
    let centreFound = false;
    for (var object of objects) {
        if (!object.position) {
            if (!centreFound) {
                object.position = "centre";
                centreFound = true;
            } else {
                console.error("Query is not structured properly! Undefined positions are being compensated as \"side\"");
                object.position = "side";
            }
        }
    }
}

const directions = {
    "right": ["right"],
    "left": ["left"],
    "top": ["up", "above", "over", "on"],
    "bottom": ["down", "below", "under"],
    "front": ["front"],
    "behind": ["behind"],
    "side": ["side", "next", "near", "beside"]
}