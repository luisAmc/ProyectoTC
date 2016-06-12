function PDA(nodes, links) {
    this.states = nodes.slice();
    this.transitions = links.slice();
    //console.log("transiciones");
    //console.log(this.transitions);
    this.initial_state = null; // No importa si esta en null, va a pasar por la validación antes de recorrer w
    try {
        this.initial_state = this.getStartTransition().node; //nodes[0];
    } catch (err) {}
    this.final_states = [];
    for (var i = 0; i < this.states.length; i++) {
        if (this.states[i].isAcceptState) {
            this.final_states.push(this.states[i]);
        }
    }
    this.transition_table = this.createTransitionTable();
    this.alphabet = this.defineAlphabet();
    this.alphabetStack = this.definealphabetStack();
    this.posiblePaths = [];
    this.stack = new Array();
    // this.print();
    //console.log(this.transitions);
}
PDA.prototype.buildPath = function(path, fromNode) {

    for (var j = 0; j < this.transitions.length; j++) {
        var transitionFrom, transitionTo;
        if (this.transitions[j] instanceof SelfLink || this.transitions[j] instanceof StartLink) {
            transitionFrom = this.transitions[j].node.text;
            transitionTo = this.transitions[j].node.text;
        } else {
            transitionFrom = this.transitions[j].nodeA.text;
            transitionTo = this.transitions[j].nodeB.text;
        }
        if (transitionFrom === fromNode) {
            var simbols = this.transitions[j].text.split(";");
            for (var k = 0; k < simbols.length; k++) {
                if (simbols[k].split(",")[0] === "E") {

                    var transitionsTemp = jQuery.extend(true, [], path.transitions);
                    transitionsTemp.push(this.transitions[j]);
                    path.branches[transitionTo + ";" + k] = this.buildPath({ input: path.input, branches: {}, transitions: transitionsTemp }, transitionTo);
                    path.branches[transitionTo + ";" + k].transitions = transitionsTemp;

                } else {
                    if (path.input !== "") {
                        if (simbols[k].split(",")[0] === path.input[0]) {
                            var transitionsTemp = jQuery.extend(true, [], path.transitions);
                            transitionsTemp.push(this.transitions[j]);
                            path.branches[transitionTo + ";" + k] = this.buildPath({ input: path.input.substr(1), branches: {}, transitions: transitionsTemp }, transitionTo);

                            path.branches[transitionTo + ";" + k].transitions = transitionsTemp;
                        }
                    }
                }
            }
        }
    }
    path.hasBranches = Object.keys(path.branches).length > 0;
    if(!path.hasBranches){
        this.posiblePaths.push(path.transitions);
    }
    return path;

}
PDA.prototype.evaluateString = function(input, pathTransitions) {
    var currentNode = this.initial_state;
    var nodePath = [];
    var transitionPath = [];
    var termina = false;
    var rechazo = false;

    for (var currentLetter = 0; currentLetter < input.length; currentLetter++) {
        var salirFor = false;
        var recorridoTransiciones = 0;
        for (var i = 0; i < pathTransitions.length; i++) {
            var current_transition = pathTransitions[i];
            if (current_transition instanceof StartLink)
                continue;
            var simbols = current_transition.text.split(';');
            for (var searchsimbol = 0; searchsimbol < simbols.length; searchsimbol++) {
                var firstTransitionDivision;
                if (current_transition instanceof Link)
                    firstTransitionDivision = [current_transition.nodeA.text, simbols[searchsimbol], current_transition.nodeB.text];
                else
                    firstTransitionDivision = [current_transition.node.text, simbols[searchsimbol], current_transition.node.text];
                var currentDividedTransition = this.divideTransition(firstTransitionDivision); //divide el input, pop y push
                currentDividedTransition = currentDividedTransition[0];

                if (currentDividedTransition[1] == input.charAt(currentLetter) || currentDividedTransition[1] == 'E') { //si el input coincide                  
                    if (!(current_transition instanceof StartLink)) { //que no sea un start link
                        var current_transitionNodeText;
                        if (current_transition instanceof SelfLink) {
                            current_transitionNodeText = current_transition.node.text;
                        } else {
                            current_transitionNodeText = current_transition.nodeA.text;
                        }
                        if (current_transitionNodeText == currentNode.text) { //si el nodo coincide
                            if (currentDividedTransition[2] != 'E') { //si el pop no es null
                                if (currentDividedTransition[2] == this.stack[this.stack.length - 1]) { //si el pop coincide

                                    nodePath.push(currentNode);
                                    transitionPath.push(current_transition);
                                    this.stack.pop();
                                    if (currentDividedTransition[3] != 'E') {
                                        this.stack.push(currentDividedTransition[3])
                                    }
                                    if (current_transition instanceof Link) { //si no es un self link
                                        currentNode = current_transition.nodeB;
                                    } else {

                                    }
                                    if (currentDividedTransition[1] == 'E')
                                        currentLetter--;
                                    salirFor = true;
                                    break;
                                } else { //si lee un input y el pop no coincide rechaza
                                    salirFor = true;
                                    termina = true;
                                    rechazo = true;
                                }
                            } else { //no importa lo que este en la pila
                                //console.log("cambia estado");
                                nodePath.push(currentNode);
                                transitionPath.push(current_transition);
                                if (currentDividedTransition[3] != 'E') {
                                    this.stack.push(currentDividedTransition[3]);
                                    //console.log("pushea: "+currentDividedTransition[3]);
                                }
                                if (current_transition instanceof Link) { //si no es un self link
                                    currentNode = current_transition.nodeB;
                                    //console.log("cambia estado");
                                } else {
                                    //console.log("mismo estado");
                                }
                                if (currentDividedTransition[1] == 'E')
                                    currentLetter--;
                                salirFor = true;
                                break;
                            }
                        }
                    }
                }
                if (salirFor)
                    break;
            }
            if (salirFor)
                break;
            recorridoTransiciones++;
            if (recorridoTransiciones == pathTransitions.length) {
                termina = true;

            }
        }
        if (termina)
            break;
    }
    if (!rechazo) {
        var hayTransicionE = true;
        console.log("Transiciones E");
        while (hayTransicionE) { //ciclo para evaluar si hay transiciones epsilon en el ultimo estado
            var salirFor = false;
            for (var i = 0; i < pathTransitions.length; i++) {
                var current_transition = pathTransitions[i];
                if (current_transition instanceof StartLink)
                    continue;
                var simbols = current_transition.text.split(';');
                //console.log(simbols);
                for (var searchsimbol = 0; searchsimbol < simbols.length; searchsimbol++) {
                    var firstTransitionDivision;
                    if (current_transition instanceof Link)
                        firstTransitionDivision = [current_transition.nodeA.text, simbols[searchsimbol], current_transition.nodeB.text];
                    else
                        firstTransitionDivision = [current_transition.node.text, simbols[searchsimbol], current_transition.node.text];
                    var currentDividedTransition = this.divideTransition(firstTransitionDivision); //divide el input, pop y push
                    currentDividedTransition = currentDividedTransition[0];
                    if (currentDividedTransition[1] == 'E') {
                        if (!(current_transition instanceof StartLink)) { //que no sea un start link
                            var current_transitionNodeText;
                            if (current_transition instanceof SelfLink) {
                                current_transitionNodeText = current_transition.node.text;
                            } else {
                                current_transitionNodeText = current_transition.nodeA.text;
                            }
                            if (current_transitionNodeText == currentNode.text) { //si el nodo coincide
                                if (currentDividedTransition[2] != 'E') { //si el pop no es null
                                    //console.log("popea: "+this.stack[this.stack.length-1]);
                                    if (currentDividedTransition[2] == this.stack[this.stack.length - 1]) { //si el pop coincide

                                        nodePath.push(currentNode);
                                        transitionPath.push(current_transition);
                                        this.stack.pop();
                                        if (currentDividedTransition[3] != 'E') {
                                            this.stack.push(currentDividedTransition[3]);
                                            //console.log("pushea: "+currentDividedTransition[3]);
                                        }
                                        if (current_transition instanceof Link) { //si no es un self link
                                            currentNode = current_transition.nodeB;
                                            //console.log("cambia estado");
                                        }
                                        salirFor = true;
                                        break;
                                    }
                                } else { //no importa lo que este en la pila
                                    //console.log("cambia estado");
                                    nodePath.push(currentNode);
                                    transitionPath.push(current_transition);
                                    if (currentDividedTransition[3] != 'E') {
                                        this.stack.push(currentDividedTransition[3]);
                                        //console.log("pushea: "+currentDividedTransition[3]);
                                    }
                                    if (current_transition instanceof Link) { //si no es un self link
                                        currentNode = current_transition.nodeB;
                                        //console.log("cambia estado");
                                    }
                                    salirFor = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (salirFor)
                        break;
                }
                if (salirFor)
                    break;
                recorridoTransiciones++;
                if (recorridoTransiciones == pathTransitions.length) {
                    hayTransicionE = false;
                }
            }
        }
    }
    nodePath.push(currentNode); //agregar el ultimo nodo en que se quedo
    if (currentNode.isAcceptState){

        console.log("Acepta");
        return true;
    }

    else{

        console.log("Rechaza");
        return false;
    }
    console.log("Nodos");
    console.log(nodePath);
    console.log("Transiciones");
    console.log(transitionPath);
}
PDA.prototype.revertAllColoring = function() {
    for (var i = 0; i < this.states.length; i++) {
        this.states[i].animate("white", 30);
    }
}

PDA.prototype.defineAlphabet = function() {
    var alphabet = [];
    for (var index = 1; index < this.transition_table.length; index++) {
        var simbolfound = false;
        for (var indexalphabet = .0; indexalphabet < alphabet.length; indexalphabet++) {
            if (alphabet[indexalphabet] == this.transition_table[index][0][1]) {
                simbolfound = true;
                break;
            }

        }
        if (!simbolfound) {
            if (this.transition_table[index][0][1] != undefined && this.transition_table[index][0][1] != "") {
                alphabet.push(this.transition_table[index][0][1]);
            } else {
                alphabet = [];
                break;
            }
        }
    }

    // console.log(alphabet);

    return alphabet;
};

PDA.prototype.definealphabetStack = function() {
    var alphabetStack = [];
    for (var index = 1; index < this.transition_table.length; index++) {
        var simbolfound = false;
        for (var indexalphabetStack = .0; indexalphabetStack < alphabetStack.length; indexalphabetStack++) {
            if (alphabetStack[indexalphabetStack] == this.transition_table[index][0][2]) {
                simbolfound = true;
                break;
            }

        }

        if (!simbolfound) {
            if (this.transition_table[index][0][2] != "" && this.transition_table[index][0][2] != undefined) {
                alphabetStack.push(this.transition_table[index][0][2]);
            } else {
                alphabetStack = [];
                break;
            }

        }
    }

    for (var index = 1; index < this.transition_table.length; index++) {
        var simbolfound = false;
        for (var indexalphabetStack = .0; indexalphabetStack < alphabetStack.length; indexalphabetStack++) {
            if (alphabetStack[indexalphabetStack] == this.transition_table[index][0][3]) {
                simbolfound = true;
                break;
            }

        }

        if (!simbolfound) {
            if (this.transition_table[index][0][3] != "" && this.transition_table[index][0][3] != undefined) {
                alphabetStack.push(this.transition_table[index][0][3]);
            } else {
                alphabetStack = [];
                break;
            }

        }
    }


    //console.log(alphabetStack);

    return alphabetStack;
};


PDA.prototype.createTransitionTable = function() {
    var transition_table = [];
    var startLink = this.getStartTransition();

    transition_table.push([
        ['A', 'input', 'pop', 'push', 'B']
    ]);

    var new_transition = null;
    var current_transition = null;
    for (var index = 0; index < this.transitions.length; index++) {

        current_transition = this.transitions[index];

        if (!(current_transition instanceof StartLink)) {
            if (current_transition instanceof Link)
                new_transition = this.getTransitions(current_transition.text, current_transition.nodeA.text, current_transition.nodeB.text);
            else if (current_transition instanceof SelfLink)
                new_transition = this.getTransitions(current_transition.text, current_transition.node.text, current_transition.node.text);

            if (new_transition.length > 1) { //Cuando las transiciones estan separadas por punto y coma que las guarde por separado igual que las demás....
                for (var indexnew = 0; indexnew < new_transition.length; indexnew++) {
                    var new_transitiondivide = this.divideTransition(new_transition[indexnew]);
                    transition_table.push(new_transitiondivide);
                }
            } else {
                var new_transitiondivide = this.divideTransition(new_transition[0]);
                transition_table.push(new_transitiondivide);
            }

        }
    }


    //console.log(transition_table);
    return transition_table;
};

PDA.prototype.divideTransition = function(transition) {
    var ret_val = [];
    var push = transition[1].split("->");
    var input_pop = push[0].split(",");
    ret_val.push([transition[0], input_pop[0], input_pop[1], push[1], transition[2]]);
    //console.log("divide: "+ret_val);
    return ret_val;
};

PDA.prototype.getTransitions = function(transitions_text, nodeA_text, nodeB_text) {
    var ret_val = [];
    var transitions_symbols = transitions_text.split(";"); //con punto y coma se separaran (1,1->1;0,0->0)
    for (var index = 0; index < transitions_symbols.length; index++)
        ret_val.push([nodeA_text, transitions_symbols[index], nodeB_text]);

    return ret_val;
};

PDA.prototype.getStartTransition = function() {
    for (var index = 0; index < this.transitions.length; index++)
        if (this.transitions[index] instanceof StartLink)
            return this.transitions[index];

    return null;
};

PDA.prototype.getStartTransition = function() {
    for (var index = 0; index < this.transitions.length; index++)
        if (this.transitions[index] instanceof StartLink)
            return this.transitions[index];

    return null;
};


function disableMouseOverPDACanvas() {

    var pda = new PDA(nodes, links);
    pda.revertAllColoring();

    if (validarPDA(pda)) {
        canvas.onmousedown = function(e) {};
        canvas.ondblclick = function(e) {};
        canvas.onmousemove = function(e) {};
        canvas.onmouseup = function(e) {};
        //$("#input_animation .processed").text("");
        //$("#input_animation .unprocessed").text(document.getElementById('input_text').value);
        //pda.evaluateString(document.getElementById('input_text').value);
    }
    pda.posiblePaths = [];
    var allPaths = pda.buildPath({ input: document.getElementById('input_textPDA').value, branches: {}, transitions: [] }, pda.initial_state.text);
    for(var i = 0 ; i < pda.posiblePaths.length; i++){
        if(pda.evaluateString(document.getElementById('input_textPDA').value,pda.posiblePaths[i])){
            break;
        }
    }
    

};

function validarPDA(pda) {

    if (pda.states.length == 0) {
        alert("La máquina no se ha definido");
    } else {
        var estadosetiquetados = true;
        for (index = 0; index < pda.states.length; index++) {
            if (pda.states[index].text == "") {
                alert("La máquina debe tener todos sus estados etiquetados");
                estadosetiquetados = false;
                break;
            }
        }

        if (estadosetiquetados) {
            var etiquetasdiferentes = true;
            for (index = 0; index < pda.states.length - 1; index++) {
                for (index2 = index + 1; index2 < pda.states.length; index2++) {
                    if (pda.states[index].text == pda.states[index2].text) {
                        alert("Los estados deben tener etiquetas diferentes");
                        etiquetasdiferentes = false;
                        break;
                    }
                }

                if (!etiquetasdiferentes)
                    break;
            }

            if (etiquetasdiferentes) {
                if (pda.transition_table.length == 1) {
                    alert("La máquina debe tener transiciones");
                } else {
                    if (pda.alphabet.length == 0) {
                        alert("La máquina debe tener un alfabeto. Las transiciones deben ser separadas por ';' y ser de la forma: input,pop->push");
                    } else {
                        if (pda.alphabetStack.length == 0) {
                            alert("La máquina debe tener un alfabeto de pila. Las transiciones deben ser separadas por ';' y ser de la forma: input,pop->push");
                        } else {

                            if (pda.initial_state == null) {
                                alert("La máquina debe tener un estado inicial");

                            } else {

                                if (pda.final_states.length == 0) {
                                    alert("La máquina debe tener al menos un estado final");
                                } else {
                                    var espda = true;

                                    if (espda) {
                                        return true;
                                    }

                                }
                            }

                        }



                    }
                }

            }

        }

    }


}
