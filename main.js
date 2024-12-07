import MaterialBlock from './material_block.js';
import SearchBar from './search.js';


var json_data;

var resources = new Map();
var blocks = new Map();

function fetchJSONFile(path, callback) { // thx ChatGPT
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
}

function updateShareUrl() {
    var str = "";

    for (let [key, value] of resources) {
        str += `${key}=${value}&`;
    }

    link = window.location.origin+window.location.pathname+"?"+str
}

$(document).ready(function() {
    const filePath = 'https://makar-ts.github.io/CTS_Database/resources.json';

    console.log(window.location);
    $("#url_container").attr("href", window.location.origin+window.location.pathname);

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            json_data = data;

            const origin = document.getElementById('resource_selection')


            for (let key in data) {
                if (!data[key]["primary"]) {
                    origin.appendChild(createListItem(key))
                }
            }

            for (let key in data) {
                if (data[key]["primary"]) {
                    origin.appendChild(createListItem(key))
                }
            }

            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.size > 0) {
                for (let key of urlParams.keys()) {
                    let id = key
                    let resource_amount = +urlParams.get(key)

                    resources.set(id, resource_amount);

                    blocks.set(id, new MaterialBlock(
                        document.getElementById("current_items"),
                        json_data[id]["names"][0],
                        (amount) => { 
                            resources.set(id, amount)
                            
                            if (liveUpdate) {
                                calculateCost();
                            }
                        },
                        () => { 
                            resources.delete(id); 
                            blocks.get(id).resourceDiv.remove();
                            blocks.delete(id);

                            if (liveUpdate) {
                                calculateCost();
                            }
                        },
                        resource_amount
                    ))
                }

                calculateCost();
            }

            var searchBar = new SearchBar(
                document.body,
                (res) => {
                    console.log(res)
                    
                    resources = new Map()
                    blocks = new Map()
                    document.getElementById("current_items").innerHTML = ""

                    for (var key in res) {
                        let resource_id = null;
                        for (let k in json_data) {
                            if (json_data[k].names[0] == key) {
                                resource_id = k
                                break;
                            }
                        }

                        if (!resource_id) continue;
            
                        resources.set(resource_id, res[key]);
            
                        blocks.set(resource_id, new MaterialBlock(
                            document.getElementById("current_items"),
                            json_data[resource_id]["names"][0],
                            (amount) => { 
                                resources.set(resource_id, amount)
                                
                                if (liveUpdate) {
                                    calculateCost();
                                }
                            },
                            () => { 
                                resources.delete(resource_id); 
                                blocks.get(resource_id).resourceDiv.remove();
                                blocks.delete(resource_id);
            
                                if (liveUpdate) {
                                    calculateCost();
                                }
                            },
                            res[key]
                        ))
                    }
                    calculateCost();
                    updateShareUrl();
                }
            )

            //$("#resource_selection").html(other_str+primary_str);
        }
    });
});


function createListItem(key) {
    const listItem = document.createElement('li');

    const button = document.createElement('button');
    button.value = key;
    button.onclick = () => addResource(key);
    button.className = 'btn btn-dark btn-choose';
    button.textContent = json_data[key]['names'][0];

    listItem.appendChild(button);

    return listItem;
}

var liveUpdate = true;
document.getElementById('liveUpdate').onclick = () => {
    liveUpdate = !liveUpdate;

    document.getElementById('liveUpdate').setAttribute("state", liveUpdate)
}


function addResource(resource) {
    var id = resource;
    var resource_amount = 1;

    console.log(id + ' ' + resource_amount);
    
    if (resources.has(id)) {
        resources.set(id, resources.get(id) + resource_amount);
    } else {
        resources.set(id, resource_amount);

        blocks.set(id, new MaterialBlock(
            document.getElementById("current_items"),
            json_data[id]["names"][0],
            (amount) => { 
                resources.set(id, amount)
                
                if (liveUpdate) {
                    calculateCost();
                }
            },
            () => { 
                resources.delete(id); 
                blocks.get(id).resourceDiv.remove();
                blocks.delete(id);

                if (liveUpdate) {
                    calculateCost();
                }
            }
        ))
    }

    if (liveUpdate) {
        calculateCost();
    }

    updateShareUrl()
}



function calculate_cost_recursion (id, count, cost) {
    if (json_data[id].primary) {
        if (cost.has(id)) {
            cost.set(id, cost.get(id) + count);
        } else {
            cost.set(id, count);
        }
        return;
    } else {
        var components = json_data[id].craft;

        console.log(components);

        for (let key of Object.keys(components)) {
            calculate_cost_recursion(key, count * components[key], cost);
        }

        return;
    }
}


function createOutputResource(name, amount, changed=false, deleted=false) {
    const outputDiv = document.createElement('div');
    outputDiv.className = 'output_resource' + (changed ? ' changed' : '') + (deleted ? ' deleted' : '');

    const nameLabel = document.createElement('label');
    nameLabel.textContent = name;

    const amountLabel = document.createElement('label');
    amountLabel.textContent = amount;

    outputDiv.appendChild(nameLabel);
    outputDiv.appendChild(amountLabel);

    return outputDiv;
}


var last_cost = new Map();
function calculateCost() {
    var cost = new Map();

    for (let [key, value] of resources) {
        calculate_cost_recursion(key, value, cost);
    }

    const origin = document.getElementById("output")

    origin.innerHTML = ""

    for (let [key, value] of cost) {
        var resource_name = "";
        for (let k in json_data) {
            if (k == key) {
                resource_name = json_data[key]["names"][0];
                break;
            }
        }
    
        origin.appendChild(createOutputResource(resource_name, value, last_cost.has(key) ? last_cost.get(key) != value : true))
    }
    var deleted = Array.from(last_cost, ([name, value]) => name).filter(function(v){
        return !cost.has(v)
    });

    console.log(deleted)

    for (let key of deleted) {
        console.log(key)
        var resource_name = "";
        for (let k in json_data) {
            if (k == key) {
                resource_name = json_data[key]["names"][0];
                break;
            }
        }

        const res = createOutputResource(resource_name, last_cost.get(key), false, true)

        origin.appendChild(res);

        setTimeout(() => res.remove(), 1000)
    }

    last_cost = cost;

    console.log(cost);
    updateShareUrl()
}

$('#calculate').click(calculateCost);

var link = ""
$("#copy_url").click(function() {
    console.log(link);
    navigator.clipboard.writeText(link);
})