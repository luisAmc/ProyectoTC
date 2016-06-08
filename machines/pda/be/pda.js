function PDA(nodes, links) {
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
    this.stack = this.defineStack();
   // this.print();
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
        if (!simbolfound && this.transition_table[index][0][1] != "")
            alphabet.push(this.transition_table[index][0][1]);
    }

    // console.log(alphabet);

    return alphabet;
};

PDA.prototype.defineStack = function() {
    var stack = [];
    for (var index = 1; index < this.transition_table.length; index++) {
        var simbolfound = false;
        for (var indexstack = .0; indexstack < stack.length; indexstack++) {
            if (stack[indexstack] == this.transition_table[index][0][2]) {
                simbolfound = true;
                break;
            }

        }

        if (!simbolfound && this.transition_table[index][0][2] != "")
            stack.push(this.transition_table[index][0][2]);
    }

    for (var index = 1; index < this.transition_table.length; index++) {
        var simbolfound = false;
        for (var indexstack = .0; indexstack < stack.length; indexstack++) {
            if (stack[indexstack] == this.transition_table[index][0][3]) {
                simbolfound = true;
                break;
            }

        }

        if (!simbolfound && this.transition_table[index][0][3] != "")
            stack.push(this.transition_table[index][0][3]);
    }


        console.log(stack);

    return stack;
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
                for (var indexnew = 0; indexnew < new_transition.length; indexnew++){
                    var new_transitiondivide = this.divideTransition(new_transition[index]);
                    transition_table.push(new_transitiondivide);
                }
            } else {
                var new_transitiondivide = this.divideTransition(new_transition);
                transition_table.push(new_transitiondivide);
            }

        }
    }


    console.log(transition_table);
    return transition_table;
};

PDA.prototype.divideTransition = function(transition){
    var ret_val =[];
    var push = transition[0][1].split("->");
    var input_pop = push[0].split(",");
    ret_val.push([transition[0][0], input_pop[0], input_pop[1], push[1] ,transition[0][2]]);

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

function disableMouseOverPDACanvas() {

    var pda = new PDA(nodes, links);
    pda.revertAllColoring();

    
};
