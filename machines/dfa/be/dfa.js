function DFA (nodes, links) {
	this.states = nodes.slice();
	this.alphabet = null;
	this.transitions = links.slice();
	this.initial_state = null;
	this.final_states = null;
	
	this.transition_table = this.createTransitionTable();
	this.print();
}

DFA.prototype.createTransitionTable = function() {
	var transition_table = [];
	var startLink = this.getStartTransition();
	
	transition_table.push([['A', '->', 'B']]);

	var new_transition = null;
	var current_transition = null;
	for (var index = 0; index < this.transitions.length; index++) {
		
		current_transition = this.transitions[index];

		if (!(current_transition instanceof StartLink)) {
			if (current_transition instanceof Link)
				new_transition = this.getTransitions(current_transition.text, current_transition.nodeA.text, current_transition.nodeB.text);
			else if (current_transition instanceof SelfLink) 
				new_transition = this.getTransitions(current_transition.text, current_transition.node.text, current_transition.node.text);

			transition_table.push(new_transition);
		}
	}
	

	console.log(transition_table);
	return transition_table;
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
	console.log(this.states);
	console.log(this.transitions);
	this.printTransitionTable();
};

DFA.prototype.printTransitionTable = function() {
	var transition_table_text = "Transition table\n";

	for (var index = 0; index < this.transition_table.length; index++) {
		for (var row = 0; row < this.transition_table[index].length; row++) {
			transition_table_text += "[";
			for (var column = 0; column < this.transition_table[index][row].length; column++) {
				transition_table_text += "" + this.transition_table[index][row][column];
				if (column != this.transition_table[index][row].length - 1)
					transition_table_text += "\t";
			}
			transition_table_text += "]\n";
		}
	}

	console.log(transition_table_text);
};

function disableMouseOverDFACanvas() {
  canvas.onmousedown = function(e) {};
  canvas.ondblclick = function(e) {};
  canvas.onmousemove = function(e) {};
  canvas.onmouseup = function(e) {};

  var dfa = new DFA(nodes, links);
}

