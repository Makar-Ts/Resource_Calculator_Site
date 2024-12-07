function replaceGreekNumerals(str) {
    const greekNumerals = {
        'I': '1',
        'II': '2',
        'III': '3',
        'IV': '4',
        'V': '5',
        'VI': '6',
        'VII': '7',
        'VIII': '8',
        'IX': '9',
        'X': '10'
    };

    // Создаем регулярное выражение для поиска греческих цифр, которые стоят отдельно
    const regex = new RegExp(`\\b(${Object.keys(greekNumerals).join('|')})\\b`, 'g');

    // Заменяем греческие цифры на арабские
    return str.replace(regex, match => greekNumerals[match]);
}

const convert = {
    main: (value) => value.toLowerCase().replace(/[-./\\ ,"'*!]/g, ""),
    greek: (value) => replaceGreekNumerals(value).toLowerCase().replace(/[-./\\ ,"'*!]/g, "")
}

class SearchBar {
    constructor(
        origin, 
        onSelected
    ) {
        this.origin = origin;
        this.onSelected = onSelected;

        this.searchBarDiv = document.createElement('div');
        this.searchBarDiv.className = 'search_bar';

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';            
        this.searchInput.id = 'search';            
        this.searchInput.placeholder = 'Search...';
        this.searchInput.autocomplete = false;

        this.resultsDiv = document.createElement('div');
        this.resultsDiv.className = 'search_results';

        this.searchBarDiv.appendChild(this.searchInput);
        this.searchBarDiv.appendChild(this.resultsDiv);


        this.searchInput.addEventListener('input', async (e) => this.search(e));

        this.origin.insertBefore(this.searchBarDiv, this.origin.firstChild);
    }


    async search(e) {
        if (!this.database) {
            this.database = await (await fetch('https://makar-ts.github.io/CTS_Database/database.json')).json()
        }

        var search_for = convert.main(this.searchInput.value);
        var greek_search_for = convert.greek(this.searchInput.value);
        
        let output = {
            hulls: [],
            turrets: [],
            guns: []
        };

        this.resultsDiv.innerHTML = ""

        let count = 12;
        for (let key of Object.keys(this.database.hulls)) {
            var greek_search_key = convert.greek(key)
            var orig_search_key = convert.main(key)

            if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                output.hulls.push(key)
                count--;

                this.resultsDiv.appendChild(this.createResult(
                    "Hull", 
                    key,
                    () => this.set("hulls", key)
                ))
            }

            if (count <= 0) { break; }
        }

        count = 12;
        for (let key of Object.keys(this.database.turrets)) {
            var greek_search_key = convert.greek(key)
            var orig_search_key = convert.main(key)

            if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                output.turrets.push(key)
                count--;

                this.resultsDiv.appendChild(this.createResult(
                    "Turret", 
                    key,
                    () => this.set("turrets", key)
                ))
            }

            if (count <= 0) { break; }
        }

        count = 12;
        for (let key of Object.keys(this.database.guns)) {
            var greek_search_key = convert.greek(key)
            var orig_search_key = convert.main(key)

            if (orig_search_key.includes(search_for) | greek_search_key.includes(greek_search_for)) {
                output.guns.push(key)
                count--;

                this.resultsDiv.appendChild(this.createResult(
                    "Gun", 
                    key,
                    () => this.set("guns", key)
                ))
            }

            if (count <= 0) { break; }
        }

        

    }


    createResult(type, name, onclk) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.onclick = onclk

        const typeLabel = document.createElement('label');
        typeLabel.id = 'type';
        typeLabel.textContent = type; 

        const nameLabel = document.createElement('label');
        nameLabel.id = 'name';
        nameLabel.textContent = name;

        resultDiv.appendChild(typeLabel);
        resultDiv.appendChild(nameLabel);

        return resultDiv;
    }


    set(type, key) {
        this.searchInput.value = key;
        this.resultsDiv.innerHTML = ""
        this.onSelected(this.database[type][key].resources);
    }
}


export default SearchBar