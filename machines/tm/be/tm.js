function TM(nodes, links, user_input) {
	this.states = nodes.slice();
	this.transitions = links.slice();
	this.user_input = user_input;
	this.tape = "_" + this.user_input + "_";

	this.input_alphabet = this.getInputAlphabet(false);
	this.tape_alphabet = this.getInputAlphabet(true);


	this.initial_state = this.getInitialState();
	this.accept_state = this.getAcceptState();
	this.reject_state = this.getRejectState();


	this.transition_table = this.createTransitionTable();

	this.evaluateString();
}

TM.prototype.evaluateString = function() {
	var current_tape_index = 1;
	var current_state = this.initial_state.text, current_transition = null, temp_tape = this.tape, state_change = false;;
	
	while (current_state != "qa" && current_state != "qr") {
		for (var current_input_symbol = 1; current_input_symbol < temp_tape.length - 1; current_input_symbol++) {
			state_change = false;

			if (current_state == "qa" || current_state == "qr") 
				break;

			for (var transition_index = 0; transition_index < this.transition_table.length; transition_index++) {
				current_transition = this.transition_table[transition_index];
				console.log("Current State: " + current_state + " == Start State CT " + current_transition.start_state + ", input_symbol " + current_transition.input_symbol + " == charAt " + temp_tape.charAt(current_tape_index));
				if ((current_transition.start_state == current_state) && (current_transition.input_symbol == temp_tape.charAt(current_tape_index))) {
					current_state = current_transition.final_state;
					state_change = true;
					temp_tape = temp_tape.substr(0, current_tape_index) + current_transition.set_in_tape + temp_tape.substr(current_tape_index + 1);
					if (current_transition.move_to === "R" || current_transition.move_to === "r")
						current_tape_index++;
					else if (current_transition.move_to === "L" || current_transition.move_to === "l")
						current_tape_index--;
					break;
				}
			}
			if (!state_change)
				current_state = "qr";
			console.log(temp_tape);
		}
	}

	if (current_state === 'qa')
		alert("Accepted");
	else
		alert("Rejected");
};


TM.prototype.getInputAlphabet = function(add_blank) {
	var alphabet = new Set();
	for (var index = 0; index < this.user_input.length; index++)
		if (!alphabet.has(this.user_input.charAt(index)))
			alphabet.add(this.user_input.charAt(index));

	if (add_blank)
		alphabet.add("_");

	return alphabet;
};

TM.prototype.createTransitionTable = function() {
	var transition_table = [];
	var start_transition = this.getStartTransition();

	var current_transition = null, transition_input_and_movement = null;
	for (var index = 0; index < this.transitions.length; index++) {

		current_transition = this.transitions[index];
		if (!(current_transition instanceof StartLink)) {

			if (current_transition instanceof Link)
				transition_nodes = [current_transition.nodeA.text, current_transition.nodeB.text];
			else if (current_transition instanceof SelfLink)
				transition_nodes = [current_transition.node.text, current_transition.node.text];
			
			transition_input_and_movement = this.getTransitionData(current_transition);

			new_transition = {
				start_state: transition_nodes[0],
				input_symbol: transition_input_and_movement[0],
				set_in_tape: transition_input_and_movement[1],
				move_to: transition_input_and_movement[2],
				final_state: transition_nodes[1]
			};

			transition_table.push(new_transition);
		} 
	}
	return transition_table;
};

TM.prototype.getTransitionData = function(current_transition) {
	console.log(current_transition);
	var input_and_tape_data = current_transition.text.split("->");
	var tape_symbol_and_movement_data = input_and_tape_data[1].split(",");
	return [input_and_tape_data[0], tape_symbol_and_movement_data[0], tape_symbol_and_movement_data[1]];
};

TM.prototype.getRejectState = function() {
	for (var index = 0; index < this.states.length; index++)
		if (this.states[index].text === 'qr')
			return this.states[index];

	return null;
};

TM.prototype.getAcceptState = function() {
	for (var index = 0; index < this.states.length; index++)
		if (this.states[index].text === 'qa')
			return this.states[index];

	return null;
};

TM.prototype.getInitialState = function() {
	return this.getStartTransition().node;
};

TM.prototype.getStartTransition = function() {
	for (var index = 0; index < this.transitions.length; index++)
		if (this.transitions[index] instanceof StartLink)
			return this.transitions[index];

	return null;
};

function disableMouseOverTMCanvas() {
	var tm = new TM(nodes, links, document.getElementById('input_text').value);
	// tm.revertAllColoring();
	// if (validateTM(tm)) {
 //        canvas.onmousedown = function(e) {};
 //        canvas.ondblclick = function(e) {};
 //        canvas.onmousemove = function(e) {};
 //        canvas.onmouseup = function(e) {};

 //        $("#input_animation .processed").text("");
 //        $("#input_animation .unprocessed").text(document.getElementById('input_text').value);
 //        tm.evaluateString(document.getElementById('input_text').value);
	// }
};