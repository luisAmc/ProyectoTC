function TM(nodes, links, user_input) {
	this.states = nodes.slice();
	this.transitions = links.slice();
	this.user_input = user_input;
	this.tape = "_" + this.user_input + "_";

	this.transition_table = this.createTransitionTable();

	this.input_alphabet = this.getInputAlphabet(false);
	this.tape_alphabet = this.getInputAlphabet(true);

	this.initial_state = this.getInitialState();
	this.accept_state = this.getAcceptState();
	this.reject_state = this.getRejectState();

	this.configurations = [];
	this.states_path_text = [];
	this.states_path = [];
	this.transitions_path_text = [];
	this.transitions_path = [];
}

TM.prototype.evaluateString = function() {
	var current_tape_index = 1;
	var current_state = this.initial_state.text, current_transition = null, temp_tape = this.tape, state_change = false;;
	while (current_state != "qa" && current_state != "qr") {
		
		for (var current_input_symbol = 1; current_input_symbol < temp_tape.length - 1; current_input_symbol++) {
			state_change = false;
			
			console.log(temp_tape);
			console.log(temp_tape.substr(0, current_tape_index) + "<" + current_state + ">" + temp_tape.substr(current_tape_index ));
			this.configurations.push(temp_tape.substr(0, current_tape_index) + "<" + current_state + ">" + temp_tape.substr(current_tape_index));
			
			if (current_state === "qa" || current_state === "qr") 
				break;

			for (var transition_index = 0; transition_index < this.transition_table.length; transition_index++) {
				current_transition = this.transition_table[transition_index];
				
				if ((current_transition.start_state == current_state) && (current_transition.input_symbol == temp_tape.charAt(current_tape_index))) {
					current_state = current_transition.final_state.valueOf();
					this.states_path_text.push(current_state);
					this.transitions_path_text.push(current_transition);
					
					state_change = true;
					temp_tape = temp_tape.substr(0, current_tape_index) + current_transition.set_in_tape + temp_tape.substr(current_tape_index + 1);
					
					if (current_transition.move_to === "R" || current_transition.move_to === "r")
						current_tape_index++;
					else if (current_transition.move_to === "L" || current_transition.move_to === "l")
						current_tape_index--;

					break;
				}

			}

			if (current_state === "qa")
				break;
		}

		if (!state_change)
			current_state = "qr";	
	}

	console.log(current_state);
	if (current_state === "qa"){
		console.log("si");
		alert("La cadena es aceptada");
	}
	else{
		console.log("no");
		alert("La cadena es rechazada");
	}

	this.states_path = this.getStatesFromText();
	this.transitions_path = this.getTransitionsFromText();
};

TM.prototype.animateMachine = function() {
	var node_amount = 0;
	var time_amount = 0;

	var add_animation = function(state, time, color, radius_size) {
		setTimeout(function() {
			state.animate(color, radius_size);
		}, 300 * time);
	};

	var add_text_animation = function(tape, time) {
		setTimeout(function() {
			$("#input_animation").text(tape);
		}, 310 * time);
	}

	console.log("c: " + this.configurations.length + ", s: " + this.states_path.length);

	while (node_amount < this.configurations.length) {
		add_animation(this.transitions_path[node_amount], time_amount + 1, "yellow");
		add_text_animation(this.configurations[node_amount], time_amount + 1);
		add_animation(this.transitions_path[node_amount], time_amount + 3, "white");
		if (this.states_path[node_amount] != undefined) {
			add_animation(this.states_path[node_amount], time_amount + 5, "yellow", 31);
			add_animation(this.states_path[node_amount], time_amount + 7, "white", 31);
		}

		node_amount++;
		time_amount += 7;
	}

	var diff_amount = this.configurations.length - this.states_path.length + 1;
	if (this.states_path[node_amount - diff_amount].text == "qa")
		add_animation(this.states_path[node_amount - diff_amount], time_amount, "blue", 31);
	else
		add_animation(this.states_path[node_amount - diff_amount], time_amount, "red", 31);
};

TM.prototype.getInputAlphabet = function(add_blank) {
	var alphabet = new Set();
	for (var index = 0; index < this.transition_table.length; index++)
		if (!alphabet.has(this.transition_table[index].input_symbol)) {
			alphabet.add(this.transition_table[index].input_symbol);
			
			if (this.transition_table[index].input_symbol.localeCompare("_"))
				add_blank = !add_blank
		}

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

TM.prototype.validateTmStructure = function() {
	var trans_text = nodes_text = accept_state = false;
	var error_message = "VALIDACIONES DE ESTRUCTURA";
	
	if (accept_state = (this.accept_state == null)) 
		error_message += "\n* La máquina requiere de un estado de aceptación\n";
	

	if (!(trans_text = this.validateTransitionsText())) 
		error_message += "\n* Las transiciones tienen que tener la forma a->b,c\n" +
			"\tDonde:\n" +
			"\ta: es el símbolo de entrada,\n" +
			"\tb: es el símbolo a poner en la cinta,\n" +
			"\tc: es la dirección a la que mover la cinta {R, L}\n";
	
	if (!(nodes_text = this.validateNodesText())) 
		error_message += "\n* Todos los estados tienen que tener nombre\n";

	if (!trans_text || !nodes_text || accept_state) {
		alert(error_message);
		return false;	
	}

	return true;
};

TM.prototype.validateTransitionsText = function() {
	var pattern = /^[a-zA-Z0-9_]->[a-zA-Z0-9_],(R|r|L|l)$/; 
	for (var index = 0; index < this.transitions.length; index++) 
		if (!pattern.test(this.transitions[index].text) && !(this.transitions[index] instanceof StartLink)) 
			return false;
	return true;
};

TM.prototype.validateNodesText = function() {
	for (var index = 0; index < this.states.length; index++)
		if (this.states[index].text == null || this.states[index].text == "")
			return false;
	return true;
};

TM.prototype.revertAllColoring = function() {
    for (var i = 0; i < this.states.length; i++) {
        this.states[i].animate("white", 30);
    }
};

TM.prototype.showOnHTML = function() {
	this.showAllStatesOnHTML();
	this.showTransitionTableOnHTML();
	this.showUniqueStatesOnHTML();
	this.showAlphabetsOnHTML();
};

TM.prototype.showAllStatesOnHTML = function() {
	var states_text = [];
	for (var index = 0; index < this.states.length; index++)
		states_text.push(this.states[index].text);
	$(".states").text("{" + states_text.toString() + "}");
};

TM.prototype.showUniqueStatesOnHTML = function() {
	$(".initial_state").text(this.initial_state.text);
	$(".accept_state").text(this.accept_state.text);
	if (this.reject_state != null)
		$(".reject_state").text(this.reject_state.text);
	else
		$(".reject_state").text("qr (default)");
};

TM.prototype.showTransitionTableOnHTML = function() {
	var transition_table_text = "Transition table\n";
    var start_state_column, input_symbol_column, set_in_tape_column, move_to_column, final_state_column;
    $(".transitions tbody").empty();
    $("#transition_table").append(
    	'<tr><th>Estado Actual</th>' + 
    	'<th>Símbolo de entrada</th>' + 
    	'<th>Símbolo a colocar en la cinta</th>' + 
    	'<th>Dirección de movimiento</th>' +
    	'<th>Siguiente estado</th></tr>');
    for (var index = 0; index < this.transition_table.length; index++) {
        var new_row = document.createElement("tr");
        transition_table_text += "[";
        start_state_column = document.createElement("td");
        start_state_column.textContent = this.transition_table[index].start_state;
        new_row.appendChild(start_state_column);
        transition_table_text += this.transition_table[index].start_state + "\t";

        input_symbol_column = document.createElement("td");
        input_symbol_column.textContent = this.transition_table[index].input_symbol;
        new_row.appendChild(input_symbol_column);
        transition_table_text += this.transition_table[index].input_symbol + "\t";

        set_in_tape_column = document.createElement("td");
        set_in_tape_column.textContent = this.transition_table[index].set_in_tape;
        new_row.appendChild(set_in_tape_column);
        transition_table_text += this.transition_table[index].set_in_tape + "\t";

        move_to_column = document.createElement("td");
        move_to_column.textContent = this.transition_table[index].move_to;
        new_row.appendChild(move_to_column);
        transition_table_text += this.transition_table[index].move_to + "\t";
        
        final_state_column = document.createElement("td");
        final_state_column.textContent = this.transition_table[index].final_state;
        new_row.appendChild(final_state_column);
   
        $(".transitions tbody").append(new_row);
     
        transition_table_text += this.transition_table[index].final_state + "]\n";
    }
};

TM.prototype.showAlphabetsOnHTML = function() {
	var input_alphabet_text = Array.from(this.input_alphabet);
	$(".input_alphabet").text("{" + input_alphabet_text.toString() + "}");
	$(".tape_alphabet").text("{" + input_alphabet_text.toString() + ",_}");
};

TM.prototype.getStatesFromText = function() {
	var ret_val = [];
	for (var text_index = 0; text_index < this.states_path_text.length; text_index++)
		for (var state_index = 0; state_index < this.states.length; state_index++)
			if (this.states[state_index].text === this.states_path_text[text_index]) {
				ret_val.push(this.states[state_index]);
				break;
			}
	return ret_val;
};

TM.prototype.getTransitionsFromText = function() {
	var ret_val = [], current_transition = null, current_text_trans = null, transition_input_and_movement = null;
	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");
	for (var text_index = 0; text_index < this.transitions_path_text.length; text_index++)
		for (var trans_index = 0; trans_index < this.transitions.length; trans_index++) {
			current_transition = this.transitions[trans_index];
			current_text_trans = this.transitions_path_text[text_index];
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

				if (new_transition.start_state == current_text_trans.start_state &&
					new_transition.final_state == current_text_trans.final_state &&
					new_transition.input_symbol == current_text_trans.input_symbol &&
					new_transition.set_in_tape == current_text_trans.set_in_tape &&
					new_transition.move_to == current_text_trans.move_to) {
					ret_val.push(this.transitions[trans_index]);
					break;
				}
			}
		}
	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++");

	return ret_val;
};

function showTMDefinition() {
	// if ($(".states").text() !== "") {
		$(".mainComponents").slideUp();
        $("body").css("overflow", "auto");
        $("#tm-definition").show();
	// }
}

function hideTMDefinition() {
    $(".mainComponents").slideDown();
    $("body").css("overflow", "hidden");
    $("#tm-definition").hide();
}

function genericValidations() {
	var has_errors = false, error_message = "VALIDACIONES GENERICAS:";

	if (nodes.length == 0) {
		error_message += "\n* La máquina debe de tener estados\n";
		has_errors = true;
	}

	if (!validateStartLink()) {
		error_message += "\n* La máquina requiere de un estado inicial\n";
		has_errors = true;
	}
	
	if (links.length == 0) {
		error_message += "\n* La máquina debe de tener transiciones\n";
		has_errors = true;
	} else if (!validateLinksHasGenericText()) {
		error_message += "\n* Las transiciones (excepto la de inicio) necesitan tener texto\n";
		has_errors = true;
	}

	return {
		has_errors: has_errors,
		error_message: error_message
	};
};

function validateStartLink() {
	for (var index = 0; index < links.length; index++)
		if (links[index] instanceof StartLink)
			return true;
	return false;
}

function validateLinksHasGenericText() {
	for (var index = 0; index < links.length; index++)
		if ((links[index].text == null || links[index].text == "") && !(links[index] instanceof StartLink))
			return false;
	return true;
}

function disableMouseOverTMCanvas() {
	var generic_validations = genericValidations();
	if (!generic_validations.has_errors) {
		var tm = new TM(nodes, links, document.getElementById('input_text').value);
		tm.revertAllColoring();
		if (tm.validateTmStructure()) {
	        canvas.onmousedown = function(e) {};
	        canvas.ondblclick = function(e) {};
	        canvas.onmousemove = function(e) {};
	        canvas.onmouseup = function(e) {};

 //        $("#input_animation .processed").text("");
 //        $("#input_animation .unprocessed").text(document.getElementById('input_text').value);
	       tm.showOnHTML();
	       tm.evaluateString();
	       tm.animateMachine();
	       console.log(tm.transitions_path_text);
	       console.log("reales:\n");
	       console.log(tm.transitions_path);
		}
	} else {
		alert(generic_validations.error_message);
	}
};