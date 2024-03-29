var json_data;

var is_primary_items_show = true;
var is_other_items_show = true;

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

$(document).ready(function() {
    const filePath = './resources.json';

    fetchJSONFile(filePath, (error, data) => {
        if (error) {
            console.error('Error reading JSON file:', error);
            return;
        } else {
            console.log('JSON file content:', data);
            
            json_data = data;

            var primary_str = "<table>";
            var other_str = "<table>";

            for (let key in data) {
                if (data[key]["primary"]) {
                    primary_str += "<tr><th class='showed_item'>"+data[key]["names"][0]+"</th><th><button type='button' id='resource_button' data="+key+">Add</button></th></tr>";
                } else {
                    other_str += "<tr><th class='showed_item'>"+data[key]["names"][0]+"</th><th><button type='button' id='resource_button' data="+key+">Add</button></th></tr>";
                }
            }

            $("#primary_items").html(primary_str+"</table>");
            $("#other_items").html(other_str+"</table>");
        }
    });
})

$('#calculate').click(function() {
    const resource_name = $('#resource-name').val();
    const resource_type = $('#resource-amount').val();

    console.log(resource_name + ' ' + resource_type);

    $('#resource-amount').val("")
    $('#resource-name').val("")
});

$("#hide_primary_items").click(function() {
    if (is_primary_items_show) {
        $("#primary_items").hide()
        $("#hide_primary_items").text("Show primary items")
    } else {
        $("#primary_items").show();
        $("#hide_primary_items").text("Hide primary items")
    }

    is_primary_items_show = !is_primary_items_show;
});

$("#hide_other_items").click(function() {
    if (is_other_items_show) {
        $("#other_items").hide()
        $("#hide_other_items").text("Show other items")
    } else {
        $("#other_items").show();
        $("#hide_other_items").text("Hide other items")
    }

    is_other_items_show = !is_other_items_show;
});