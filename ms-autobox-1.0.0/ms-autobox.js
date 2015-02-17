$.widget("aekt.msautobox", {
	options: {
		date: new Date(),
		mode: "s",
		debug: false,
		style: {},
		selected: [],
		data: [],
		listSize: 10,
		caseSensitive: false
	},
	_index: 0,
	_main_div: null,
	_field_input: null,
	_menu_div: null,
	_option_div: null,
	_create: function(){
		var $this = this;
		if ($this.element.prop("tagName").toLowerCase() != "input")
			throw "msautobox: must be initialized with input tag only";
		$this.element.children().remove();
		$this.element.addClass("ms-autobox-widget"); //setup plugin class
		$this.element.data("index", $(".ms-autobox-widget").length + 1);
		//initialize the general structure
		$this._main_div = $("<div/>", {"class" : "ms-autobox-container"}); //generate a div in place of the element
		$this._field_input = $("<input/>", {"class" : "ms-autobox-field", "type" : "text"});
		$this._menu_div = $("<div/>", {"class" : "ms-autobox-menu"});
		$this._option_div = $("<div/>", {"class" : "ms-autobox-option"});
		//setting custom style
		if ($this.options.style){
			for (var attr in $this.options.style){
				$this._main_div.css(attr, $this.options.style[attr]);
			}
		}
		$this._field_input.css("line-height", $this._main_div.height() + "px").focus(function(e){
			$this._main_div.addClass("highlight");
			$(this).keyup();
		}).keyup(function(e){
			$this._buildResult();
		});
		$this._main_div.mouseout(function(e){
			$this._field_input.blur(function(e){
				$this._main_div.removeClass("highlight");
				$this._menu_div.hide();
			});
		});
		$this._menu_div.mouseover(function(e){
			$this._field_input.off("blur");
		});
		$this._menu_div.css("width", $this._main_div.width() + 2).css("height", 25 * $this.options.listSize).hide();
		//add the menu
		$this._main_div.append($this._option_div).append($this._field_input).append($this._menu_div);
		$this.element.after($this._main_div);
		$this.element.hide(); //we hide the main element
		$this._main_div.show();
		$this.refresh();//refresh the view
	},
	_setOption: function(key, value) {
		this.options[key] = value;
	},
	//the destroy function
	destroy: function() {
		this.element.show();
		this.element.removeClass("ms-autobox-widget");
		this.element.data("index", "");
		$this._main_div.remove();
		$.Widget.prototype.destroy.call(this);
	},
	_buildResult: function(){
		var $this = this;
		var result = $this.search($this._field_input.val());
		$this._menu_div.children().remove();
		if (result && result.length > 0){
			//if we have any result
			$this._menu_div.css("height", 25 * result.length).show();
			$.each(result, function(index, val){
				//for each result we have to create an option for it
				var $div = $("<div/>", {id: val.id, "class" : "ms-autobox-result-option", html : val.name}).data("val", val).css("width", "100%");
				$this._menu_div.append($div);
				$div.click(function(e){
					var _val = $(this).data("val");
					$this.options.selected.push({id: _val.id, name: _val.name});
					$this._main_div.removeClass("highlight");
					$this._menu_div.hide();
					$this._field_input.focus();
					$this.refresh();
				});
			});
			$this._menu_div.show();
		}else{
			$this._menu_div.hide();
		}
	},
	selected: function(){
		//we abuse the grep function to clone an array
		var result = $.grep(this.options.selected, function(e){return true;});
		return result;
	},
	refresh: function(){
		var $this = this;
		var $options = $this._option_div;
		$options.children().remove(); // remove all the children
		$.each(this.options.selected, function(index, val){
			//add options to children
			var $opt = $("<div/>", { "class" : "ms-autobox-options"}).data("id", val.id);
			var $optLabel = $("<div/>", { "class" : "ms-autobox-label", html : val.name});
			var $optRemover = $("<div/>", {html : "x", "class" : "ms-autobox-option-remover"}).data("index", index).click(function(e){
				$this.options.selected.splice($(this).data("index"), $this.options.selected.length); 
				$this.refresh();
			});
			$opt.append($optLabel).append($optRemover);
			$options.append($opt);
		});
		$this._field_input.css("width", $this._main_div.width() - $options.width() - 1);
	},
	search: function(term){
		var list = this.options.data;
		if (list){
			var _t_val = null;
			$.each(this.options.selected, function(index, val){

				_t_val = null;
				$.each(list, function(_index, _val){
					if (_val.id == val.id){
						_t_val = _val;
						return false;
					}
				});
				if (_t_val == null) throw "invalid parent value detected";
				else list = _t_val.children;
			});
			if (list && list.length){
				var result;
				//this is an array to search through, we split into two to increase performance, although they are very similar
				if (this.options.caseSensitive){
					var regex = new RegExp(term);
					result = $.grep(list, function(val, index){
						return regex.text(val.name);
					});
				}else{
					var regex = new RegExp(term.toLowerCase());
					result = $.grep(list, function(val, index){
						return regex.test(val.name.toLowerCase());
					});				
				}
				return result;
			}
		}
		return [];
	}
});