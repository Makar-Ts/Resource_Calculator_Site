import mathParce from './math_parce.js'

class MaterialBlock {
    constructor(
        origin, 
        label, 
        changeAmountCallback, 
        deleteCallback,
        amount=1
    ) {
        this.origin = origin;
        this.label = label;

    
        this.resourceDiv = document.createElement('div');
        this.resourceDiv.className = 'resource';
        //this.resourceDiv.id = id;

        this.closeButton = document.createElement('button');
        this.closeButton.className = 'btn btn-dark';
        this.closeButton.id = 'close_button';
        this.closeButton.textContent = 'x';

        this.label = document.createElement('label');
        this.label.textContent = label;

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.id = 'resource_amount';
        this.input.value = amount;

        this.resourceDiv.appendChild(this.closeButton);
        this.resourceDiv.appendChild(this.label);
        this.resourceDiv.appendChild(this.input);

        this.closeButton.addEventListener('click', deleteCallback);

        this.changeAmountCallback = changeAmountCallback
        this.input.addEventListener('change', (e) => this.onInput(e));


        this.origin.appendChild(this.resourceDiv);
    }

    onInput(event) {
        const amount = mathParce(this.input.value)

        if (isNaN(amount)) {
            alert('Invalid input. Please enter a valid number.');
            return;
        }

        this.input.value = amount.toString()

        this.changeAmountCallback(amount);
    }
}


export default MaterialBlock