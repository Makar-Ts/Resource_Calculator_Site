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
    var str = "<table class='item_table'><tr class='showed_item_header'><th>Item</th><th>Amount</th></tr>"

    for (let [key, value] of resources) {
        var resource_name = "";
        for (let k in json_data) {
            if (k == key) {
                resource_name = json_data[key]["names"][0];
                break;
            }
        }
    
        str += `<tr class='showed_item'><td class="output_resource_type">${resource_name}</td><td class="output_resource_amount">${value}</td></tr>`;
    }

    $("#current_items").html(str + "</table>");
}

function updateShareUrl() {
    var str = "";

    for (let [key, value] of resources) {
        str += `${key}=${value}&`;
    }

    $("#url_container").attr("href", window.location.origin+window.location.pathname+"?"+str);
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

            var primary_str = "<optgroup label='Primary'>";
            var other_str = "<optgroup label='Other'>";   

            for (let key in data) {
                if (data[key]["primary"]) {
                    primary_str += `<option value=${key}>${data[key]['names'][0]}</option>`;
                } else {
                    other_str += `<option value=${key}>${data[key]['names'][0]}</option>`;
                }
            }

            updateCurrentResources();
            updateShareUrl();
            if (urlParams.size > 0) {
                calculateCost();
            }

            $("#resource_selection").html(other_str+"</optgroup>"+primary_str+"</optgroup>");

            $("#add_resource").click(function() {
                var id = $("#resource_selection").val();
                var resource_amount = +$('#resource_amount').val();
            
                console.log(id + ' ' + resource_amount);
                
                if (resources.has(id)) {
                    resources.set(id, resources.get(id) + resource_amount);
                } else {
                    resources.set(id, resource_amount);
                }

                if (resources.get(id) == 0) { resources.delete(id); }

                $('#resource_amount').val(0);
                
                updateCurrentResources()
                updateShareUrl()
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
    
        str += `<tr class='showed_item'><td class="output_resource_type">${resource_name}</td><td class="output_resource_amount">${value}</td></tr>`;
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