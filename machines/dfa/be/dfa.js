function DFA(nodes, links) {
    this.states = nodes.slice();
    this.transitions = links.slice();
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
    this.print();
}
DFA.prototype.revertAllColoring = function() {
    for (var i = 0; i < this.states.length; i++) {
        this.states[i].animate("white", 30);
    }
}
DFA.prototype.evaluateString = function(input) {
    var currentNode = this.initial_state;
    var nodePath = [];
    var transitionPath = [];

    for (var currentLetter = 0; currentLetter < input.length; currentLetter++) {
        for (var i = 0; i < this.transitions.length; i++) {
            var current_transition = this.transitions[i];
            var simbols = current_transition.text.split(',');
            var simbolfound = false;
            for (var searchsimbol = 0; searchsimbol < simbols.length; searchsimbol++) {
                if (simbols[searchsimbol] == input.charAt(currentLetter)) {
                    simbolfound = true;
                    break;
                }
            }
            if (simbolfound && !(current_transition instanceof StartLink)) {

                if (current_transition instanceof Link && current_transition.nodeA.text == currentNode.text) {
                    currentNode = current_transition.nodeB;
                    nodePath.push(currentNode);
                    transitionPath.push(current_transition);

                    break;
                } else if (current_transition instanceof SelfLink && current_transition.node.text == currentNode.text) {

                    nodePath.push(currentNode);
                    transitionPath.push(current_transition);
                    break;
                }
            }

        }


    }

    var nodeAmount = 0;
    var timeAmount = 0;
    var addAnimation = function(node, time, color, radiusSize) {

        setTimeout(function() {

            node.animate(color, radiusSize);
        }, 300 * time);
    };
    var addTextAnimation = function(index, time) {
        setTimeout(function() {
            $("#input_animation .processed").text(input.substr(0, index + 1));
            $("#input_animation .unprocessed").text(input.substr(index + 1, input.length))
        }, 310 * time);
    };
    while (nodeAmount < nodePath.length) {
        addAnimation(transitionPath[nodeAmount], timeAmount + 1, "yellow");
        addTextAnimation(nodeAmount, timeAmount + 1);
        addAnimation(transitionPath[nodeAmount], timeAmount + 3, "white");
        addAnimation(nodePath[nodeAmount], timeAmount + 5, "yellow", 31);
        addAnimation(nodePath[nodeAmount], timeAmount + 7, "white", 30);

        nodeAmount++;
        timeAmount += 7;

    }

    if (currentNode.isAcceptState) {

        addAnimation(currentNode, timeAmount, "blue", 31);

    } else {

        addAnimation(currentNode, timeAmount, "red", 31);
    }

}

DFA.prototype.createTransitionTable = function() {
    var transition_table = [];
    var startLink = this.getStartTransition();

    transition_table.push([
        ['A', '->', 'B']
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

            if (new_transition.length > 1) { //Cuando las transiciones estan separadas por comas que las guarde por separado igual que las demás....
                for (var indexnew = 0; indexnew < new_transition.length; indexnew++)
                    transition_table.push([new_transition[indexnew]]);
            } else {
                transition_table.push(new_transition);
            }

        }
    }


    console.log(transition_table);
    return transition_table;
};

DFA.prototype.defineAlphabet = function() {
    var alphabet = [];
    for (var index = 1; index < this.transition_table.length; index++) {
        var simbolfound = false;
        for (var indexalphabet = .0; indexalphabet < alphabet.length; indexalphabet++) {
            if (alphabet[indexalphabet] == this.transition_table[index][0][1]) {
                simbolfound = true;
                break;
            }

        }
        if (!simbolfound && this.transition_table[index][0][1] != "")
            alphabet.push(this.transition_table[index][0][1]);
    }

    // console.log(alphabet);

    return alphabet;
};

DFA.prototype.getTransitions = function(transitions_text, nodeA_text, nodeB_text) {
    var ret_val = [];
    var transitions_symbols = transitions_text.split(",");
    for (var index = 0; index < transitions_symbols.length; index++)
        ret_val.push([nodeA_text, transitions_symbols[index], nodeB_text]);

    return ret_val;
};

DFA.prototype.getStartTransition = function() {
    for (var index = 0; index < this.transitions.length; index++)
        if (this.transitions[index] instanceof StartLink)
            return this.transitions[index];

    return null;
};

DFA.prototype.print = function() {

    var stateTexts = [];
    var finalStatesTexts = [];
    for (var i = 0; i < this.states.length; i++) {
        stateTexts.push(this.states[i].text);
    }
    for (var i = 0; i < this.final_states.length; i++) {
        finalStatesTexts.push(this.final_states[i].text);
    }
    $(".states").text(stateTexts.toString());
    $(".alphabet").text(this.alphabet.toString());
    try{
        $(".initial_state").text(this.initial_state.text);
    }catch(err){};
    $(".final_states").text(finalStatesTexts.toString());
    this.printTransitionTable();
};

DFA.prototype.printTransitionTable = function() {
    var transition_table_text = "Transition table\n";
    var newRow, newColumn;
    $(".transitions tbody").empty();
    $(".transitions tbody").append('<tr><th>Estado Actual</th><th>Símbolo</th><th>Siguiente Estado</th></tr>');
    for (var index = 0; index < this.transition_table.length; index++) {
        for (var row = 0; row < this.transition_table[index].length; row++) {
            if (index !== 0)
                newRow = document.createElement("tr");

            transition_table_text += "[";
            for (var column = 0; column < this.transition_table[index][row].length; column++) {

                transition_table_text += "" + this.transition_table[index][row][column];
                if (index !== 0) {
                    newColumn = document.createElement("td");

                    newColumn.textContent = this.transition_table[index][row][column];
                    newRow.appendChild(newColumn);
                }
                if (column != this.transition_table[index][row].length - 1)
                    transition_table_text += "\t";
            }
            if (newRow) {
                $(".transitions tbody").append(newRow);
            }
            transition_table_text += "]\n";
        }
    }


};


function disableMouseOverDFACanvas() {

    var dfa = new DFA(nodes, links);
    dfa.revertAllColoring();

    if (validarDFA(dfa)) {
        canvas.onmousedown = function(e) {};
        canvas.ondblclick = function(e) {};
        canvas.onmousemove = function(e) {};
        canvas.onmouseup = function(e) {};
        $("#input_animation .processed").text("");
        $("#input_animation .unprocessed").text(document.getElementById('input_text').value);
        dfa.evaluateString(document.getElementById('input_text').value);
    }
};

function showDFADefinition() {
    var dfa = new DFA(nodes, links);
    if ($(".states").text() !== "") {
        $(".mainComponents").slideUp();
        $("body").css("overflow", "auto");
        $("#dfa-definition").show();
    }

};

function hideDFADefinition() {
    $(".mainComponents").slideDown();
    $("body").css("overflow", "hidden");
    $("#dfa-definition").hide();


}

function validarDFA(dfa) {

    if (dfa.states.length == 0) {
        alert("La máquina no se ha definido");
    } else {
        var estadosetiquetados = true;
        for (index = 0; index < dfa.states.length; index++) {
            if (dfa.states[index].text == "") {
                alert("La máquina debe tener todos sus estados etiquetados");
                estadosetiquetados = false;
                break;
            }
        }

        if (estadosetiquetados) {
            var etiquetasdiferentes = true;
            for (index = 0; index < dfa.states.length - 1; index++) {
                for (index2 = index + 1; index2 < dfa.states.length; index2++) {
                    if (dfa.states[index].text == dfa.states[index2].text) {
                        alert("Los estados deben tener etiquetas diferentes");
                        etiquetasdiferentes = false;
                        break;
                    }
                }

                if (!etiquetasdiferentes)
                    break;
            }

            if (etiquetasdiferentes) {
                if (dfa.transition_table.length == 1) {
                    alert("La máquina debe tener transiciones");
                } else {
                    if (dfa.alphabet.length == 0) {
                        alert("La máquina debe tener un alfabeto");
                    } else {


                        if (dfa.initial_state == null) {
                            alert("La máquina debe tener un estado inicial");

                        } else {

                            if (dfa.final_states.length == 0) {
                                alert("La máquina debe tener al menos un estado final");
                            } else {
                                if (!(dfa.transition_table.length - 1 == (dfa.states.length * dfa.alphabet.length))) {
                                    alert("Los estados deben tener una transición para cada símbolo del alfabeto");
                                } else { // Ya esta validada la cantidad de transiciones que deben haber
                                    var esdfa = true;
                                    for (var states = 0; states < dfa.states.length; states++) {
                                        var state = dfa.states[states].text;
                                        var contador = 0;
                                        var alfabeto = dfa.alphabet.slice(0);
                                        for (var index = 1; index < dfa.transition_table.length; index++) {
                                            if (state == dfa.transition_table[index][0][0]) {
                                                for (var indexalphabet = 0; indexalphabet < alfabeto.length; indexalphabet++) {
                                                    if (alfabeto[indexalphabet] == dfa.transition_table[index][0][1]) {
                                                        alfabeto.splice(indexalphabet, 1);
                                                        contador++;
                                                        break;
                                                    }
                                                }

                                            }
                                        }

                                        if (contador < dfa.alphabet.length) {
                                            alert("Los estados deben tener una transición para cada símbolo del alfabeto");
                                            esdfa = false;
                                            break;
                                        }
                                    }

                                    if (esdfa) {
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

function enableMouseOverDFACanvas() {
    enablecanvas();

}


function restoreBackup1(){
    restoreBackup('{"nodes":[{"x":177,"y":211,"text":"a","isAcceptState":true},{"x":402,"y":207,"text":"b","isAcceptState":false}],"links":[{"type":"StartLink","node":0,"text":"","deltaX":-98,"deltaY":0},{"type":"Link","nodeA":0,"nodeB":1,"text":"1","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":1,"nodeB":0,"text":"1","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"SelfLink","node":0,"text":"0","anchorAngle":1.7681918866447774},{"type":"SelfLink","node":1,"text":"0","anchorAngle":-0.4636476090008061}]}');
}

function restoreBackup2(){
    restoreBackup('{"nodes":[{"x":362,"y":159,"text":"a","isAcceptState":true},{"x":493,"y":274,"text":"b","isAcceptState":false},{"x":423,"y":435,"text":"c","isAcceptState":false},{"x":250,"y":435,"text":"d","isAcceptState":false},{"x":191,"y":280,"text":"e","isAcceptState":false}],"links":[{"type":"StartLink","node":0,"text":"","deltaX":-91,"deltaY":0},{"type":"SelfLink","node":0,"text":"0","anchorAngle":-1.4056476493802699},{"type":"Link","nodeA":0,"nodeB":1,"text":"1","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":1,"nodeB":2,"text":"0","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":1,"nodeB":3,"text":"1","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":2,"nodeB":0,"text":"1","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":2,"nodeB":4,"text":"0","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":3,"nodeB":2,"text":"1","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"Link","nodeA":3,"nodeB":1,"text":"0","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0},{"type":"SelfLink","node":4,"text":"1","anchorAngle":-2.743070207923373},{"type":"Link","nodeA":4,"nodeB":3,"text":"0","lineAngleAdjust":0,"parallelPart":0.5,"perpendicularPart":0}]}');
}
