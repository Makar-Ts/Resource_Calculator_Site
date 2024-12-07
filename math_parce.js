const SUPPORTED_MATH_SIGNS = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

function init_parceMath(string) {
    for (let i of Object.keys(SUPPORTED_MATH_SIGNS)) {
        const index = string.lastIndexOf(i);
        if (index!== -1 && index!== 0) {
            return parceMath(string, i);
        }
    }

    try {
        return parseInt(string);
    } catch (e) {
        throw new Error(`Invalid expression: ${string}`);
    }
}

function parceMath(string, sign) {
    const index = string.lastIndexOf(sign);
    
    const partR = string.slice(0, index);
    const partL = string.slice(index + 1);

    // Обработаем правую часть
    let newPartL = partL;
    for (const i in SUPPORTED_MATH_SIGNS) {
        const rf = newPartL.lastIndexOf(i);
        if (rf !== -1 && rf !== 0) {
            newPartL = parceMath(newPartL, i);
            break;
        }
    }

    // Обработаем левую часть
    let newPartR = partR;
    for (const i in SUPPORTED_MATH_SIGNS) {
        const rf = newPartR.lastIndexOf(i);
        if (rf !== -1 && rf !== 0) {
            newPartR = parceMath(newPartR, i);
            break;
        }
    }

    return SUPPORTED_MATH_SIGNS[sign](parseInt(newPartR), parseInt(newPartL));
}


export default init_parceMath