var json_data;

var is_primary_items_show = true;
var is_other_items_show = true;

var resources = new Map();

function fetchJSONFile(path, callback) {
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
    
}

$(document).ready(function() {
    const filePath = './resources.json';

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
                    primary_str += "<tr class='showed_item'><td>"+data[key]["names"][0]+"</td><td class='showed_item'><button type='button' class='resource_button' data="+key+">Add</button></td></tr>";
                } else {
                    other_str += "<tr class='showed_item'><td>"+data[key]["names"][0]+"</td><td class='showed_item'><button type='button' class='resource_button' data="+key+">Add</button></td></tr>";
                }
            }

            $("#primary_items").html(primary_str+"</table>");
            $("#other_items").html(other_str+"</table>");

            $(".resource_button").click(function() {
                var id = $(this).attr("data");
                var resource_amount = $('#resource-amount').val();
            
                console.log(id + ' ' + resource_amount);

                resources.set(id, resource_amount);
                console.log(resources);
                
                var str = "<table class='item_table'><tr class='showed_item_header'><th>Item</th><th>Amount</th></tr>"

                for (let [key, value] of resources) {
                    var resource_name = "";
                    for (let k in json_data) {
                        if (k == key) {
                            resource_name = json_data[key]["names"][0];
                            break;
                        }
                    }
                
                    str += "<tr class='showed_item'><td>" + resource_name + "</td><td>" + value + "</td></tr>";
                    console.log(resource_name);
                }

                $("#current_items").html(str + "</table>");
            
                $('#resource-amount').val("");
            });
        }
    });
});

$('#calculate').click(function() {
});

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