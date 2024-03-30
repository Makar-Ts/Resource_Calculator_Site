var json_data;

var is_primary_items_show = true;
var is_other_items_show = true;

var resources = new Map();

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


function updateCurrentResources() {
    var str = "<table class='item_table'>"

    for (let [key, value] of resources) {
        var resource_name = "";
        for (let k in json_data) {
            if (k == key) {
                resource_name = json_data[key]["names"][0];
                break;
            }
        }
    
        str += `<tr class='showed_item'><td>${resource_name}</td><td>${value}</td></tr>`;
    }

    $("#current_items").html(str + "</table>");
}

function updateShareUrl() {
    var str = "";

    for (let [key, value] of resources) {
        str += `${key}=${value}&`;
    }

    $("#url_container").attr("href", window.location.origin+window.location.pathname+"/?"+str);
}

$(document).ready(function() {
    const filePath = './resources.json';

    const urlParams = new URLSearchParams(window.location.search);

    for (let key of urlParams.keys()) {
        resources.set(key, +urlParams.get(key));
    }

    console.log(window.location);
    $("#url_container").attr("href", window.location.origin+window.location.pathname);

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            json_data = data;

            var primary_str = "<table class='item_table'>";
            var other_str = "<table class='item_table'>";   

            for (let key in data) {
                if (data[key]["primary"]) {
                    primary_str += `<tr class='showed_item'><td>${data[key]['names'][0]}</td><td class='showed_item'><button type='button' class='resource_button' data=${key}>Add</button></td></tr>`;
                } else {
                    other_str += `<tr class='showed_item'><td>${data[key]["names"][0]}</td><td class='showed_item'><button type='button' class='resource_button' data=${key}>Add</button></td></tr>`;
                }
            }

            updateCurrentResources();
            updateShareUrl();
            if (urlParams.size > 0) {
                calculateCost();
            }

            $("#primary_items").html(primary_str+"</table>");
            $("#other_items").html(other_str+"</table>");

            $(".resource_button").click(function() {
                var id = $(this).attr("data");
                var resource_amount = +$('#resource-amount').val();
            
                console.log(id + ' ' + resource_amount);
                
                if (resources.has(id)) {
                    resources.set(id, resources.get(id) + resource_amount);
                } else {
                    resources.set(id, resource_amount);
                }

                if (resources.get(id) == 0) { resources.delete(id); }
                
                updateCurrentResources()
                updateShareUrl()
            
                $('#resource-amount').val("");
            });
        }
    });
});

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

function calculateCost() {
    var cost = new Map();

    for (let [key, value] of resources) {
        calculate_cost_recursion(key, value, cost);
    }

    var str = "<table class='item_table'><tr class='showed_item_header'><th>Item</th><th>Amount</th></tr>"

    for (let [key, value] of cost) {
        var resource_name = "";
        for (let k in json_data) {
            if (k == key) {
                resource_name = json_data[key]["names"][0];
                break;
            }
        }
    
        str += `<tr class='showed_item'><td>${resource_name}</td><td>${value}</td></tr>`;
    }

    $("#output").html(str + "</table>");

    console.log(cost);
}

$('#calculate').click(calculateCost);

$("#hide_primary_items").click(function() {
    if (is_primary_items_show) {
        $("#primary_items").hide()
        $("#hide_primary_items").text("Primary items /\\ ");
    } else {
        $("#primary_items").show();
        $("#hide_primary_items").text("Primary items \\/ ")
    }

    is_primary_items_show = !is_primary_items_show;
});

$("#hide_other_items").click(function() {
    if (is_other_items_show) {
        $("#other_items").hide()
        $("#hide_other_items").text("Other items /\\ ");
    } else {
        $("#other_items").show();
        $("#hide_other_items").text("Other items \\/");
    }

    is_other_items_show = !is_other_items_show;
});

$("#copy_url").click(function() {
    var text = $("#url_container").attr("href");
    console.log(text);

    navigator.clipboard.writeText(text);
})