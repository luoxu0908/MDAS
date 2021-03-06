/** Combined code of slick.core, slick.rowselectionmodel, slick.checkboxselectcolumn, slick.formatters, slick.editors, slick.grid, slick.dataview, slick.groupitemmetadataprovider, slick.headermenu */
/* slick.core.js */
(function ($) {
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Event": Event,
			"EventData": EventData,
			"EventHandler": EventHandler,
			"Range": Range,
			"NonDataRow": NonDataItem,
			"Group": Group,
			"GroupTotals": GroupTotals,
			"EditorLock": EditorLock,

			/***
			* A global singleton editor lock.
			* @class GlobalEditorLock
			* @static
			* @constructor
			*/
			"GlobalEditorLock": new EditorLock()
		}
	});

	/***
	* An event object for passing data to event handlers and letting them control propagation.
	* <p>This is pretty much identical to how W3C and jQuery implement events.</p>
	* @class EventData
	* @constructor
	*/
	function EventData() {
		var isPropagationStopped = false;
		var isImmediatePropagationStopped = false;

		/***
		* Stops event from propagating up the DOM tree.
		* @method stopPropagation
		*/
		this.stopPropagation = function () {
			isPropagationStopped = true;
		};

		/***
		* Returns whether stopPropagation was called on this event object.
		* @method isPropagationStopped
		* @return {Boolean}
		*/
		this.isPropagationStopped = function () {
			return isPropagationStopped;
		};

		/***
		* Prevents the rest of the handlers from being executed.
		* @method stopImmediatePropagation
		*/
		this.stopImmediatePropagation = function () {
			isImmediatePropagationStopped = true;
		};

		/***
		* Returns whether stopImmediatePropagation was called on this event object.\
		* @method isImmediatePropagationStopped
		* @return {Boolean}
		*/
		this.isImmediatePropagationStopped = function () {
			return isImmediatePropagationStopped;
		}
	}

	/***
	* A simple publisher-subscriber implementation.
	* @class Event
	* @constructor
	*/
	function Event() {
		var handlers = [];

		/***
		* Adds an event handler to be called when the event is fired.
		* <p>Event handler will receive two arguments - an <code>EventData</code> and the <code>data</code>
		* object the event was fired with.<p>
		* @method subscribe
		* @param fn {Function} Event handler.
		*/
		this.subscribe = function (fn) {
			handlers.push(fn);
		};

		/***
		* Removes an event handler added with <code>subscribe(fn)</code>.
		* @method unsubscribe
		* @param fn {Function} Event handler to be removed.
		*/
		this.unsubscribe = function (fn) {
			for (var i = handlers.length - 1; i >= 0; i--) {
				if (handlers[i] === fn) {
					handlers.splice(i, 1);
				}
			}
		};

		/***
		* Fires an event notifying all subscribers.
		* @method notify
		* @param args {Object} Additional data object to be passed to all handlers.
		* @param e {EventData}
		*      Optional.
		*      An <code>EventData</code> object to be passed to all handlers.
		*      For DOM events, an existing W3C/jQuery event object can be passed in.
		* @param scope {Object}
		*      Optional.
		*      The scope ("this") within which the handler will be executed.
		*      If not specified, the scope will be set to the <code>Event</code> instance.
		*/
		this.notify = function (args, e, scope) {
			e = e || new EventData();
			scope = scope || this;

			var returnValue;
			for (var i = 0; i < handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
				returnValue = handlers[i].call(scope, e, args);
			}

			return returnValue;
		};
	}

	function EventHandler() {
		var handlers = [];

		this.subscribe = function (event, handler) {
			handlers.push({
				event: event,
				handler: handler
			});
			event.subscribe(handler);

			return this;  // allow chaining
		};

		this.unsubscribe = function (event, handler) {
			var i = handlers.length;
			while (i--) {
				if (handlers[i].event === event &&
						handlers[i].handler === handler) {
					handlers.splice(i, 1);
					event.unsubscribe(handler);
					return;
				}
			}

			return this;  // allow chaining
		};

		this.unsubscribeAll = function () {
			var i = handlers.length;
			while (i--) {
				handlers[i].event.unsubscribe(handlers[i].handler);
			}
			handlers = [];

			return this;  // allow chaining
		}
	}

	/***
	* A structure containing a range of cells.
	* @class Range
	* @constructor
	* @param fromRow {Integer} Starting row.
	* @param fromCell {Integer} Starting cell.
	* @param toRow {Integer} Optional. Ending row. Defaults to <code>fromRow</code>.
	* @param toCell {Integer} Optional. Ending cell. Defaults to <code>fromCell</code>.
	*/
	function Range(fromRow, fromCell, toRow, toCell) {
		if (toRow === undefined && toCell === undefined) {
			toRow = fromRow;
			toCell = fromCell;
		}

		/***
		* @property fromRow
		* @type {Integer}
		*/
		this.fromRow = Math.min(fromRow, toRow);

		/***
		* @property fromCell
		* @type {Integer}
		*/
		this.fromCell = Math.min(fromCell, toCell);

		/***
		* @property toRow
		* @type {Integer}
		*/
		this.toRow = Math.max(fromRow, toRow);

		/***
		* @property toCell
		* @type {Integer}
		*/
		this.toCell = Math.max(fromCell, toCell);

		/***
		* Returns whether a range represents a single row.
		* @method isSingleRow
		* @return {Boolean}
		*/
		this.isSingleRow = function () {
			return this.fromRow == this.toRow;
		};

		/***
		* Returns whether a range represents a single cell.
		* @method isSingleCell
		* @return {Boolean}
		*/
		this.isSingleCell = function () {
			return this.fromRow == this.toRow && this.fromCell == this.toCell;
		};

		/***
		* Returns whether a range contains a given cell.
		* @method contains
		* @param row {Integer}
		* @param cell {Integer}
		* @return {Boolean}
		*/
		this.contains = function (row, cell) {
			return row >= this.fromRow && row <= this.toRow &&
					cell >= this.fromCell && cell <= this.toCell;
		};

		/***
		* Returns a readable representation of a range.
		* @method toString
		* @return {String}
		*/
		this.toString = function () {
			if (this.isSingleCell()) {
				return "(" + this.fromRow + ":" + this.fromCell + ")";
			}
			else {
				return "(" + this.fromRow + ":" + this.fromCell + " - " + this.toRow + ":" + this.toCell + ")";
			}
		}
	}


	/***
	* A base class that all special / non-data rows (like Group and GroupTotals) derive from.
	* @class NonDataItem
	* @constructor
	*/
	function NonDataItem() {
		this.__nonDataRow = true;
	}


	/***
	* Information about a group of rows.
	* @class Group
	* @extends Slick.NonDataItem
	* @constructor
	*/
	function Group() {
		this.__group = true;

		/**
		* Grouping level, starting with 0.
		* @property level
		* @type {Number}
		*/
		this.level = 0;

		/***
		* Number of rows in the group.
		* @property count
		* @type {Integer}
		*/
		this.count = 0;

		/***
		* Grouping value.
		* @property value
		* @type {Object}
		*/
		this.value = null;

		/***
		* Formatted display value of the group.
		* @property title
		* @type {String}
		*/
		this.title = null;

		/***
		* Whether a group is collapsed.
		* @property collapsed
		* @type {Boolean}
		*/
		this.collapsed = false;

		/***
		* GroupTotals, if any.
		* @property totals
		* @type {GroupTotals}
		*/
		this.totals = null;

		/**
		* Rows that are part of the group.
		* @property rows
		* @type {Array}
		*/
		this.rows = [];

		/**
		* Sub-groups that are part of the group.
		* @property groups
		* @type {Array}
		*/
		this.groups = null;

		/**
		* A unique key used to identify the group.  This key can be used in calls to DataView
		* collapseGroup() or expandGroup().
		* @property groupingKey
		* @type {Object}
		*/
		this.groupingKey = null;
	}

	Group.prototype = new NonDataItem();

	/***
	* Compares two Group instances.
	* @method equals
	* @return {Boolean}
	* @param group {Group} Group instance to compare to.
	*/
	Group.prototype.equals = function (group) {
		return this.value === group.value &&
				this.count === group.count &&
				this.collapsed === group.collapsed;
	};

	/***
	* Information about group totals.
	* An instance of GroupTotals will be created for each totals row and passed to the aggregators
	* so that they can store arbitrary data in it.  That data can later be accessed by group totals
	* formatters during the display.
	* @class GroupTotals
	* @extends Slick.NonDataItem
	* @constructor
	*/
	function GroupTotals() {
		this.__groupTotals = true;

		/***
		* Parent Group.
		* @param group
		* @type {Group}
		*/
		this.group = null;
	}

	GroupTotals.prototype = new NonDataItem();

	/***
	* A locking helper to track the active edit controller and ensure that only a single controller
	* can be active at a time.  This prevents a whole class of state and validation synchronization
	* issues.  An edit controller (such as SlickGrid) can query if an active edit is in progress
	* and attempt a commit or cancel before proceeding.
	* @class EditorLock
	* @constructor
	*/
	function EditorLock() {
		var activeEditController = null;

		/***
		* Returns true if a specified edit controller is active (has the edit lock).
		* If the parameter is not specified, returns true if any edit controller is active.
		* @method isActive
		* @param editController {EditController}
		* @return {Boolean}
		*/
		this.isActive = function (editController) {
			return (editController ? activeEditController === editController : activeEditController !== null);
		};

		/***
		* Sets the specified edit controller as the active edit controller (acquire edit lock).
		* If another edit controller is already active, and exception will be thrown.
		* @method activate
		* @param editController {EditController} edit controller acquiring the lock
		*/
		this.activate = function (editController) {
			if (editController === activeEditController) { // already activated?
				return;
			}
			if (activeEditController !== null) {
				throw "SlickGrid.EditorLock.activate: an editController is still active, can't activate another editController";
			}
			if (!editController.commitCurrentEdit) {
				throw "SlickGrid.EditorLock.activate: editController must implement .commitCurrentEdit()";
			}
			if (!editController.cancelCurrentEdit) {
				throw "SlickGrid.EditorLock.activate: editController must implement .cancelCurrentEdit()";
			}
			activeEditController = editController;
		};

		/***
		* Unsets the specified edit controller as the active edit controller (release edit lock).
		* If the specified edit controller is not the active one, an exception will be thrown.
		* @method deactivate
		* @param editController {EditController} edit controller releasing the lock
		*/
		this.deactivate = function (editController) {
			if (activeEditController !== editController) {
				throw "SlickGrid.EditorLock.deactivate: specified editController is not the currently active one";
			}
			activeEditController = null;
		};

		/***
		* Attempts to commit the current edit by calling "commitCurrentEdit" method on the active edit
		* controller and returns whether the commit attempt was successful (commit may fail due to validation
		* errors, etc.).  Edit controller's "commitCurrentEdit" must return true if the commit has succeeded
		* and false otherwise.  If no edit controller is active, returns true.
		* @method commitCurrentEdit
		* @return {Boolean}
		*/
		this.commitCurrentEdit = function () {
			return (activeEditController ? activeEditController.commitCurrentEdit() : true);
		};

		/***
		* Attempts to cancel the current edit by calling "cancelCurrentEdit" method on the active edit
		* controller and returns whether the edit was successfully cancelled.  If no edit controller is
		* active, returns true.
		* @method cancelCurrentEdit
		* @return {Boolean}
		*/
		this.cancelCurrentEdit = function cancelCurrentEdit() {
			return (activeEditController ? activeEditController.cancelCurrentEdit() : true);
		};
	}

	/* slick.rowselectionmodel.js */
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"RowSelectionModel": RowSelectionModel
		}
	});

	function RowSelectionModel(options) {
		var _grid;
		var _ranges = [];
		var _self = this;
		var _handler = new Slick.EventHandler();
		var _inHandler;
		var _options;
		var _defaults = {
			selectActiveRow: true
		};

		function init(grid) {
			_options = $.extend(true, {}, _defaults, options);
			_grid = grid;
			_handler.subscribe(_grid.onActiveCellChanged,
					wrapHandler(handleActiveCellChange));
			_handler.subscribe(_grid.onKeyDown,
					wrapHandler(handleKeyDown));
			_handler.subscribe(_grid.onClick,
					wrapHandler(handleClick));
		}
		console.log('destroy:'+destroy());
		function destroy() {
			_handler.unsubscribeAll();
		}

		function wrapHandler(handler) {
			return function () {
				if (!_inHandler) {
					_inHandler = true;
					handler.apply(this, arguments);
					_inHandler = false;
				}
			};
		}

		function rangesToRows(ranges) {
			var rows = [];
			for (var i = 0; i < ranges.length; i++) {
				for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
					rows.push(j);
				}
			}
			return rows;
		}

		function rowsToRanges(rows) {
			var ranges = [];
			var lastCell = _grid.getColumns().length - 1;
			for (var i = 0; i < rows.length; i++) {
				ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
			}
			return ranges;
		}

		function getRowsRange(from, to) {
			var i, rows = [];
			for (i = from; i <= to; i++) {
				rows.push(i);
			}
			for (i = to; i < from; i++) {
				rows.push(i);
			}
			return rows;
		}

		function getSelectedRows() {
			return rangesToRows(_ranges);
		}

		function setSelectedRows(rows) {
			setSelectedRanges(rowsToRanges(rows));
		}

		function setSelectedRanges(ranges) {
			_ranges = ranges;
			_self.onSelectedRangesChanged.notify(_ranges);
		}

		function getSelectedRanges() {
			return _ranges;
		}

		function handleActiveCellChange(e, data) {
			if (_options.selectActiveRow && data.row != null) {
				setSelectedRanges([new Slick.Range(data.row, 0, data.row, _grid.getColumns().length - 1)]);
			}
		}

		function handleKeyDown(e) {
			var activeRow = _grid.getActiveCell();
			if (activeRow && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && (e.which == 38 || e.which == 40)) {
				var selectedRows = getSelectedRows();
				selectedRows.sort(function (x, y) {
					return x - y
				});

				if (!selectedRows.length) {
					selectedRows = [activeRow.row];
				}

				var top = selectedRows[0];
				var bottom = selectedRows[selectedRows.length - 1];
				var active;

				if (e.which == 40) {
					active = activeRow.row < bottom || top == bottom ? ++bottom : ++top;
				} else {
					active = activeRow.row < bottom ? --bottom : --top;
				}

				if (active >= 0 && active < _grid.getDataLength()) {
					_grid.scrollRowIntoView(active);
					_ranges = rowsToRanges(getRowsRange(top, bottom));
					setSelectedRanges(_ranges);
				}

				e.preventDefault();
				e.stopPropagation();
			}
		}

		function handleClick(e) {
			var cell = _grid.getCellFromEvent(e);
			if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
				return false;
			}

			var selection = rangesToRows(_ranges);
			var idx = $.inArray(cell.row, selection);

			if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
				return false;
			}
			else if (_grid.getOptions().multiSelect) {
				if (idx === -1 && (e.ctrlKey || e.metaKey)) {
					selection.push(cell.row);
					_grid.setActiveCell(cell.row, cell.cell);
				} else if (idx !== -1 && (e.ctrlKey || e.metaKey)) {
					selection = $.grep(selection, function (o, i) {
						return (o !== cell.row);
					});
					_grid.setActiveCell(cell.row, cell.cell);
				} else if (selection.length && e.shiftKey) {
					var last = selection.pop();
					var from = Math.min(cell.row, last);
					var to = Math.max(cell.row, last);
					selection = [];
					for (var i = from; i <= to; i++) {
						if (i !== last) {
							selection.push(i);
						}
					}
					selection.push(last);
					_grid.setActiveCell(cell.row, cell.cell);
				}
			}

			_ranges = rowsToRanges(selection);
			setSelectedRanges(_ranges);
			e.stopImmediatePropagation();

			return true;
		}

		$.extend(this, {
			"getSelectedRows": getSelectedRows,
			"setSelectedRows": setSelectedRows,

			"getSelectedRanges": getSelectedRanges,
			"setSelectedRanges": setSelectedRanges,

			"init": init,
			"destroy": this.destroy,

			"onSelectedRangesChanged": new Slick.Event()
		});
	}

	/* slick.checkboxselectcolumn.js */
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"CheckboxSelectColumn": CheckboxSelectColumn
		}
	});

	function CheckboxSelectColumn(options) {
		var _grid;
		var _self = this;
		var _handler = new Slick.EventHandler();
		var _selectedRowsLookup = {};
		var _defaults = {
			columnId: "_checkbox_selector",
			cssClass: null,
			toolTip: "Select/Deselect All",
			width: 30
		};

		var _options = $.extend(true, {}, _defaults, options);

		function init(grid) {
			_grid = grid;
			_handler
				.subscribe(_grid.onSelectedRowsChanged, handleSelectedRowsChanged)
				.subscribe(_grid.onClick, handleClick)
				.subscribe(_grid.onHeaderClick, handleHeaderClick)
				.subscribe(_grid.onKeyDown, handleKeyDown);
		}

		function destroy() {
			_handler.unsubscribeAll();
		}

		function handleSelectedRowsChanged(e, args) {
			var selectedRows = _grid.getSelectedRows();
			var lookup = {}, row, i;
			for (i = 0; i < selectedRows.length; i++) {
				row = selectedRows[i];
				lookup[row] = true;
				if (lookup[row] !== _selectedRowsLookup[row]) {
					_grid.invalidateRow(row);
					delete _selectedRowsLookup[row];
				}
			}
			for (i in _selectedRowsLookup) {
				_grid.invalidateRow(i);
			}
			_selectedRowsLookup = lookup;
			_grid.render();

			if (selectedRows.length && selectedRows.length == _grid.getDataLength()) {
				_grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked'>", _options.toolTip);
			} else {
				_grid.updateColumnHeader(_options.columnId, "<input type='checkbox'>", _options.toolTip);
			}
		}

		function handleKeyDown(e, args) {
			if (e.which == 32) {
				if (_grid.getColumns()[args.cell].id === _options.columnId) {
					// if editing, try to commit
					if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
						toggleRowSelection(args.row);
					}
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			}
		}

		function handleClick(e, args) {
			// clicking on a row select checkbox
			if (_grid.getColumns()[args.cell].id === _options.columnId && $(e.target).is(":checkbox")) {
				// if editing, try to commit
				if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					return;
				}

				toggleRowSelection(args.row);
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		}

		function toggleRowSelection(row) {
			if (_selectedRowsLookup[row]) {
				_grid.setSelectedRows($.grep(_grid.getSelectedRows(), function (n) {
					return n != row
				}));
			} else {
				_grid.setSelectedRows(_grid.getSelectedRows().concat(row));
			}
		}

		function handleHeaderClick(e, args) {
			if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {
				// if editing, try to commit
				if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					return;
				}

				if ($(e.target).is(":checked")) {
					var rows = [];
					for (var i = 0; i < _grid.getDataLength(); i++) {
						rows.push(i);
					}
					_grid.setSelectedRows(rows);
				} else {
					_grid.setSelectedRows([]);
				}
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		}

		function getColumnDefinition() {
			return {
				id: _options.columnId,
				name: "<input type='checkbox'>",
				toolTip: _options.toolTip,
				field: "sel",
				width: _options.width,
				resizable: false,
				sortable: false,
				cssClass: _options.cssClass,
				formatter: checkboxSelectionFormatter
			};
		}

		function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
			if (dataContext) {
				return _selectedRowsLookup[row]
						? "<input type='checkbox' checked='checked'>"
						: "<input type='checkbox'>";
			}
			return null;
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"getColumnDefinition": getColumnDefinition
		});
	}

	/* slick.formatters.js */
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Formatters": {
				"PercentComplete": PercentCompleteFmt,
				"PercentCompleteBar": PercentCompleteBarFmt,
				"HTML": HTMLFmt,
				"Lookup": LookupFmt,
				"LookupJSON": LookupJSONFmt,
				"YesNo": YesNoFmt,
				"Checkmark": CheckmarkFmt,
				"Hyperlink": HyperlinkFmt,
				"DateTime": DateTimeFmt,
				"Number": NumberFmt,
				"Currency": CurrencyFmt
			}
		}
	});
	function LookupJSONFmt(row, cell, value, columnDef, dataContext) {
		if (!columnDef.lookupjson) return "Missing columnDef.lookupjson";
		if (!columnDef.keyfield) return "Missing columnDef.keyfield";
		if (!columnDef.valuefield) return "Missing columnDef.valuefield";
		var tmpid = ((columnDef.id + "_" + row + "_" + cell).split("|").join("").split(".").join(""));
		window.LookupJSONFmt_JSONCalls = window.LookupJSONFmt_JSONCalls || {};
		var PrevAJAX = window.LookupJSONFmt_JSONCalls[tmpid] || false;
		if (PrevAJAX && PrevAJAX.readyState != 4) { PrevAJAX.abort(); } //abort prev call if still running
		if (value == null) {
			return "<div id='" + tmpid + "'>" + (columnDef.invalidtext || "") + "</div>";
		} else {
			var data = {};
			data[columnDef.keyfield] = value;
			window.LookupJSONFmt_JSONCalls[tmpid] = $.JSONPost(columnDef.lookupjson, data, { ShowErrMsg: false })
					.fail(function (jqXHR, textStatus, errorThrown) {
						window.LookupJSONFmt_JSONCalls[tmpid] = false;
						$('#' + tmpid).html((columnDef.jsonerrtext || value));
					})
					.done(function (data) {
						window.LookupJSONFmt_JSONCalls[tmpid] = false;
						var R = data.d.RetData.Tbl.Rows;
						if (R.length > 0) {
							$('#' + tmpid).html(R[0][columnDef.valuefield]);
						} else {
							$('#' + tmpid).html((columnDef.invalidtext || value));
						}
					});
			return "<div id='" + tmpid + "'>" + (columnDef.initialtext || value) + "</div>";
		}
	}
	function LookupFmt(row, cell, value, columnDef, dataContext, OthDS) {
		if (value == null) return "";
		if (value || (value.length > 0)) {
			if (columnDef.listval && columnDef.listtxt) { //pipe-delimited list
				var listdscache = columnDef.id + '__cache';
				if (!OthDS) OthDS = {};
				var cacheobj = OthDS[listdscache];
				if (!cacheobj) {
					var cacheobj = {};
					var listtxt = (columnDef.listtxt || columnDef.listval).split("|");
					var listval = (columnDef.listval || columnDef.listtxt).split("|");
					for (var i = 0; i < listtxt.length; i++) {
						cacheobj[(listval[i])] = (listtxt[i]);
					}
					OthDS[listdscache] = cacheobj;
				}
				return (cacheobj[value] || value);
			}
			if (columnDef.listds && OthDS) {
				var listdscache = columnDef.listds + '__cache';
				var cacheobj = OthDS[listdscache];
				if (!cacheobj) {
					var cacheobj = {};
					var List = OthDS[columnDef.listds].Rows;
					if (List.length > 0) {
						if (List[0].Txt || List[0].Val || (List[0].Txt === '') || (List[0].Val === '')) {
							for (var i = 0; i < List.length; i++) {
								cacheobj[(List[i].Val || List[i].Txt)] = (List[i].Txt || List[i].Val);
							}
						} else {
							for (var key in List[0]) break;
							for (var i = 0; i < List.length; i++) {
								cacheobj[(List[i][key])] = (List[i][key]);
							}
						}
					}
					OthDS[listdscache] = cacheobj;
				}
				return (cacheobj[value] || value);
			}
			return value;
		}
		return "";
	}
	function YesNoFmt(row, cell, value, columnDef, dataContext) { return value ? "Yes" : "No"; }
	function PercentCompleteFmt(row, cell, value, columnDef, dataContext) {
		if (value == null || value === "") {
			return "-";
		} else if (value < 50) {
			return "<span style='color:red;font-weight:bold;'>" + value + "%</span>";
		} else {
			return "<span style='color:green'>" + value + "%</span>";
		}
	}
	function PercentCompleteBarFmt(row, cell, value, columnDef, dataContext) {
		if (value == null || value === "") { return ""; }
		var color;
		if (value < 30) {
			color = "red";
		} else if (value < 70) {
			color = "silver";
		} else {
			color = "green";
		}
		return "<span class='percent-complete-bar' style='background:" + color + ";width:" + value + "%'></span>";
	}
	function HTMLFmt(row, cell, value, columnDef, dataContext) { if (value == null) { return ""; } else { return value; } }
	function CheckmarkFmt(row, cell, value, columnDef, dataContext) {
		var Path = ((GridImgFolder) ? encodeURI(GridImgFolder + '/') : "../styles/images/");
		var T = "tick.png", C = "cross.png";
		if (columnDef.invertfldtoken) {
			if (_processStrTokens(columnDef.invertfldtoken, dataContext, false)) { T = "cross.png"; C = "tick.png"; }
		}
		if (columnDef.showcross) {
			return value ? "<img src='" + Path + T + "'>" : "<img src='" + Path + C + "'>";
		} else {
			return value ? "<img src='" + Path + T + "'>" : "";
		}
	}
	function DateTimeFmt(row, cell, value, columnDef, dataContext) {
		if (value) {
			var M = (columnDef.parsefmt) ? moment(value, columnDef.parsefmt) : moment(value);
			if (M.isValid()) { return M.format(columnDef.dispfmt || "D MMM YYYY"); }
		}
		return "";
	}
	function HyperlinkFmt(row, cell, value, columnDef, dataContext) {
		if (columnDef.text) { value = columnDef.text; }
		if (!value) return "";
		var url = columnDef.url || "";
		var attrs = (columnDef.target) ? (" target='" + columnDef.target + "'") : "";
		if (columnDef.popup) {
			attrs += ((attrs.length > 0) ? " " : "") + "onclick=\"Utils.Popup(this,'" + columnDef.popup + "');return false;\"";
		} else if (columnDef.onclick) {
			attrs += ((attrs.length > 0) ? " " : "") + "onclick=\"" + _processStrTokens(columnDef.onclick, dataContext, false) + "\"";
		}
		return "<a href=\"" + _processStrTokens(url, dataContext, true) + "\"" + attrs + ">" + value + "</a>";
	}
	function _processStrTokens(Str, dataContext, encURIComp) {
		var spl = Str.split("{{"), outStr = "";
		for (var i = 0; i < spl.length; i++) {
			var Idx = spl[i].indexOf("}}");
			if (Idx >= 0) { //found, first ocurrence is a variable
				var VarToken = spl[i].substring(0, Idx);
				if (VarToken.length > 0) {
					var Vars = VarToken.split("|"); //Token format {{Varname|DoNotEscapeStr}}
					var V = Vars[0], R = '', EscStr = false;
					//If DoNotEscapeStr is not defined, we see if variable has ' or " in it, by default if it has we escape
					if (Vars.length > 1) {
						EscStr = ((Vars[1]) ? true : false);
					} else {
						if (((V || "").indexOf("'") >= 0) || ((V || "").indexOf('"') >= 0)) EscStr = true;
					}
					if (dataContext.hasOwnProperty(V)) {
						R = (parseInt(dataContext[V]) == 0) ? dataContext[V] : dataContext[V] || '';
					} else { //global variable?
						R = (parseInt(window[V]) == 0) ? window[V] : window[V] || '';
					}
					if (encURIComp) R = encodeURIComponent(R);
					if (EscStr) R = Utils.escapeString(R);
					outStr += R + spl[i].substring(Idx + 2);
				}
			} else {
				outStr += spl[i];
			}
		}
		return outStr;
	}
	function NumberFmt(row, cell, value, columnDef, dataContext) {
		if (!value) return "";
		return _FormatNum(value, (columnDef.dispdp || 2), '.', ',', columnDef.disppre, columnDef.disppost, false);
	}
	function CurrencyFmt(row, cell, value, columnDef, dataContext) {
		if (!value) return "";
		return _FormatNum(value, 2, '.', ',', '$', '', true);
	}
	function _FormatNum(n, c, d, t, pre, post, nb) {
		//n = number; c = decimal places; d = decimal indicator; t = thousands separator; pre = Prefix; post = Postfix; nb = if true, show -ve numbers with brackets () instead
		var P = (n >= 0), c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t
		var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
		pre = pre || ""; post = post || "";
		if (P) {
			return pre + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + post;
		} else if (nb) {
			return "(" + pre + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + post + ")";
		} else {
			return "-" + pre + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + post;
		}
	}

	/* slick.editors.js */
	// register namespace
	// to do - update "Date": DateEditor,
	// add new "Time": TimeEditor, "DateTime": DateTimeEditor, "DropDown": DropDownEditor,
	$.extend(true, window, {
		"Slick": {
			"Editors": {
				"Text": TextEditor,
				"Integer": IntegerEditor,
				"Date": DateEditor,
				"Checkbox": CheckboxEditor,
				"PercentComplete": PercentCompleteEditor,
				"LongText": LongTextEditor,
				"DropDown": DropDownEditor,
				"AutoComplete": AutoCompleteEditor,
				"SelectJSON": SelectJSONEditor
			}
		}
	});

	function SelectJSONEditor(args) {
		var $select, defaultValue, scope = this;
		//Init defaults
		var C = args.column;
		var _minInputLen = (C.editormininputlen || 2);
		var _placeholder = (C.editorplaceholder || "");
		var _autocommit = ((C.editorautocommit || false) == true);  //default false
		var _initjson = (C.editorinitjson || ""); //Mandatory
		var _initkeyfield = (C.editorinitkeyfield || C.editorkeyfield || "ID");
		var _initvalfield = (C.editorinitvaluefield || C.editorvaluefield || "Txt");
		var _initjsonsendrowdata = ((C.editorinitjsonsendrowdata || false) == true);  //default false
		var _searchjson = (C.editorsearchjson || ""); //Mandatory
		var _searchterm = (C.editorsearchterm || "SearchTerm");
		var _searchjsonsendrowdata = ((C.editorsearchjsonsendrowdata || false) == true);  //default false
		var _searchjsondata = (C.searchjsondata || "").split("|"); //Field1|Value1|Field2|Value2
		var _searchjsondatarowcnt = _searchjsondata.length;
		var _searchkeyfield = (C.editorkeyfield || C.editorinitkeyfield || "ID");
		var _searchvalfield = (C.editorvaluefield || C.editorinitvaluefield || "Txt");
		var _searchcustomsels = (C.editorcustomselections || "").split("|"); //Text1|FunctionToCall1|Text2|FunctionToCall2
		var _searchcustrowcnt = _searchcustomsels.length;
		this.init = function () {
			if (!_initjson) { alert('Missing editorinitjson option (misconfiguration), please check with support.'); return false; }
			if (!_searchjson) { alert('Missing editorinitjson option (misconfiguration), please check with support.'); return false; }
			$select = $("<input type='hidden' tabindex='-1' style='width: 100%;' />").appendTo(args.container).select2({ minimumInputLength: _minInputLen, placeholder: _placeholder, query: GetSearchMatches, initSelection: InitItemSelection, allowClear: true }).on("change", function (e) {
				var Proc = false;
				if (_searchcustrowcnt > 1) {
					for (var j = 0; j < _searchcustrowcnt; j += 2) {
						if (e.val == _searchcustomsels[j]) {
							Proc = true;
							var fnName = _searchcustomsels[j + 1];
							var fn = window[fnName];
							if (typeof fn === 'function') {
								fn(e, $select, window.SearchTerm, $select.select2("val"));
							} else {
								alert('Invalid function name (window.' + fnName + ' is not a function) for custom selection, please check with support.'); return false;
							}
						}
					}
				}
				if ((!Proc) && (_autocommit)) { args.commitChanges(true); }
			});
			function GetSearchMatches(query) {
				window.SearchTerm = query.term;
				var Data = {};
				if (_searchjsondatarowcnt > 1) {
					for (var j = 0; j < _searchjsondatarowcnt; j += 2) {
						var FldName = _searchjsondata[j];
						var Val = _searchjsondata[j + 1];
						Data[FldName] = Val;
					}
				}
				if (_searchjsonsendrowdata) $.extend(Data, args.item); //send back row data as well
				Data[_searchterm] = query.term;
				$.JSONPost(_searchjson, Data).done(function (data) {
					var R = data.d.RetData.Tbl.Rows, RowCnt = R.length;
					var return_data = { results: [] };
					for (var i = 0; i < RowCnt; i++) { return_data.results.push({ id: R[i][_searchkeyfield], text: R[i][_searchvalfield] }); }
					if (_searchcustrowcnt > 1) {
						for (var j = 0; j < _searchcustrowcnt; j += 2) { return_data.results.push({ id: _searchcustomsels[j], text: _searchcustomsels[j] }); }
					}
					query.callback(return_data);
				});
			}
			function InitItemSelection(element, callback) {
				var _Val = $(element).val();
				if (_Val != "") {
					var Data = {};
					if (_initjsonsendrowdata) $.extend(Data, args.item); //send back row data as well
					Data[_initkeyfield] = _Val;
					$.JSONPost(_initjson, Data)
							.done(function (data) {
								var R = data.d.RetData.Tbl.Rows;
								if (R.length > 0) {
									callback({ id: R[0][_initkeyfield], text: R[0][_initvalfield] });
								} else {
									callback({ id: -1, text: "Invalid ID" });
								}
							});
				}
			}
			$select.select2("open");
		};
		this.destroy = function () { $select.select2("destroy").remove(); };
		this.focus = function () { $select.select2("open"); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field];
			$select.select2("val", defaultValue).select2("open");
		};
		this.serializeValue = function () { return $select.select2("val"); };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($select.select2("val") == "" && defaultValue == null)) && ($select.select2("val") != defaultValue); };
		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator($select.select2("val"));
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function TextEditor(args) {
		var $input, defaultValue, scope = this;
		this.init = function () {
			$input = $("<input type=text class='editor-text' />")
					.appendTo(args.container)
					.bind("keydown.nav", function (e) {
						if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
							e.stopImmediatePropagation();
						}
					})
					.focus().select();
		};
		this.destroy = function () { $input.remove(); };
		this.focus = function () { $input.focus(); };
		this.getValue = function () { return $input.val(); };
		this.setValue = function (val) { $input.val(val); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field] || "";
			$input.val(defaultValue);
			$input[0].defaultValue = defaultValue;
			$input.select();
		};
		this.serializeValue = function () { return $input.val(); };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue); };
		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val(), $input);
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function IntegerEditor(args) {
		var $input, defaultValue, scope = this;
		this.init = function () {
			$input = $("<input type=text class='editor-text' />");
			$input.bind("keydown.nav", function (e) {
				if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
					e.stopImmediatePropagation();
				}
			});
			$input.appendTo(args.container);
			$input.focus().select();
		};
		this.destroy = function () { $input.remove(); };
		this.focus = function () { $input.focus(); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field];
			$input.val(defaultValue);
			$input[0].defaultValue = defaultValue;
			$input.select();
		};
		this.serializeValue = function () { return parseInt($input.val(), 10) || 0; };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue); };
		this.validate = function () {
			if (isNaN($input.val())) {
				return {
					valid: false,
					msg: "Please enter a valid integer"
				};
			}
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val());
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function DateEditor(args) {
		var $input, defaultValue, scope = this, calendarOpen = true;
		this.init = function () {
			var _autocommit = ((args.column.editorautocommit || false) == true);  //default false
			$input = $("<input type=text class='editor-text' />");
			$input.appendTo(args.container);
			$input.datepicker({
				showOn: "both", dateFormat: (args.column.editfmt || "d M yy"), yearRange: (args.column.range || 'c-10:c+10'),
				buttonImageOnly: true, changeMonth: true, changeYear: true,
				buttonImage: (GridImgFolder) ? encodeURI(GridImgFolder + "/calendar.gif") : "../styles/images/calendar.gif",
				beforeShow: function () { calendarOpen = true },
				onClose: function () { calendarOpen = false },
				onSelect: function (date) {
					if (_autocommit) { args.commitChanges(true); }
				}
			});
			$input.width($input.width() - 18);
			$input.focus().select();
		};
		this.destroy = function () {
			$.datepicker.dpDiv.stop(true, true);
			$input.datepicker("hide");
			$input.datepicker("destroy");
			$input.remove();
		};
		this.show = function () {
			if (calendarOpen) { $.datepicker.dpDiv.stop(true, true).show(); }
		};
		this.hide = function () {
			if (calendarOpen) { $.datepicker.dpDiv.stop(true, true).hide(); }
		};
		this.position = function (position) {
			if (!calendarOpen) { return; }
			$.datepicker.dpDiv
					.css("top", position.top + 30)
					.css("left", position.left);
		};
		this.focus = function () { $input.focus(); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field];
			var M = (args.column.parsefmt) ? moment(defaultValue, args.column.parsefmt) : moment(defaultValue);
			if (M && M.isValid()) { defaultValue = M.format(args.column.dispfmt || "D MMM YYYY"); } else { defaultValue = "" }
			$input.val(defaultValue);
			$input[0].defaultValue = defaultValue;
			$input.select();
		};
		this.serializeValue = function () {
			var M = moment($input.val(), args.column.dispfmt || "D MMM YYYY");
			if (M && M.isValid()) { return M.format(args.column.parsefmt || "YYYY-MM-DDTHH:mm:ss.SSS"); }
			return "";
		};
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue); };
		this.validate = function () {
			var Val = $input.val();
			if (Val.length > 0) {
				var M = moment(Val, args.column.dispfmt || "D MMM YYYY");
				if (!M.isValid()) { return { valid: false, msg: "Unrecognised date format" }; }
			}
			if (args.column.validator) {
				var validationResults = args.column.validator(Val);
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function AutoCompleteEditor(args) {
		var $input, $wait, defaultValue, scope = this;
		this.init = function () {
			$input = $("<input type=text class='editor-text' />").appendTo(args.container);
			$wait = $("<div id='acwait' class='wait_img' style='z-index:10000;position:absolute;display:none;'>&nbsp;</div>").appendTo(document.body);
			var List = [];
			if ((args.column.listtxt) && (args.column.listval)) {
				var listtxt = args.column.listtxt.split("|");
				var listval = args.column.listval.split("|");
				for (var i = 0; i < listtxt.length; i++) { List.push({ value: listval[i], label: listtxt[i] }); }
			} else if (args.column.listtxt) {
				List = args.column.listtxt.split("|");
			} else if (args.column.listval) {
				List = args.column.listval.split("|");
			} else if (args.column.listds) {
				List = args.grid.getOptions().__OthDS[args.column.listds].Rows;
			} else if (args.column.listjson) {
				args.column.acminlen = args.column.acminlen || 3;
				args.column.acdelay = args.column.acdelay || 400;
				List = function (request, response) {
					var jqxhr = $.JSONPost(args.column.listjson, { "Term": request.term }, { WaitDiv: "acwait" });
					jqxhr.fail(function (jqXHR, textStatus, errorThrown) {
						response([]); alert(textStatus);
					});
					jqxhr.done(function (data, textStatus, jqXHR) {
						if ((data) && (data.d.RetVal == -1)) {
							if ((data.d.RetData) && (data.d.RetData.Tbl) && (data.d.RetData.Tbl.Rows)) {
								response(data.d.RetData.Tbl.Rows);
							} else {
								response([]);
							}
							data.d.RetMsg = data.d.RetMsg || '';
							if (data.d.RetMsg.length > 0) { alert(data.d.RetMsg); }
						} else {
							response([]);
							if ((data) && (data.d.RetMsg)) {
								if (data.d.RetMsg.length > 0) { alert(data.d.RetMsg); } else { alert('AJAX call error-please check with support.'); }
							} else { alert('AJAX call error-please check with support.'); }
						}
					});
				}
			}
			$input.autocomplete({ source: List, delay: (args.column.acdelay || 200), minLength: (args.column.acminlen || 1) });
			$input.focus().select();
			scope.position(args.position);
		};
		this.destroy = function () { $input.autocomplete("destroy"); $input.remove(); $wait.remove(); };
		this.focus = function () { $input.focus(); };
		this.position = function (position) { $wait.css("top", position.top + 2).css("left", position.left + $input.width() + 10); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field];
			$input.val(defaultValue);
			$input[0].defaultValue = defaultValue;
			$input.select();
		};
		this.serializeValue = function () { return $input.val(); };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue); };
		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator(Val);
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function DropDownEditor(args) {
		var $select, defaultValue, scope = this;
		//Init defaults
		var C = args.column;
		this.init = function () {
			var _autocommit = ((C.editorautocommit || false) == true);  //default false
			var _listds = (C.listds || "");
			var _listval = (C.listval || "");
			var _listtxt = (C.listtxt || "");
			var _listblankrowtxt = (C.listblankrowtxt || "");
			var _listjson = (C.listjson || "");
			var _listjsonsendrowdata = ((C.listjsonsendrowdata || false) == true);  //default false
			var _listjsondata = (C.listjsondata || "").split("|"); //Field1|Value1|Field2|Value2
			var _listjsondatarowcnt = _listjsondata.length;
			var _listjsoncache = ((C.listjsoncache || true) == true);  //default true
			var _listkeyfield = (C.listkeyfield || "Val");
			var _listvaluefield = (C.listvaluefield || "Txt");
			$select = $("<select tabIndex='0' class='editor-dropdown'></select>");
			if (_listblankrowtxt) $select.append($('<option>', { value: "" }).text(_listblankrowtxt));
			if (_listtxt || _listval) { //pipe-delimited list
				var listtxt = (_listtxt || _listval).split("|");
				var listval = (_listval || _listtxt).split("|");
				for (var i = 0; i < listtxt.length; i++) {
					$select.append($('<option>', { value: listval[i] }).text(listtxt[i]));
				}
			}
			if (_listds) {
				var List = args.grid.getOptions().__OthDS[_listds].Rows;
				if (List.length > 0) {
					if (List[0][_listvaluefield] || List[0][_listkeyfield] || (List[0][_listkeyfield] === '') || (List[0][_listvaluefield] === '')) {
						for (var i = 0; i < List.length; i++) {
							$select.append($('<option>', { value: (List[i][_listkeyfield] || List[i][_listvaluefield]) }).text(List[i][_listvaluefield] || List[i][_listkeyfield]));
						}
					} else {
						for (var key in List[0]) break;
						for (var i = 0; i < List.length; i++) {
							console.log(List[i][key])
							$select.append($('<option>', { value: List[i][key] }).text(List[i][key]));
						}
					}
				}
			}
			if (_listjson) {
				var ListCache = args.grid.getOptions().__OthDS[_listjson];
				if (_listjsoncache && ListCache) {
					var R = ListCache.Rows, RowCnt = R.length;
					for (var i = 0; i < RowCnt; i++) {
						$select.append($('<option>', { value: R[i][_listkeyfield] }).text(R[i][_listvaluefield]));
					}
				} else { //load from json
					var Data = {};
					if (_listjsondatarowcnt > 1) {
						for (var j = 0; j < _listjsondatarowcnt; j += 2) {
							var FldName = _listjsondata[j];
							var Val = _listjsondata[j + 1];
							Data[FldName] = Val;
						}
					}
					if (_listjsonsendrowdata) $.extend(Data, args.item); //send back row data as well
					$.JSONPost(_listjson, Data).done(function (data) {
						var R = data.d.RetData.Tbl.Rows, RowCnt = R.length;
						for (var i = 0; i < RowCnt; i++) {
							$select.append($('<option>', { value: R[i][_listkeyfield] }).text(R[i][_listvaluefield]));
						}
						$select.val(defaultValue); //reapply default value
						if (_listjsoncache) args.grid.getOptions().__OthDS[_listjson] = data.d.RetData.Tbl; //cache result
					});
				}
			}
			$select.appendTo(args.container);
			if (_autocommit) { $select.change(function () { args.commitChanges(true); }); }
			$select.focus();
		};
		this.destroy = function () { $select.remove(); };
		this.focus = function () { $select.focus(); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field];
			$select.val(defaultValue); $select.select();
		};
		this.serializeValue = function () { return ($select.val()); };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return ($select.val() != defaultValue); };
		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val());
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function CheckboxEditor(args) {
		var $select, defaultValue, scope = this;
		this.init = function () {
			$select = $("<input type=checkbox class='editor-checkbox' hideFocus>");
			$lbl = $("<label>").append($select).appendTo(args.container);
			$select.focus();
		};
		this.destroy = function () { $select.remove(); };
		this.focus = function () { $select.focus(); };
		this.loadValue = function (item) {
			defaultValue = item[args.column.field];
			if (defaultValue) { $select.attr("checked", "checked"); } else { $select.removeAttr("checked"); }
		};
		this.serializeValue = function () { return $select.is(":checked"); };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return ($select.is(":checked") != defaultValue); };
		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val());
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	function PercentCompleteEditor(args) {
		var $select, defaultValue, scope = this;
		this.init = function () {
			$input = $("<input type=text class='editor-percentcomplete' />");
			$input.width($(args.container).innerWidth() - 25);
			$input.appendTo(args.container);
			$picker = $("<div class='editor-percentcomplete-picker' />").appendTo(args.container);
			$picker.append("<div class='editor-percentcomplete-helper'><div class='editor-percentcomplete-wrapper'><div class='editor-percentcomplete-slider' /><div class='editor-percentcomplete-buttons' /></div></div>");
			$picker.find(".editor-percentcomplete-buttons").append("<button val=0>Not started</button><br/><button val=50>In Progress</button><br/><button val=100>Complete</button>");
			$input.focus().select();
			$picker.find(".editor-percentcomplete-slider").slider({
				orientation: "vertical",
				range: "min",
				value: defaultValue,
				slide: function (event, ui) {
					$input.val(ui.value)
				}
			});
			$picker.find(".editor-percentcomplete-buttons button").bind("click", function (e) {
				$input.val($(this).attr("val"));
				$picker.find(".editor-percentcomplete-slider").slider("value", $(this).attr("val"));
			})
		};
		this.destroy = function () { $input.remove(); $picker.remove(); };
		this.focus = function () { $input.focus(); };
		this.loadValue = function (item) {
			$input.val(defaultValue = item[args.column.field]);
			$input.select();
		};
		this.serializeValue = function () { return parseInt($input.val(), 10) || 0; };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($input.val() == "" && defaultValue == null)) && ((parseInt($input.val(), 10) || 0) != defaultValue); };
		this.validate = function () {
			if (isNaN(parseInt($input.val(), 10))) {
				return { valid: false, msg: "Please enter a valid positive number" };
			}
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val());
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}

	/*
	* An example of a "detached" editor.
	* The UI is added onto document BODY and .position(), .show() and .hide() are implemented.
	* KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
	*/
	function LongTextEditor(args) {
		var $input, $wrapper, defaultValue, scope = this;
		var C = args.column;
		var EditorWidth = (C.EditorWidth || "250px");
		var EditorHeight = (C.EditorHeight || "80px");
		this.init = function () {
			var $container = $("body");
			$wrapper = $("<div style='z-index:10000;position:absolute;background:white;padding:5px;border:3px solid gray;-moz-border-radius:5px;border-radius:5px;'/>")
					.appendTo($container);
			$input = $("<textarea hidefocus rows=5 style='backround:white;width:" + EditorWidth + ";height:" + EditorHeight + ";border:0;outline:0'>")
					.appendTo($wrapper);
			$("<div style='text-align:right'><button>Save</button><button>Cancel</button></div>")
					.appendTo($wrapper);
			$wrapper.find("button:first").bind("click", this.savenomove);
			$wrapper.find("button:last").bind("click", this.cancel);
			$input.bind("keydown", this.handleKeyDown);
			scope.position(args.position);
			$input.focus().select();
		};
		this.handleKeyDown = function (e) {
			if (e.which == $.ui.keyCode.ENTER && e.ctrlKey) {
				scope.save();
			} else if (e.which == $.ui.keyCode.ESCAPE) {
				e.preventDefault(); scope.cancel();
			} else if (e.which == $.ui.keyCode.TAB && e.shiftKey) {
				e.preventDefault(); args.grid.navigatePrev();
			} else if (e.which == $.ui.keyCode.TAB) {
				e.preventDefault(); args.grid.navigateNext();
			}
		};
		this.save = function () { args.commitChanges(); };
		this.savenomove = function () { args.commitChanges(true); };
		this.cancel = function () { $input.val(defaultValue); args.cancelChanges(); };
		this.hide = function () { $wrapper.hide(); };
		this.show = function () { $wrapper.show(); };
		this.position = function (position) {
			$wrapper.css("top", position.top - 5).css("left", position.left - 5);
		};
		this.destroy = function () { $wrapper.remove(); };
		this.focus = function () { $input.focus(); };
		this.loadValue = function (item) {
			$input.val(defaultValue = item[args.column.field]);
			$input.select();
		};
		this.serializeValue = function () { return $input.val(); };
		this.applyValue = function (item, state) { item[args.column.field] = state; };
		this.isValueChanged = function () { return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue); };
		this.validate = function () {
			if (args.column.validator) {
				var validationResults = args.column.validator($input.val());
				if (!validationResults.valid) { return validationResults; }
			}
			return { valid: true, msg: null };
		};
		this.init();
	}
})($);

/* slick.grid.js */
/**
* @license
* (c) 2009-2012 Michael Leibman
* michael{dot}leibman{at}gmail{dot}com
* http://github.com/mleibman/slickgrid
*
* Distributed under MIT license.
* All rights reserved.
*
* SlickGrid v2.1
*
* NOTES:
*     Cell/row DOM manipulations are done directly bypassing jQuery's DOM manipulation methods.
*     This increases the speed dramatically, but can only be done safely because there are no event handlers
*     or data associated with any cell/row DOM nodes.  Cell editors must make sure they implement .destroy()
*     and do proper cleanup.
*/

// make sure required JavaScript modules are loaded
if (typeof $ === "undefined") {
	throw "SlickGrid requires jquery module to be loaded";
}
if (!jQueryEventDrag) {
	throw "SlickGrid requires jquery.event.drag module to be loaded";
}
if (typeof Slick === "undefined") {
	throw "slick.core.js not loaded";
}

(function ($) {
	// Slick.Grid
	$.extend(true, window, {
		Slick: {
			Grid: SlickGrid
		}
	});

	// shared across all grids on the page
	var scrollbarDimensions;
	var maxSupportedCssHeight;  // browser's breaking point

	//////////////////////////////////////////////////////////////////////////////////////////////
	// SlickGrid class implementation (available as Slick.Grid)

	/**
	* Creates a new instance of the grid.
	* @class SlickGrid
	* @constructor
	* @param {Node}              container   Container node to create the grid in.
	* @param {Array,Object}      data        An array of objects for databinding.
	* @param {Array}             columns     An array of column definitions.
	* @param {Object}            options     Grid options.
	**/
	function SlickGrid(container, data, columns, options) {
		// settings
		var defaults = {
			explicitInitialization: false,
			rowHeight: 25,
			defaultColumnWidth: 80,
			enableAddRow: false,
			leaveSpaceForNewRows: false,
			editable: false,
			autoEdit: true,
			enableCellNavigation: true,
			enableColumnReorder: false,
			asyncEditorLoading: false,
			asyncEditorLoadDelay: 100,
			forceFitColumns: false,
			enableAsyncPostRender: false,
			asyncPostRenderDelay: 50,
			autoHeight: false,
			editorLock: Slick.GlobalEditorLock,
			showHeaderRow: false,
			headerRowHeight: 16,
			showTopPanel: false,
			topPanelHeight: 25,
			formatterFactory: null,
			editorFactory: null,
			cellFlashingCssClass: "flashing",
			selectedCellCssClass: "selected",
			multiSelect: true,
			enableTextSelectionOnCells: false,
			dataItemColumnValueExtractor: null,
			fullWidthRows: false,
			multiColumnSort: false,
			defaultFormatter: defaultFormatter,
			forceSyncScrolling: false
		};

		var columnDefaults = {
			name: "",
			resizable: true,
			sortable: true,
			minWidth: 30,
			rerenderOnResize: false,
			headerCssClass: null,
			defaultSortAsc: true
		};

		// scroller
		var th;   // virtual height
		var h;    // real scrollable height
		var ph;   // page height
		var n;    // number of pages
		var cj;   // "jumpiness" coefficient

		var page = 0;       // current page
		var offset = 0;     // current page offset
		var vScrollDir = 1;

		// private
		var initialized = false;
		var $container;
		var uid = "slickgrid_" + Math.round(1000000 * Math.random());
		var self = this;
		var $focusSink, $focusSink2;
		var $headerScroller;
		var $headers;
		var $headerRow, $headerRowScroller, $headerRowSpacer;
		var $topPanelScroller;
		var $topPanel;
		var $viewport;
		var $canvas;
		var $style;
		var $boundAncestors;
		var stylesheet, columnCssRulesL, columnCssRulesR;
		var viewportH, viewportW;
		var canvasWidth;
		var viewportHasHScroll, viewportHasVScroll;
		var headerColumnWidthDiff = 0, headerColumnHeightDiff = 0, // border+padding
				cellWidthDiff = 0, cellHeightDiff = 0;
		var absoluteColumnMinWidth;
		var numberOfRows = 0;

		var tabbingDirection = 1;
		var activePosX;
		var activeRow, activeCell;
		var activeCellNode = null;
		var currentEditor = null;
		var serializedEditorValue;
		var editController;

		var rowsCache = {};
		var renderedRows = 0;
		var numVisibleRows;
		var prevScrollTop = 0;
		var scrollTop = 0;
		var lastRenderedScrollTop = 0;
		var lastRenderedScrollLeft = 0;
		var prevScrollLeft = 0;
		var scrollLeft = 0;

		var selectionModel;
		var selectedRows = [];

		var plugins = [];
		var cellCssClasses = {};

		var columnsById = {};
		var sortColumns = [];
		var columnPosLeft = [];
		var columnPosRight = [];


		// async call handles
		var h_editorLoader = null;
		var h_render = null;
		var h_postrender = null;
		var postProcessedRows = {};
		var postProcessToRow = null;
		var postProcessFromRow = null;

		// perf counters
		var counter_rows_rendered = 0;
		var counter_rows_removed = 0;


		//////////////////////////////////////////////////////////////////////////////////////////////
		// Initialization

		function init() {
			$container = $(container);
			if ($container.length < 1) {
				throw new Error("SlickGrid requires a valid container, " + container + " does not exist in the DOM.");
			}

			// calculate these only once and share between grid instances
			maxSupportedCssHeight = maxSupportedCssHeight || getMaxSupportedCssHeight();
			scrollbarDimensions = scrollbarDimensions || measureScrollbar();

			options = $.extend({}, defaults, options);
			validateAndEnforceOptions();
			columnDefaults.width = options.defaultColumnWidth;

			columnsById = {};
			for (var i = 0; i < columns.length; i++) {
				var m = columns[i] = $.extend({}, columnDefaults, columns[i]);
				columnsById[m.id] = i;
				if (m.minWidth && m.width < m.minWidth) {
					m.width = m.minWidth;
				}
				if (m.maxWidth && m.width > m.maxWidth) {
					m.width = m.maxWidth;
				}
			}



			// validate loaded JavaScript modules against requested options
			if (options.enableColumnReorder && !Sortable) {
				throw new Error("SlickGrid's 'enableColumnReorder = true' option requires jquery-ui.sortable module to be loaded");
			}

			editController = {
				"commitCurrentEdit": commitCurrentEdit,
				"cancelCurrentEdit": cancelCurrentEdit
			};

			$container
					.empty()
					.css("overflow", "hidden")
					.css("outline", 0)
					.addClass(uid)
					.addClass("ui-widget");

			// set up a positioning container if needed
			if (!/relative|absolute|fixed/.test($container.css("position"))) {
				$container.css("position", "relative");
			}

			$focusSink = $("<div tabIndex='0' hideFocus style='position:fixed;width:0;height:0;top:0;left:0;outline:0;'></div>").appendTo($container);

			$headerScroller = $("<div class='slick-header ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
			$headers = $("<div class='slick-header-columns' style='left:-1000px' />").appendTo($headerScroller);
			$headers.width(getHeadersWidth());

			$headerRowScroller = $("<div class='slick-headerrow ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
			$headerRow = $("<div class='slick-headerrow-columns' />").appendTo($headerRowScroller);
			$headerRowSpacer = $("<div style='display:block;height:1px;position:absolute;top:0;left:0;'></div>")
					.css("width", getCanvasWidth() + scrollbarDimensions.width + "px")
					.appendTo($headerRowScroller);

			$topPanelScroller = $("<div class='slick-top-panel-scroller ui-state-default' style='overflow:hidden;position:relative;' />").appendTo($container);
			$topPanel = $("<div class='slick-top-panel' style='width:10000px' />").appendTo($topPanelScroller);

			if (!options.showTopPanel) {
				$topPanelScroller.hide();
			}

			if (!options.showHeaderRow) {
				$headerRowScroller.hide();
			}

			$viewport = $("<div class='slick-viewport' style='width:100%;overflow:auto;outline:0;position:relative;;'>").appendTo($container);
			$viewport.css("overflow-y", options.autoHeight ? "hidden" : "auto");

			$canvas = $("<div class='grid-canvas' />").appendTo($viewport);

			$focusSink2 = $focusSink.clone().appendTo($container);

			if (!options.explicitInitialization) {
				finishInitialization();
			}
		}

		function finishInitialization() {
			if (!initialized) {
				initialized = true;

				viewportW = parseFloat($.css($container[0], "width", true));

				// header columns and cells may have different padding/border skewing width calculations (box-sizing, hello?)
				// calculate the diff so we can set consistent sizes
				measureCellPaddingAndBorder();

				// for usability reasons, all text selection in SlickGrid is disabled
				// with the exception of input and textarea elements (selection must
				// be enabled there so that editors work as expected); note that
				// selection in grid cells (grid body) is already unavailable in
				// all browsers except IE
				disableSelection($headers); // disable all text selection in header (including input and textarea)

				if (!options.enableTextSelectionOnCells) {
					// disable text selection in grid cells except in input and textarea elements
					// (this is IE-specific, because selectstart event will only fire in IE)
					$viewport.bind("selectstart.ui", function (event) {
						return $(event.target).is("input,textarea");
					});
				}

				updateColumnCaches();
				createColumnHeaders();
				setupColumnSort();
				createCssRules();
				resizeCanvas();
				bindAncestorScrollEvents();

				$container
						.bind("resize.slickgrid", resizeCanvas);
				$viewport
						.bind("scroll", handleScroll);
				$headerScroller
						.bind("contextmenu", handleHeaderContextMenu)
						.bind("click", handleHeaderClick)
						.delegate(".slick-header-column", "mouseenter", handleHeaderMouseEnter)
						.delegate(".slick-header-column", "mouseleave", handleHeaderMouseLeave);
				$headerRowScroller
						.bind("scroll", handleHeaderRowScroll);
				$focusSink.add($focusSink2)
						.bind("keydown", handleKeyDown);
				$canvas
						.bind("keydown", handleKeyDown)
						.bind("click", handleClick)
						.bind("dblclick", handleDblClick)
						.bind("contextmenu", handleContextMenu)
						.bind("draginit", handleDragInit)
						.bind("dragstart", handleDragStart)
						.bind("drag", handleDrag)
						.bind("dragend", handleDragEnd)
						.delegate(".slick-cell", "mouseenter", handleMouseEnter)
						.delegate(".slick-cell", "mouseleave", handleMouseLeave);
			}
		}

		function registerPlugin(plugin) {
			plugins.unshift(plugin);
			plugin.init(self);
		}

		function unregisterPlugin(plugin) {
			for (var i = plugins.length; i >= 0; i--) {
				if (plugins[i] === plugin) {
					if (plugins[i].destroy) {
						plugins[i].destroy();
					}
					plugins.splice(i, 1);
					break;
				}
			}
		}

		function setSelectionModel(model) {
			if (selectionModel) {
				selectionModel.onSelectedRangesChanged.unsubscribe(handleSelectedRangesChanged);
				if (selectionModel.destroy) {
					selectionModel.destroy();
				}
			}

			selectionModel = model;
			if (selectionModel) {
				selectionModel.init(self);
				selectionModel.onSelectedRangesChanged.subscribe(handleSelectedRangesChanged);
			}
		}

		function getSelectionModel() {
			return selectionModel;
		}

		function getCanvasNode() {
			return $canvas[0];
		}

		function measureScrollbar() {
			var $c = $("<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>").appendTo("body");
			var dim = {
				width: $c.width() - $c[0].clientWidth,
				height: $c.height() - $c[0].clientHeight
			};
			$c.remove();
			return dim;
		}

		function getHeadersWidth() {
			var headersWidth = 0;
			for (var i = 0, ii = columns.length; i < ii; i++) {
				var width = columns[i].width;
				headersWidth += width;
			}
			headersWidth += scrollbarDimensions.width;
			return Math.max(headersWidth, viewportW) + 1000;
		}

		function getCanvasWidth() {
			var availableWidth = viewportHasVScroll ? viewportW - scrollbarDimensions.width : viewportW;
			var rowWidth = 0;
			var i = columns.length;
			while (i--) {
				rowWidth += columns[i].width;
			}
			return options.fullWidthRows ? Math.max(rowWidth, availableWidth) : rowWidth;
		}

		function updateCanvasWidth(forceColumnWidthsUpdate) {
			var oldCanvasWidth = canvasWidth;
			canvasWidth = getCanvasWidth();

			if (canvasWidth != oldCanvasWidth) {
				$canvas.width(canvasWidth);
				$headerRow.width(canvasWidth);
				$headers.width(getHeadersWidth());
				viewportHasHScroll = (canvasWidth > viewportW - scrollbarDimensions.width);
			}

			$headerRowSpacer.width(canvasWidth + (viewportHasVScroll ? scrollbarDimensions.width : 0));

			if (canvasWidth != oldCanvasWidth || forceColumnWidthsUpdate) {
				applyColumnWidths();
			}
		}

		function disableSelection($target) {
			if ($target && $target.jquery) {
				$target
						.attr("unselectable", "on")
						.css("MozUserSelect", "none")
						.bind("selectstart.ui", function () {
							return false;
						}); // from jquery:ui.core.js 1.7.2
			}
		}

		function getMaxSupportedCssHeight() {
			var supportedHeight = 1000000;
			// FF reports the height back but still renders blank after ~6M px
			var testUpTo = ($.browser.mozilla) ? 6000000 : 1000000000;
			var div = $("<div style='display:none' />").appendTo(document.body);

			while (true) {
				var test = supportedHeight * 2;
				div.css("height", test);
				if (test > testUpTo || div.height() !== test) {
					break;
				} else {
					supportedHeight = test;
				}
			}

			div.remove();
			return supportedHeight;
		}

		// TODO:  this is static.  need to handle page mutation.
		function bindAncestorScrollEvents() {
			var elem = $canvas[0];
			while ((elem = elem.parentNode) != document.body && elem != null) {
				// bind to scroll containers only
				if (elem == $viewport[0] || elem.scrollWidth != elem.clientWidth || elem.scrollHeight != elem.clientHeight) {
					var $elem = $(elem);
					if (!$boundAncestors) {
						$boundAncestors = $elem;
					} else {
						$boundAncestors = $boundAncestors.add($elem);
					}
					$elem.bind("scroll." + uid, handleActiveCellPositionChange);
				}
			}
		}

		function unbindAncestorScrollEvents() {
			if (!$boundAncestors) {
				return;
			}
			$boundAncestors.unbind("scroll." + uid);
			$boundAncestors = null;
		}

		function updateColumnHeader(columnId, title, toolTip) {
			if (!initialized) { return; }
			var idx = getColumnIndex(columnId);
			if (idx == null) {
				return;
			}

			var columnDef = columns[idx];
			var $header = $headers.children().eq(idx);
			if ($header) {
				if (title !== undefined) {
					columns[idx].name = title;
				}
				if (toolTip !== undefined) {
					columns[idx].toolTip = toolTip;
				}

				trigger(self.onBeforeHeaderCellDestroy, {
					"node": $header[0],
					"column": columnDef
				});

				$header
						.attr("title", toolTip || "")
						.children().eq(0).html(title);

				trigger(self.onHeaderCellRendered, {
					"node": $header[0],
					"column": columnDef
				});
			}
		}

		function getHeaderRow() {
			return $headerRow[0];
		}

		function getHeaderRowColumn(columnId) {
			var idx = getColumnIndex(columnId);
			var $header = $headerRow.children().eq(idx);
			return $header && $header[0];
		}

		function createColumnHeaders() {
			function hoverBegin() {
				$(this).addClass("ui-state-hover");
			}

			function hoverEnd() {
				$(this).removeClass("ui-state-hover");
			}

			$headers.find(".slick-header-column")
				.each(function () {
					var columnDef = $(this).data("column");
					if (columnDef) {
						trigger(self.onBeforeHeaderCellDestroy, {
							"node": this,
							"column": columnDef
						});
					}
				});
			$headers.empty();
			$headers.width(getHeadersWidth());

			$headerRow.find(".slick-headerrow-column")
				.each(function () {
					var columnDef = $(this).data("column");
					if (columnDef) {
						trigger(self.onBeforeHeaderRowCellDestroy, {
							"node": this,
							"column": columnDef
						});
					}
				});
			$headerRow.empty();

			for (var i = 0; i < columns.length; i++) {
				var m = columns[i];

				var header = $("<div class='ui-state-default slick-header-column' id='" + uid + m.id + "' />")
						.html("<span class='slick-column-name'>" + m.name + "</span>")
						.width(m.width - headerColumnWidthDiff)
						.attr("title", m.toolTip || "")
						.data("column", m)
						.addClass(m.headerCssClass || "")
						.appendTo($headers);

				if (options.enableColumnReorder || m.sortable) {
					header.hover(hoverBegin, hoverEnd);
				}

				if (m.sortable) {
					header.addClass("slick-header-sortable");
					header.append("<span class='slick-sort-indicator' />");
				}

				trigger(self.onHeaderCellRendered, {
					"node": header[0],
					"column": m
				});

				if (options.showHeaderRow) {
					var headerRowCell = $("<div class='ui-state-default slick-headerrow-column l" + i + " r" + i + "'></div>")
							.data("column", m)
							.appendTo($headerRow);

					trigger(self.onHeaderRowCellRendered, {
						"node": headerRowCell[0],
						"column": m
					});
				}
			}

			setSortColumns(sortColumns);
			setupColumnResize();
			if (options.enableColumnReorder) {
				setupColumnReorder();
			}
		}

		function setupColumnSort() {
			$headers.click(function (e) {
				// temporary workaround for a bug in jQuery 1.7.1 (http://bugs.jquery.com/ticket/11328)
				e.metaKey = e.metaKey || e.ctrlKey;

				if ($(e.target).hasClass("slick-resizable-handle")) {
					return;
				}

				var $col = $(e.target).closest(".slick-header-column");
				if (!$col.length) {
					return;
				}

				var column = $col.data("column");
				if (column.sortable) {
					if (!getEditorLock().commitCurrentEdit()) {
						return;
					}

					var sortOpts = null;
					var i = 0;
					for (; i < sortColumns.length; i++) {
						if (sortColumns[i].columnId == column.id) {
							sortOpts = sortColumns[i];
							sortOpts.sortAsc = !sortOpts.sortAsc;
							break;
						}
					}

					if (e.metaKey && options.multiColumnSort) {
						if (sortOpts) {
							sortColumns.splice(i, 1);
						}
					}
					else {
						if ((!e.shiftKey && !e.metaKey) || !options.multiColumnSort) {
							sortColumns = [];
						}

						if (!sortOpts) {
							sortOpts = { columnId: column.id, sortAsc: column.defaultSortAsc };
							sortColumns.push(sortOpts);
						} else if (sortColumns.length == 0) {
							sortColumns.push(sortOpts);
						}
					}

					setSortColumns(sortColumns);

					if (!options.multiColumnSort) {
						trigger(self.onSort, {
							multiColumnSort: false,
							sortCol: column,
							sortAsc: sortOpts.sortAsc
						}, e);
					} else {
						trigger(self.onSort, {
							multiColumnSort: true,
							sortCols: $.map(sortColumns, function (col) {
								return { sortCol: columns[getColumnIndex(col.columnId)], sortAsc: col.sortAsc };
							})
						}, e);
					}
				}
			});
		}

		function setupColumnReorder() {
			$headers.filter(":ui-sortable").sortable("destroy");
			$headers.sortable({
				containment: "parent",
				axis: "x",
				cursor: "default",
				tolerance: "intersection",
				helper: "clone",
				placeholder: "slick-sortable-placeholder ui-state-default slick-header-column",
				forcePlaceholderSize: true,
				start: function (e, ui) {
					$(ui.helper).addClass("slick-header-column-active");
				},
				beforeStop: function (e, ui) {
					$(ui.helper).removeClass("slick-header-column-active");
				},
				stop: function (e) {
					if (!getEditorLock().commitCurrentEdit()) {
						$(this).sortable("cancel");
						return;
					}

					var reorderedIds = $headers.sortable("toArray");
					var reorderedColumns = [];
					for (var i = 0; i < reorderedIds.length; i++) {
						reorderedColumns.push(columns[getColumnIndex(reorderedIds[i].replace(uid, ""))]);
					}
					setColumns(reorderedColumns);

					trigger(self.onColumnsReordered, {});
					e.stopPropagation();
					setupColumnResize();
				}
			});
		}

		function setupColumnResize() {
			var $col, j, c, pageX, columnElements, minPageX, maxPageX, firstResizable, lastResizable;
			columnElements = $headers.children();
			columnElements.find(".slick-resizable-handle").remove();
			columnElements.each(function (i, e) {
				if (columns[i].resizable) {
					if (firstResizable === undefined) {
						firstResizable = i;
					}
					lastResizable = i;
				}
			});
			if (firstResizable === undefined) {
				return;
			}
			columnElements.each(function (i, e) {
				if (i < firstResizable || (options.forceFitColumns && i >= lastResizable)) {
					return;
				}
				$col = $(e);
				$("<div class='slick-resizable-handle' />")
						.appendTo(e)
						.bind("dragstart", function (e, dd) {
							if (!getEditorLock().commitCurrentEdit()) {
								return false;
							}
							pageX = e.pageX;
							$(this).parent().addClass("slick-header-column-active");
							var shrinkLeewayOnRight = null, stretchLeewayOnRight = null;
							// lock each column's width option to current width
							columnElements.each(function (i, e) {
								columns[i].previousWidth = $(e).outerWidth();
							});
							if (options.forceFitColumns) {
								shrinkLeewayOnRight = 0;
								stretchLeewayOnRight = 0;
								// colums on right affect maxPageX/minPageX
								for (j = i + 1; j < columnElements.length; j++) {
									c = columns[j];
									if (c.resizable) {
										if (stretchLeewayOnRight !== null) {
											if (c.maxWidth) {
												stretchLeewayOnRight += c.maxWidth - c.previousWidth;
											} else {
												stretchLeewayOnRight = null;
											}
										}
										shrinkLeewayOnRight += c.previousWidth - Math.max(c.minWidth || 0, absoluteColumnMinWidth);
									}
								}
							}
							var shrinkLeewayOnLeft = 0, stretchLeewayOnLeft = 0;
							for (j = 0; j <= i; j++) {
								// columns on left only affect minPageX
								c = columns[j];
								if (c.resizable) {
									if (stretchLeewayOnLeft !== null) {
										if (c.maxWidth) {
											stretchLeewayOnLeft += c.maxWidth - c.previousWidth;
										} else {
											stretchLeewayOnLeft = null;
										}
									}
									shrinkLeewayOnLeft += c.previousWidth - Math.max(c.minWidth || 0, absoluteColumnMinWidth);
								}
							}
							if (shrinkLeewayOnRight === null) {
								shrinkLeewayOnRight = 100000;
							}
							if (shrinkLeewayOnLeft === null) {
								shrinkLeewayOnLeft = 100000;
							}
							if (stretchLeewayOnRight === null) {
								stretchLeewayOnRight = 100000;
							}
							if (stretchLeewayOnLeft === null) {
								stretchLeewayOnLeft = 100000;
							}
							maxPageX = pageX + Math.min(shrinkLeewayOnRight, stretchLeewayOnLeft);
							minPageX = pageX - Math.min(shrinkLeewayOnLeft, stretchLeewayOnRight);
						})
						.bind("drag", function (e, dd) {
							var actualMinWidth, d = Math.min(maxPageX, Math.max(minPageX, e.pageX)) - pageX, x;
							if (d < 0) { // shrink column
								x = d;
								for (j = i; j >= 0; j--) {
									c = columns[j];
									if (c.resizable) {
										actualMinWidth = Math.max(c.minWidth || 0, absoluteColumnMinWidth);
										if (x && c.previousWidth + x < actualMinWidth) {
											x += c.previousWidth - actualMinWidth;
											c.width = actualMinWidth;
										} else {
											c.width = c.previousWidth + x;
											x = 0;
										}
									}
								}

								if (options.forceFitColumns) {
									x = -d;
									for (j = i + 1; j < columnElements.length; j++) {
										c = columns[j];
										if (c.resizable) {
											if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
												x -= c.maxWidth - c.previousWidth;
												c.width = c.maxWidth;
											} else {
												c.width = c.previousWidth + x;
												x = 0;
											}
										}
									}
								}
							} else { // stretch column
								x = d;
								for (j = i; j >= 0; j--) {
									c = columns[j];
									if (c.resizable) {
										if (x && c.maxWidth && (c.maxWidth - c.previousWidth < x)) {
											x -= c.maxWidth - c.previousWidth;
											c.width = c.maxWidth;
										} else {
											c.width = c.previousWidth + x;
											x = 0;
										}
									}
								}

								if (options.forceFitColumns) {
									x = -d;
									for (j = i + 1; j < columnElements.length; j++) {
										c = columns[j];
										if (c.resizable) {
											actualMinWidth = Math.max(c.minWidth || 0, absoluteColumnMinWidth);
											if (x && c.previousWidth + x < actualMinWidth) {
												x += c.previousWidth - actualMinWidth;
												c.width = actualMinWidth;
											} else {
												c.width = c.previousWidth + x;
												x = 0;
											}
										}
									}
								}
							}
							applyColumnHeaderWidths();
							if (options.syncColumnCellResize) {
								applyColumnWidths();
							}
						})
						.bind("dragend", function (e, dd) {
							var newWidth;
							$(this).parent().removeClass("slick-header-column-active");
							for (j = 0; j < columnElements.length; j++) {
								c = columns[j];
								newWidth = $(columnElements[j]).outerWidth();

								if (c.previousWidth !== newWidth && c.rerenderOnResize) {
									invalidateAllRows();
								}
							}
							updateCanvasWidth(true);
							render();
							trigger(self.onColumnsResized, {});
						});
			});
		}

		function getVBoxDelta($el) {
			var p = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"];
			var delta = 0;
			$.each(p, function (n, val) {
				delta += parseFloat($el.css(val)) || 0;
			});
			return delta;
		}

		function measureCellPaddingAndBorder() {
			var el;
			var h = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"];
			var v = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"];

			el = $("<div class='ui-state-default slick-header-column' style='visibility:hidden'>-</div>").appendTo($headers);
			headerColumnWidthDiff = headerColumnHeightDiff = 0;
			$.each(h, function (n, val) {
				headerColumnWidthDiff += parseFloat(el.css(val)) || 0;
			});
			$.each(v, function (n, val) {
				headerColumnHeightDiff += parseFloat(el.css(val)) || 0;
			});
			el.remove();

			var r = $("<div class='slick-row' />").appendTo($canvas);
			el = $("<div class='slick-cell' id='' style='visibility:hidden'>-</div>").appendTo(r);
			cellWidthDiff = cellHeightDiff = 0;
			$.each(h, function (n, val) {
				cellWidthDiff += parseFloat(el.css(val)) || 0;
			});
			$.each(v, function (n, val) {
				cellHeightDiff += parseFloat(el.css(val)) || 0;
			});
			r.remove();

			absoluteColumnMinWidth = Math.max(headerColumnWidthDiff, cellWidthDiff);
		}

		function createCssRules() {
			$style = $("<style type='text/css' rel='stylesheet' />").appendTo($("head"));
			var rowHeight = (options.rowHeight - cellHeightDiff);
			var rules = [
				"." + uid + " .slick-header-column { left: 1000px; height:" + options.headerRowHeight + "px; }",
				"." + uid + " .slick-top-panel { height:" + options.topPanelHeight + "px; }",
				"." + uid + " .slick-cell { height:" + rowHeight + "px; }",
				"." + uid + " .slick-row { height:" + options.rowHeight + "px; }"
			];

			for (var i = 0; i < columns.length; i++) {
				rules.push("." + uid + " .l" + i + " { }");
				rules.push("." + uid + " .r" + i + " { }");
			}

			if ($style[0].styleSheet) { // IE
				$style[0].styleSheet.cssText = rules.join(" ");
			} else {
				$style[0].appendChild(document.createTextNode(rules.join(" ")));
			}
		}


		function getColumnCssRules(idx) {
			if (!stylesheet) {
				var sheets = document.styleSheets;
				for (var i = 0; i < sheets.length; i++) {
					if ((sheets[i].ownerNode || sheets[i].owningElement) == $style[0]) {
						stylesheet = sheets[i];
						break;
					}
				}

				if (!stylesheet) {
					throw new Error("Cannot find stylesheet.");
				}

				// find and cache column CSS rules
				columnCssRulesL = [];
				columnCssRulesR = [];
				var cssRules = (stylesheet.cssRules || stylesheet.rules);
				var matches, columnIdx;
				for (var i = 0; i < cssRules.length; i++) {
					var selector = cssRules[i].selectorText;
					if (matches = /\.l\d+/.exec(selector)) {
						columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
						columnCssRulesL[columnIdx] = cssRules[i];
					} else if (matches = /\.r\d+/.exec(selector)) {
						columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
						columnCssRulesR[columnIdx] = cssRules[i];
					}
				}
			}

			return {
				"left": columnCssRulesL[idx],
				"right": columnCssRulesR[idx]
			};
		}


		function removeCssRules() {
			$style.remove();
			stylesheet = null;
		}

		function destroy() {
			getEditorLock().cancelCurrentEdit();

			trigger(self.onBeforeDestroy, {});

			var i = plugins.length;
			while (i--) {
				unregisterPlugin(plugins[i]);
			}

			if (options.enableColumnReorder && $headers.sortable) {
				$headers.sortable("destroy");
			}

			unbindAncestorScrollEvents();
			$container.unbind(".slickgrid");
			removeCssRules();

			$canvas.unbind("draginit dragstart dragend drag");
			$container.empty().removeClass(uid);
		}


		//////////////////////////////////////////////////////////////////////////////////////////////
		// General

		function trigger(evt, args, e) {
			e = e || new Slick.EventData();
			args = args || {};
			args.grid = self;
			return evt.notify(args, e, self);
		}

		function getEditorLock() {
			return options.editorLock;
		}

		function getEditController() {
			return editController;
		}

		function getColumnIndex(id) {
			return columnsById[id];
		}

		function autosizeColumns() {
			var i, c,
					widths = [],
					shrinkLeeway = 0,
					total = 0,
					prevTotal,
					availWidth = viewportHasVScroll ? viewportW - scrollbarDimensions.width : viewportW;

			for (i = 0; i < columns.length; i++) {
				c = columns[i];
				widths.push(c.width);
				total += c.width;
				if (c.resizable) {
					shrinkLeeway += c.width - Math.max(c.minWidth, absoluteColumnMinWidth);
				}
			}

			// shrink
			prevTotal = total;
			while (total > availWidth && shrinkLeeway) {
				var shrinkProportion = (total - availWidth) / shrinkLeeway;
				for (i = 0; i < columns.length && total > availWidth; i++) {
					c = columns[i];
					var width = widths[i];
					if (!c.resizable || width <= c.minWidth || width <= absoluteColumnMinWidth) {
						continue;
					}
					var absMinWidth = Math.max(c.minWidth, absoluteColumnMinWidth);
					var shrinkSize = Math.floor(shrinkProportion * (width - absMinWidth)) || 1;
					shrinkSize = Math.min(shrinkSize, width - absMinWidth);
					total -= shrinkSize;
					shrinkLeeway -= shrinkSize;
					widths[i] -= shrinkSize;
				}
				if (prevTotal == total) {  // avoid infinite loop
					break;
				}
				prevTotal = total;
			}

			// grow
			prevTotal = total;
			while (total < availWidth) {
				var growProportion = availWidth / total;
				for (i = 0; i < columns.length && total < availWidth; i++) {
					c = columns[i];
					if (!c.resizable || c.maxWidth <= c.width) {
						continue;
					}
					var growSize = Math.min(Math.floor(growProportion * c.width) - c.width, (c.maxWidth - c.width) || 1000000) || 1;
					total += growSize;
					widths[i] += growSize;
				}
				if (prevTotal == total) {  // avoid infinite loop
					break;
				}
				prevTotal = total;
			}

			var reRender = false;
			for (i = 0; i < columns.length; i++) {
				if (columns[i].rerenderOnResize && columns[i].width != widths[i]) {
					reRender = true;
				}
				columns[i].width = widths[i];
			}

			applyColumnHeaderWidths();
			updateCanvasWidth(true);
			if (reRender) {
				invalidateAllRows();
				render();
			}
		}

		function applyColumnHeaderWidths() {
			if (!initialized) { return; }
			var h;
			for (var i = 0, headers = $headers.children(), ii = headers.length; i < ii; i++) {
				h = $(headers[i]);
				if (h.width() !== columns[i].width - headerColumnWidthDiff) {
					h.width(columns[i].width - headerColumnWidthDiff);
				}
			}

			updateColumnCaches();
		}

		function applyColumnWidths() {
			var x = 0, w, rule;
			for (var i = 0; i < columns.length; i++) {
				w = columns[i].width;

				rule = getColumnCssRules(i);
				rule.left.style.left = x + "px";
				rule.right.style.right = (canvasWidth - x - w) + "px";

				x += columns[i].width;
			}
		}

		function setSortColumn(columnId, ascending) {
			setSortColumns([{ columnId: columnId, sortAsc: ascending}]);
		}

		function setSortColumns(cols) {
			sortColumns = cols;

			var headerColumnEls = $headers.children();
			headerColumnEls
					.removeClass("slick-header-column-sorted")
					.find(".slick-sort-indicator")
							.removeClass("slick-sort-indicator-asc slick-sort-indicator-desc");

			$.each(sortColumns, function (i, col) {
				if (col.sortAsc == null) {
					col.sortAsc = true;
				}
				var columnIndex = getColumnIndex(col.columnId);
				if (columnIndex != null) {
					headerColumnEls.eq(columnIndex)
							.addClass("slick-header-column-sorted")
							.find(".slick-sort-indicator")
									.addClass(col.sortAsc ? "slick-sort-indicator-asc" : "slick-sort-indicator-desc");
				}
			});
		}

		function getSortColumns() {
			return sortColumns;
		}

		function handleSelectedRangesChanged(e, ranges) {
			selectedRows = [];
			var hash = {};
			for (var i = 0; i < ranges.length; i++) {
				for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
					if (!hash[j]) {  // prevent duplicates
						selectedRows.push(j);
						hash[j] = {};
					}
					for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
						if (canCellBeSelected(j, k)) {
							hash[j][columns[k].id] = options.selectedCellCssClass;
						}
					}
				}
			}

			setCellCssStyles(options.selectedCellCssClass, hash);

			trigger(self.onSelectedRowsChanged, { rows: getSelectedRows() }, e);
		}

		function getColumns() {
			return columns;
		}

		function updateColumnCaches() {
			// Pre-calculate cell boundaries.
			columnPosLeft = [];
			columnPosRight = [];
			var x = 0;
			for (var i = 0, ii = columns.length; i < ii; i++) {
				columnPosLeft[i] = x;
				columnPosRight[i] = x + columns[i].width;
				x += columns[i].width;
			}
		}

		function setColumns(columnDefinitions) {
			columns = columnDefinitions;

			columnsById = {};
			for (var i = 0; i < columns.length; i++) {
				var m = columns[i] = $.extend({}, columnDefaults, columns[i]);
				columnsById[m.id] = i;
				if (m.minWidth && m.width < m.minWidth) {
					m.width = m.minWidth;
				}
				if (m.maxWidth && m.width > m.maxWidth) {
					m.width = m.maxWidth;
				}
			}

			updateColumnCaches();

			if (initialized) {
				invalidateAllRows();
				createColumnHeaders();
				removeCssRules();
				createCssRules();
				resizeCanvas();
				applyColumnWidths();
				handleScroll();
			}
		}

		function getOptions() {
			return options;
		}

		function setOptions(args) {
			if (!getEditorLock().commitCurrentEdit()) {
				return;
			}

			makeActiveCellNormal();

			if (options.enableAddRow !== args.enableAddRow) {
				invalidateRow(getDataLength());
			}

			options = $.extend(options, args);
			validateAndEnforceOptions();

			$viewport.css("overflow-y", options.autoHeight ? "hidden" : "auto");
			render();
		}

		function validateAndEnforceOptions() {
			if (options.autoHeight) {
				options.leaveSpaceForNewRows = false;
			}
		}

		function setData(newData, scrollToTop) {
			data = newData;
			invalidateAllRows();
			updateRowCount();
			if (scrollToTop) {
				scrollTo(0);
			}
		}

		function getData() {
			return data;
		}

		function getDataLength() {
			if (data.getLength) {
				return data.getLength();
			} else {
				return data.length;
			}
		}

		function getDataItem(i) {
			if (data.getItem) {
				return data.getItem(i);
			} else {
				return data[i];
			}
		}

		function getTopPanel() {
			return $topPanel[0];
		}

		function setTopPanelVisibility(visible) {
			if (options.showTopPanel != visible) {
				options.showTopPanel = visible;
				if (visible) {
					$topPanelScroller.slideDown("fast", resizeCanvas);
				} else {
					$topPanelScroller.slideUp("fast", resizeCanvas);
				}
			}
		}

		function setHeaderRowVisibility(visible) {
			if (options.showHeaderRow != visible) {
				options.showHeaderRow = visible;
				if (visible) {
					$headerRowScroller.slideDown("fast", resizeCanvas);
				} else {
					$headerRowScroller.slideUp("fast", resizeCanvas);
				}
			}
		}

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Rendering / Scrolling

		function scrollTo(y) {
			y = Math.max(y, 0);
			y = Math.min(y, th - viewportH + (viewportHasHScroll ? scrollbarDimensions.height : 0));

			var oldOffset = offset;

			page = Math.min(n - 1, Math.floor(y / ph));
			offset = Math.round(page * cj);
			var newScrollTop = y - offset;

			if (offset != oldOffset) {
				var range = getVisibleRange(newScrollTop);
				cleanupRows(range);
				updateRowPositions();
			}

			if (prevScrollTop != newScrollTop) {
				vScrollDir = (prevScrollTop + oldOffset < newScrollTop + offset) ? 1 : -1;
				$viewport[0].scrollTop = (lastRenderedScrollTop = scrollTop = prevScrollTop = newScrollTop);

				trigger(self.onViewportChanged, {});
			}
		}

		function defaultFormatter(row, cell, value, columnDef, dataContext) {
			if (value == null) {
				return "";
			} else {
				return value.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			}
		}

		function getFormatter(row, column) {
			var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);

			// look up by id, then index
			var columnOverrides = rowMetadata &&
					rowMetadata.columns &&
					(rowMetadata.columns[column.id] || rowMetadata.columns[getColumnIndex(column.id)]);

			return (columnOverrides && columnOverrides.formatter) ||
					(rowMetadata && rowMetadata.formatter) ||
					column.formatter ||
					(options.formatterFactory && options.formatterFactory.getFormatter(column)) ||
					options.defaultFormatter;
		}

		function getEditor(row, cell) {
			var column = columns[cell];
			var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
			var columnMetadata = rowMetadata && rowMetadata.columns;

			if (columnMetadata && columnMetadata[column.id] && columnMetadata[column.id].editor !== undefined) {
				return columnMetadata[column.id].editor;
			}
			if (columnMetadata && columnMetadata[cell] && columnMetadata[cell].editor !== undefined) {
				return columnMetadata[cell].editor;
			}

			return column.editor || (options.editorFactory && options.editorFactory.getEditor(column));
		}

		function getDataItemValueForColumn(item, columnDef) {
			if (options.dataItemColumnValueExtractor) {
				return options.dataItemColumnValueExtractor(item, columnDef);
			}
			return item[columnDef.field];
		}

		function appendRowHtml(stringArray, row, range) {
			var d = getDataItem(row);
			var dataLoading = row < getDataLength() && !d;
			var rowCss = "slick-row" +
					(dataLoading ? " loading" : "") +
					(row === activeRow ? " active" : "") +
					(row % 2 == 1 ? " odd" : " even");

			var metadata = data.getItemMetadata && data.getItemMetadata(row);

			if (metadata && metadata.cssClasses) {
				rowCss += " " + metadata.cssClasses;
			}

			stringArray.push("<div class='ui-widget-content " + rowCss + "' style='top:" + (options.rowHeight * row - offset) + "px'>");

			var colspan, m;
			for (var i = 0, ii = columns.length; i < ii; i++) {
				m = columns[i];
				colspan = 1;
				if (metadata && metadata.columns) {
					var columnData = metadata.columns[m.id] || metadata.columns[i];
					colspan = (columnData && columnData.colspan) || 1;
					if (colspan === "*") {
						colspan = ii - i;
					}
				}

				// Do not render cells outside of the viewport.
				if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
					if (columnPosLeft[i] > range.rightPx) {
						// All columns to the right are outside the range.
						break;
					}

					appendCellHtml(stringArray, row, i, colspan);
				}

				if (colspan > 1) {
					i += (colspan - 1);
				}
			}

			stringArray.push("</div>");
		}

		function appendCellHtml(stringArray, row, cell, colspan) {
			var m = columns[cell];
			var d = getDataItem(row);
			var cellCss = "slick-cell l" + cell + " r" + Math.min(columns.length - 1, cell + colspan - 1) +
					(m.cssClass ? " " + m.cssClass : "");
			if (row === activeRow && cell === activeCell) {
				cellCss += (" active");
			}

			// TODO:  merge them together in the setter
			for (var key in cellCssClasses) {
				if (cellCssClasses[key][row] && cellCssClasses[key][row][m.id]) {
					cellCss += (" " + cellCssClasses[key][row][m.id]);
				}
			}

			stringArray.push("<div class='" + cellCss + "'>");

			// if there is a corresponding row (if not, this is the Add New row or this data hasn't been loaded yet)
			if (d) {
				var value = getDataItemValueForColumn(d, m);
				stringArray.push(getFormatter(row, m)(row, cell, value, m, d, getOptions().__OthDS));
			}

			stringArray.push("</div>");

			rowsCache[row].cellRenderQueue.push(cell);
			rowsCache[row].cellColSpans[cell] = colspan;
		}


		function cleanupRows(rangeToKeep) {
			for (var i in rowsCache) {
				if (((i = parseInt(i, 10)) !== activeRow) && (i < rangeToKeep.top || i > rangeToKeep.bottom)) {
					removeRowFromCache(i);
				}
			}
		}

		function invalidate() {
			updateRowCount();
			invalidateAllRows();
			render();
		}

		function invalidateAllRows() {
			if (currentEditor) {
				makeActiveCellNormal();
			}
			for (var row in rowsCache) {
				removeRowFromCache(row);
			}
		}

		function removeRowFromCache(row) {
			var cacheEntry = rowsCache[row];
			if (!cacheEntry) {
				return;
			}
			$canvas[0].removeChild(cacheEntry.rowNode);
			delete rowsCache[row];
			delete postProcessedRows[row];
			renderedRows--;
			counter_rows_removed++;
		}

		function invalidateRows(rows) {
			var i, rl;
			if (!rows || !rows.length) {
				return;
			}
			vScrollDir = 0;
			for (i = 0, rl = rows.length; i < rl; i++) {
				if (currentEditor && activeRow === rows[i]) {
					makeActiveCellNormal();
				}
				if (rowsCache[rows[i]]) {
					removeRowFromCache(rows[i]);
				}
			}
		}

		function invalidateRow(row) {
			invalidateRows([row]);
		}

		function updateCell(row, cell) {
			var cellNode = getCellNode(row, cell);
			if (!cellNode) {
				return;
			}

			var m = columns[cell], d = getDataItem(row);
			if (currentEditor && activeRow === row && activeCell === cell) {
				currentEditor.loadValue(d);
			} else {
				cellNode.innerHTML = d ? getFormatter(row, m)(row, cell, getDataItemValueForColumn(d, m), m, d, getOptions().__OthDS) : "";
				invalidatePostProcessingResults(row);
			}
		}

		function updateRow(row) {
			var cacheEntry = rowsCache[row];
			if (!cacheEntry) {
				return;
			}

			ensureCellNodesInRowsCache(row);

			for (var columnIdx in cacheEntry.cellNodesByColumnIdx) {
				if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
					continue;
				}

				columnIdx = columnIdx | 0;
				var m = columns[columnIdx],
						d = getDataItem(row),
						node = cacheEntry.cellNodesByColumnIdx[columnIdx];

				if (row === activeRow && columnIdx === activeCell && currentEditor) {
					currentEditor.loadValue(d);
				} else if (d) {
					node.innerHTML = getFormatter(row, m)(row, columnIdx, getDataItemValueForColumn(d, m), m, d, getOptions().__OthDS);
				} else {
					node.innerHTML = "";
				}
			}

			invalidatePostProcessingResults(row);
		}

		function getViewportHeight() {
			return parseFloat($.css($container[0], "height", true)) -
					parseFloat($.css($container[0], "paddingTop", true)) -
					parseFloat($.css($container[0], "paddingBottom", true)) -
					parseFloat($.css($headerScroller[0], "height")) - getVBoxDelta($headerScroller) -
					(options.showTopPanel ? options.topPanelHeight + getVBoxDelta($topPanelScroller) : 0) -
					(options.showHeaderRow ? options.headerRowHeight + getVBoxDelta($headerRowScroller) : 0);
		}

		function resizeCanvas() {
			if (!initialized) { return; }
			if (options.autoHeight) {
				viewportH = options.rowHeight * (getDataLength() + (options.enableAddRow ? 1 : 0));
			} else {
				viewportH = getViewportHeight();
			}

			numVisibleRows = Math.ceil(viewportH / options.rowHeight);
			viewportW = parseFloat($.css($container[0], "width", true));
			if (!options.autoHeight) {
				$viewport.height(viewportH);
			}

			if (options.forceFitColumns) {
				autosizeColumns();
			} else { //Paul: change added to fix resize col header/data mismatch
				applyColumnHeaderWidths();
				updateCanvasWidth(true);
			}

			updateRowCount();
			handleScroll();
			render();
		}

		function updateRowCount() {
			if (!initialized) { return; }
			numberOfRows = getDataLength() +
					(options.enableAddRow ? 1 : 0) +
					(options.leaveSpaceForNewRows ? numVisibleRows - 1 : 0);

			var oldViewportHasVScroll = viewportHasVScroll;
			// with autoHeight, we do not need to accommodate the vertical scroll bar
			viewportHasVScroll = !options.autoHeight && (numberOfRows * options.rowHeight > viewportH);

			// remove the rows that are now outside of the data range
			// this helps avoid redundant calls to .removeRow() when the size of the data decreased by thousands of rows
			var l = options.enableAddRow ? getDataLength() : getDataLength() - 1;
			for (var i in rowsCache) {
				if (i >= l) {
					removeRowFromCache(i);
				}
			}

			if (activeCellNode && activeRow > l) {
				resetActiveCell();
			}

			var oldH = h;
			th = Math.max(options.rowHeight * numberOfRows, viewportH - scrollbarDimensions.height);
			if (th < maxSupportedCssHeight) {
				// just one page
				h = ph = th;
				n = 1;
				cj = 0;
			} else {
				// break into pages
				h = maxSupportedCssHeight;
				ph = h / 100;
				n = Math.floor(th / ph);
				cj = (th - h) / (n - 1);
			}

			if (h !== oldH) {
				$canvas.css("height", h);
				scrollTop = $viewport[0].scrollTop;
			}

			var oldScrollTopInRange = (scrollTop + offset <= th - viewportH);

			if (th == 0 || scrollTop == 0) {
				page = offset = 0;
			} else if (oldScrollTopInRange) {
				// maintain virtual position
				scrollTo(scrollTop + offset);
			} else {
				// scroll to bottom
				scrollTo(th - viewportH);
			}

			if (h != oldH && options.autoHeight) {
				resizeCanvas();
			}

			if (options.forceFitColumns && oldViewportHasVScroll != viewportHasVScroll) {
				autosizeColumns();
			}
			updateCanvasWidth(false);
		}

		function getVisibleRange(viewportTop, viewportLeft) {
			if (viewportTop == null) {
				viewportTop = scrollTop;
			}
			if (viewportLeft == null) {
				viewportLeft = scrollLeft;
			}

			return {
				top: Math.floor((viewportTop + offset) / options.rowHeight),
				bottom: Math.ceil((viewportTop + offset + viewportH) / options.rowHeight),
				leftPx: viewportLeft,
				rightPx: viewportLeft + viewportW
			};
		}

		function getRenderedRange(viewportTop, viewportLeft) {
			var range = getVisibleRange(viewportTop, viewportLeft);
			var buffer = Math.round(viewportH / options.rowHeight);
			var minBuffer = 3;

			if (vScrollDir == -1) {
				range.top -= buffer;
				range.bottom += minBuffer;
			} else if (vScrollDir == 1) {
				range.top -= minBuffer;
				range.bottom += buffer;
			} else {
				range.top -= minBuffer;
				range.bottom += minBuffer;
			}

			range.top = Math.max(0, range.top);
			range.bottom = Math.min(options.enableAddRow ? getDataLength() : getDataLength() - 1, range.bottom);

			range.leftPx -= viewportW;
			range.rightPx += viewportW;

			range.leftPx = Math.max(0, range.leftPx);
			range.rightPx = Math.min(canvasWidth, range.rightPx);

			return range;
		}

		function ensureCellNodesInRowsCache(row) {
			var cacheEntry = rowsCache[row];
			if (cacheEntry) {
				if (cacheEntry.cellRenderQueue.length) {
					var lastChild = cacheEntry.rowNode.lastChild;
					while (cacheEntry.cellRenderQueue.length) {
						var columnIdx = cacheEntry.cellRenderQueue.pop();
						cacheEntry.cellNodesByColumnIdx[columnIdx] = lastChild;
						lastChild = lastChild.previousSibling;
					}
				}
			}
		}

		function cleanUpCells(range, row) {
			var totalCellsRemoved = 0;
			var cacheEntry = rowsCache[row];

			// Remove cells outside the range.
			var cellsToRemove = [];
			for (var i in cacheEntry.cellNodesByColumnIdx) {
				// I really hate it when people mess with Array.prototype.
				if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(i)) {
					continue;
				}

				// This is a string, so it needs to be cast back to a number.
				i = i | 0;

				var colspan = cacheEntry.cellColSpans[i];
				if (columnPosLeft[i] > range.rightPx ||
					columnPosRight[Math.min(columns.length - 1, i + colspan - 1)] < range.leftPx) {
					if (!(row == activeRow && i == activeCell)) {
						cellsToRemove.push(i);
					}
				}
			}

			var cellToRemove;
			while ((cellToRemove = cellsToRemove.pop()) != null) {
				cacheEntry.rowNode.removeChild(cacheEntry.cellNodesByColumnIdx[cellToRemove]);
				delete cacheEntry.cellColSpans[cellToRemove];
				delete cacheEntry.cellNodesByColumnIdx[cellToRemove];
				if (postProcessedRows[row]) {
					delete postProcessedRows[row][cellToRemove];
				}
				totalCellsRemoved++;
			}
		}

		function cleanUpAndRenderCells(range) {
			var cacheEntry;
			var stringArray = [];
			var processedRows = [];
			var cellsAdded;
			var totalCellsAdded = 0;
			var colspan;

			for (var row = range.top; row <= range.bottom; row++) {
				cacheEntry = rowsCache[row];
				if (!cacheEntry) {
					continue;
				}

				// cellRenderQueue populated in renderRows() needs to be cleared first
				ensureCellNodesInRowsCache(row);

				cleanUpCells(range, row);

				// Render missing cells.
				cellsAdded = 0;

				var metadata = data.getItemMetadata && data.getItemMetadata(row);
				metadata = metadata && metadata.columns;

				// TODO:  shorten this loop (index? heuristics? binary search?)
				for (var i = 0, ii = columns.length; i < ii; i++) {
					// Cells to the right are outside the range.
					if (columnPosLeft[i] > range.rightPx) {
						break;
					}

					// Already rendered.
					if ((colspan = cacheEntry.cellColSpans[i]) != null) {
						i += (colspan > 1 ? colspan - 1 : 0);
						continue;
					}

					colspan = 1;
					if (metadata) {
						var columnData = metadata[columns[i].id] || metadata[i];
						colspan = (columnData && columnData.colspan) || 1;
						if (colspan === "*") {
							colspan = ii - i;
						}
					}

					if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
						appendCellHtml(stringArray, row, i, colspan);
						cellsAdded++;
					}

					i += (colspan > 1 ? colspan - 1 : 0);
				}

				if (cellsAdded) {
					totalCellsAdded += cellsAdded;
					processedRows.push(row);
				}
			}

			if (!stringArray.length) {
				return;
			}

			var x = document.createElement("div");
			x.innerHTML = stringArray.join("");

			var processedRow;
			var node;
			while ((processedRow = processedRows.pop()) != null) {
				cacheEntry = rowsCache[processedRow];
				var columnIdx;
				while ((columnIdx = cacheEntry.cellRenderQueue.pop()) != null) {
					node = x.lastChild;
					cacheEntry.rowNode.appendChild(node);
					cacheEntry.cellNodesByColumnIdx[columnIdx] = node;
				}
			}
		}

		function renderRows(range) {
			var parentNode = $canvas[0],
					stringArray = [],
					rows = [],
					needToReselectCell = false;

			for (var i = range.top; i <= range.bottom; i++) {
				if (rowsCache[i]) {
					continue;
				}
				renderedRows++;
				rows.push(i);

				// Create an entry right away so that appendRowHtml() can
				// start populatating it.
				rowsCache[i] = {
					"rowNode": null,

					// ColSpans of rendered cells (by column idx).
					// Can also be used for checking whether a cell has been rendered.
					"cellColSpans": [],

					// Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
					"cellNodesByColumnIdx": [],

					// Column indices of cell nodes that have been rendered, but not yet indexed in
					// cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
					// end of the row.
					"cellRenderQueue": []
				};

				appendRowHtml(stringArray, i, range);
				if (activeCellNode && activeRow === i) {
					needToReselectCell = true;
				}
				counter_rows_rendered++;
			}

			if (!rows.length) { return; }

			var x = document.createElement("div");
			x.innerHTML = stringArray.join("");

			for (var i = 0, ii = rows.length; i < ii; i++) {
				rowsCache[rows[i]].rowNode = parentNode.appendChild(x.firstChild);
			}

			if (needToReselectCell) {
				activeCellNode = getCellNode(activeRow, activeCell);
			}
		}

		function startPostProcessing() {
			if (!options.enableAsyncPostRender) {
				return;
			}
			clearTimeout(h_postrender);
			h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
		}

		function invalidatePostProcessingResults(row) {
			delete postProcessedRows[row];
			postProcessFromRow = Math.min(postProcessFromRow, row);
			postProcessToRow = Math.max(postProcessToRow, row);
			startPostProcessing();
		}

		function updateRowPositions() {
			for (var row in rowsCache) {
				rowsCache[row].rowNode.style.top = (row * options.rowHeight - offset) + "px";
			}
		}

		function render() {
			if (!initialized) { return; }
			var visible = getVisibleRange();
			var rendered = getRenderedRange();

			// remove rows no longer in the viewport
			cleanupRows(rendered);

			// add new rows & missing cells in existing rows
			if (lastRenderedScrollLeft != scrollLeft) {
				cleanUpAndRenderCells(rendered);
			}

			// render missing rows
			renderRows(rendered);

			postProcessFromRow = visible.top;
			postProcessToRow = Math.min(options.enableAddRow ? getDataLength() : getDataLength() - 1, visible.bottom);
			startPostProcessing();

			lastRenderedScrollTop = scrollTop;
			lastRenderedScrollLeft = scrollLeft;
			h_render = null;
		}

		function handleHeaderRowScroll() {
			var scrollLeft = $headerRowScroller[0].scrollLeft;
			if (scrollLeft != $viewport[0].scrollLeft) {
				$viewport[0].scrollLeft = scrollLeft;
			}
		}

		function handleScroll() {
			scrollTop = $viewport[0].scrollTop;
			scrollLeft = $viewport[0].scrollLeft;
			var vScrollDist = Math.abs(scrollTop - prevScrollTop);
			var hScrollDist = Math.abs(scrollLeft - prevScrollLeft);

			if (hScrollDist) {
				prevScrollLeft = scrollLeft;
				$headerScroller[0].scrollLeft = scrollLeft;
				$topPanelScroller[0].scrollLeft = scrollLeft;
				$headerRowScroller[0].scrollLeft = scrollLeft;
			}

			if (vScrollDist) {
				vScrollDir = prevScrollTop < scrollTop ? 1 : -1;
				prevScrollTop = scrollTop;

				// switch virtual pages if needed
				if (vScrollDist < viewportH) {
					scrollTo(scrollTop + offset);
				} else {
					var oldOffset = offset;
					if (h == viewportH) {
						page = 0;
					} else {
						page = Math.min(n - 1, Math.floor(scrollTop * ((th - viewportH) / (h - viewportH)) * (1 / ph)));
					}
					offset = Math.round(page * cj);
					if (oldOffset != offset) {
						invalidateAllRows();
					}
				}
			}

			if (hScrollDist || vScrollDist) {
				if (h_render) {
					clearTimeout(h_render);
				}

				if (Math.abs(lastRenderedScrollTop - scrollTop) > 20 ||
						Math.abs(lastRenderedScrollLeft - scrollLeft) > 20) {
					if (options.forceSyncScrolling || (
							Math.abs(lastRenderedScrollTop - scrollTop) < viewportH &&
							Math.abs(lastRenderedScrollLeft - scrollLeft) < viewportW)) {
						render();
					} else {
						h_render = setTimeout(render, 50);
					}

					trigger(self.onViewportChanged, {});
				}
			}

			trigger(self.onScroll, { scrollLeft: scrollLeft, scrollTop: scrollTop });
		}

		function asyncPostProcessRows() {
			while (postProcessFromRow <= postProcessToRow) {
				var row = (vScrollDir >= 0) ? postProcessFromRow++ : postProcessToRow--;
				var cacheEntry = rowsCache[row];
				if (!cacheEntry || row >= getDataLength()) {
					continue;
				}

				if (!postProcessedRows[row]) {
					postProcessedRows[row] = {};
				}

				ensureCellNodesInRowsCache(row);
				for (var columnIdx in cacheEntry.cellNodesByColumnIdx) {
					if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
						continue;
					}

					columnIdx = columnIdx | 0;

					var m = columns[columnIdx];
					if (m.asyncPostRender && !postProcessedRows[row][columnIdx]) {
						var node = cacheEntry.cellNodesByColumnIdx[columnIdx];
						if (node) {
							m.asyncPostRender(node, row, getDataItem(row), m);
						}
						postProcessedRows[row][columnIdx] = true;
					}
				}

				h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
				return;
			}
		}

		function updateCellCssStylesOnRenderedRows(addedHash, removedHash) {
			var node, columnId, addedRowHash, removedRowHash;
			for (var row in rowsCache) {
				removedRowHash = removedHash && removedHash[row];
				addedRowHash = addedHash && addedHash[row];

				if (removedRowHash) {
					for (columnId in removedRowHash) {
						if (!addedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
							node = getCellNode(row, getColumnIndex(columnId));
							if (node) {
								$(node).removeClass(removedRowHash[columnId]);
							}
						}
					}
				}

				if (addedRowHash) {
					for (columnId in addedRowHash) {
						if (!removedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
							node = getCellNode(row, getColumnIndex(columnId));
							if (node) {
								$(node).addClass(addedRowHash[columnId]);
							}
						}
					}
				}
			}
		}

		function addCellCssStyles(key, hash) {
			if (cellCssClasses[key]) {
				throw "addCellCssStyles: cell CSS hash with key '" + key + "' already exists.";
			}

			cellCssClasses[key] = hash;
			updateCellCssStylesOnRenderedRows(hash, null);

			trigger(self.onCellCssStylesChanged, { "key": key, "hash": hash });
		}

		function removeCellCssStyles(key) {
			if (!cellCssClasses[key]) {
				return;
			}

			updateCellCssStylesOnRenderedRows(null, cellCssClasses[key]);
			delete cellCssClasses[key];

			trigger(self.onCellCssStylesChanged, { "key": key, "hash": null });
		}

		function setCellCssStyles(key, hash) {
			var prevHash = cellCssClasses[key];

			cellCssClasses[key] = hash;
			updateCellCssStylesOnRenderedRows(hash, prevHash);

			trigger(self.onCellCssStylesChanged, { "key": key, "hash": hash });
		}

		function getCellCssStyles(key) {
			return cellCssClasses[key];
		}

		function flashCell(row, cell, speed) {
			speed = speed || 100;
			if (rowsCache[row]) {
				var $cell = $(getCellNode(row, cell));

				function toggleCellClass(times) {
					if (!times) {
						return;
					}
					setTimeout(function () {
						$cell.queue(function () {
							$cell.toggleClass(options.cellFlashingCssClass).dequeue();
							toggleCellClass(times - 1);
						});
					},
							speed);
				}

				toggleCellClass(4);
			}
		}

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Interactivity

		function handleDragInit(e, dd) {
			var cell = getCellFromEvent(e);
			if (!cell || !cellExists(cell.row, cell.cell)) {
				return false;
			}

			retval = trigger(self.onDragInit, dd, e);
			if (e.isImmediatePropagationStopped()) {
				return retval;
			}

			// if nobody claims to be handling drag'n'drop by stopping immediate propagation,
			// cancel out of it
			return false;
		}

		function handleDragStart(e, dd) {
			var cell = getCellFromEvent(e);
			if (!cell || !cellExists(cell.row, cell.cell)) {
				return false;
			}

			var retval = trigger(self.onDragStart, dd, e);
			if (e.isImmediatePropagationStopped()) {
				return retval;
			}

			return false;
		}

		function handleDrag(e, dd) {
			return trigger(self.onDrag, dd, e);
		}

		function handleDragEnd(e, dd) {
			trigger(self.onDragEnd, dd, e);
		}

		function handleKeyDown(e) {
			trigger(self.onKeyDown, { row: activeRow, cell: activeCell }, e);
			var handled = e.isImmediatePropagationStopped();

			if (!handled) {
				if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
					if (e.which == 27) {
						if (!getEditorLock().isActive()) {
							return; // no editing mode to cancel, allow bubbling and default processing (exit without cancelling the event)
						}
						cancelEditAndSetFocus();
					} else if (e.which == 37) {
						handled = navigateLeft();
					} else if (e.which == 39) {
						handled = navigateRight();
					} else if (e.which == 38) {
						handled = navigateUp();
					} else if (e.which == 40) {
						handled = navigateDown();
					} else if (e.which == 9) {
						handled = navigateNext();
					} else if (e.which == 13) {
						if (options.editable) {
							if (currentEditor) {
								// adding new row
								if (activeRow === getDataLength()) {
									navigateDown();
								} else {
									commitEditAndSetFocus();
								}
							} else {
								if (getEditorLock().commitCurrentEdit()) {
									makeActiveCellEditable();
								}
							}
						}
						handled = true;
					}
				} else if (e.which == 9 && e.shiftKey && !e.ctrlKey && !e.altKey) {
					handled = navigatePrev();
				}
			}

			if (handled) {
				// the event has been handled so don't let parent element (bubbling/propagation) or browser (default) handle it
				e.stopPropagation();
				e.preventDefault();
				try {
					e.originalEvent.keyCode = 0; // prevent default behaviour for special keys in IE browsers (F3, F5, etc.)
				}
				// ignore exceptions - setting the original event's keycode throws access denied exception for "Ctrl"
				// (hitting control key only, nothing else), "Shift" (maybe others)
				catch (error) {
				}
			}
		}

		function handleClick(e) {
			if (!currentEditor) {
				// if this click resulted in some cell child node getting focus,
				// don't steal it back - keyboard events will still bubble up
				if (e.target != document.activeElement) {
					setFocus();
				}
			}

			var cell = getCellFromEvent(e);
			if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
				return;
			}

			trigger(self.onClick, { row: cell.row, cell: cell.cell }, e);
			if (e.isImmediatePropagationStopped()) {
				return;
			}

			if ((activeCell != cell.cell || activeRow != cell.row) && canCellBeActive(cell.row, cell.cell)) {
				if (!getEditorLock().isActive() || getEditorLock().commitCurrentEdit()) {
					scrollRowIntoView(cell.row, false);
					setActiveCellInternal(getCellNode(cell.row, cell.cell), (cell.row === getDataLength()) || options.autoEdit);
				}
			}
		}

		function handleContextMenu(e) {
			var $cell = $(e.target).closest(".slick-cell", $canvas);
			if ($cell.length === 0) {
				return;
			}

			// are we editing this cell?
			if (activeCellNode === $cell[0] && currentEditor !== null) {
				return;
			}

			trigger(self.onContextMenu, {}, e);
		}

		function handleDblClick(e) {
			var cell = getCellFromEvent(e);
			if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
				return;
			}

			trigger(self.onDblClick, { row: cell.row, cell: cell.cell }, e);
			if (e.isImmediatePropagationStopped()) {
				return;
			}

			if (options.editable) {
				gotoCell(cell.row, cell.cell, true);
			}
		}

		function handleHeaderMouseEnter(e) {
			trigger(self.onHeaderMouseEnter, {
				"column": $(this).data("column")
			}, e);
		}

		function handleHeaderMouseLeave(e) {
			trigger(self.onHeaderMouseLeave, {
				"column": $(this).data("column")
			}, e);
		}

		function handleHeaderContextMenu(e) {
			var $header = $(e.target).closest(".slick-header-column", ".slick-header-columns");
			var column = $header && $header.data("column");
			trigger(self.onHeaderContextMenu, { column: column }, e);
		}

		function handleHeaderClick(e) {
			var $header = $(e.target).closest(".slick-header-column", ".slick-header-columns");
			var column = $header && $header.data("column");
			if (column) {
				trigger(self.onHeaderClick, { column: column }, e);
			}
		}

		function handleMouseEnter(e) {
			trigger(self.onMouseEnter, {}, e);
		}

		function handleMouseLeave(e) {
			trigger(self.onMouseLeave, {}, e);
		}

		function cellExists(row, cell) {
			return !(row < 0 || row >= getDataLength() || cell < 0 || cell >= columns.length);
		}

		function getCellFromPoint(x, y) {
			var row = Math.floor((y + offset) / options.rowHeight);
			var cell = 0;

			var w = 0;
			for (var i = 0; i < columns.length && w < x; i++) {
				w += columns[i].width;
				cell++;
			}

			if (cell < 0) {
				cell = 0;
			}

			return { row: row, cell: cell - 1 };
		}

		function getCellFromNode(cellNode) {
			// read column number from .l<columnNumber> CSS class
			var cls = /l\d+/.exec(cellNode.className);
			if (!cls) {
				throw "getCellFromNode: cannot get cell - " + cellNode.className;
			}
			return parseInt(cls[0].substr(1, cls[0].length - 1), 10);
		}

		function getRowFromNode(rowNode) {
			for (var row in rowsCache) {
				if (rowsCache[row].rowNode === rowNode) {
					return row | 0;
				}
			}

			return null;
		}

		function getCellFromEvent(e) {
			var $cell = $(e.target).closest(".slick-cell", $canvas);
			if (!$cell.length) {
				return null;
			}

			var row = getRowFromNode($cell[0].parentNode);
			var cell = getCellFromNode($cell[0]);

			if (row == null || cell == null) {
				return null;
			} else {
				return {
					"row": row,
					"cell": cell
				};
			}
		}

		function getCellNodeBox(row, cell) {
			if (!cellExists(row, cell)) {
				return null;
			}

			var y1 = row * options.rowHeight - offset;
			var y2 = y1 + options.rowHeight - 1;
			var x1 = 0;
			for (var i = 0; i < cell; i++) {
				x1 += columns[i].width;
			}
			var x2 = x1 + columns[cell].width;

			return {
				top: y1,
				left: x1,
				bottom: y2,
				right: x2
			};
		}

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Cell switching

		function resetActiveCell() {
			setActiveCellInternal(null, false);
		}

		function setFocus() {
			if (tabbingDirection == -1) {
				$focusSink[0].focus();
			} else {
				$focusSink2[0].focus();
			}
		}

		function scrollCellIntoView(row, cell) {
			var colspan = getColspan(row, cell);
			var left = columnPosLeft[cell],
				right = columnPosRight[cell + (colspan > 1 ? colspan - 1 : 0)],
				scrollRight = scrollLeft + viewportW;

			if (left < scrollLeft) {
				$viewport.scrollLeft(left);
				handleScroll();
				render();
			} else if (right > scrollRight) {
				$viewport.scrollLeft(Math.min(left, right - $viewport[0].clientWidth));
				handleScroll();
				render();
			}
		}

		function setActiveCellInternal(newCell, editMode) {
			if (activeCellNode !== null) {
				makeActiveCellNormal();
				$(activeCellNode).removeClass("active");
				if (rowsCache[activeRow]) {
					$(rowsCache[activeRow].rowNode).removeClass("active");
				}
			}

			var activeCellChanged = (activeCellNode !== newCell);
			activeCellNode = newCell;

			if (activeCellNode != null) {
				activeRow = getRowFromNode(activeCellNode.parentNode);
				activeCell = activePosX = getCellFromNode(activeCellNode);

				$(activeCellNode).addClass("active");
				$(rowsCache[activeRow].rowNode).addClass("active");

				if (options.editable && editMode && isCellPotentiallyEditable(activeRow, activeCell)) {
					clearTimeout(h_editorLoader);

					if (options.asyncEditorLoading) {
						h_editorLoader = setTimeout(function () {
							makeActiveCellEditable();
						}, options.asyncEditorLoadDelay);
					} else {
						makeActiveCellEditable();
					}
				}
			} else {
				activeRow = activeCell = null;
			}

			if (activeCellChanged) {
				trigger(self.onActiveCellChanged, getActiveCell());
			}
		}

		function clearTextSelection() {
			if (document.selection && document.selection.empty) {
				document.selection.empty();
			} else if (window.getSelection) {
				var sel = window.getSelection();
				if (sel && sel.removeAllRanges) {
					sel.removeAllRanges();
				}
			}
		}

		function isCellPotentiallyEditable(row, cell) {
			// is the data for this row loaded?
			if (row < getDataLength() && !getDataItem(row)) {
				return false;
			}

			// are we in the Add New row?  can we create new from this cell?
			if (columns[cell].cannotTriggerInsert && row >= getDataLength()) {
				return false;
			}

			// does this cell have an editor?
			if (!getEditor(row, cell)) {
				return false;
			}

			return true;
		}

		function makeActiveCellNormal() {
			if (!currentEditor) {
				return;
			}
			trigger(self.onBeforeCellEditorDestroy, { editor: currentEditor });
			currentEditor.destroy();
			currentEditor = null;

			if (activeCellNode) {
				var d = getDataItem(activeRow);
				$(activeCellNode).removeClass("editable invalid");
				if (d) {
					var column = columns[activeCell];
					var formatter = getFormatter(activeRow, column);
					activeCellNode.innerHTML = formatter(activeRow, activeCell, getDataItemValueForColumn(d, column), column, getDataItem(activeRow));
					invalidatePostProcessingResults(activeRow);
				}
			}

			// if there previously was text selected on a page (such as selected text in the edit cell just removed),
			// IE can't set focus to anything else correctly
			if ($.browser.msie) {
				clearTextSelection();
			}

			getEditorLock().deactivate(editController);
		}

		function makeActiveCellEditable(editor) {
			if (!activeCellNode) {
				return;
			}
			if (!options.editable) {
				throw "Grid : makeActiveCellEditable : should never get called when options.editable is false";
			}

			// cancel pending async call if there is one
			clearTimeout(h_editorLoader);

			if (!isCellPotentiallyEditable(activeRow, activeCell)) {
				return;
			}

			var columnDef = columns[activeCell];
			var item = getDataItem(activeRow);

			if (trigger(self.onBeforeEditCell, { row: activeRow, cell: activeCell, item: item, column: columnDef }) === false) {
				setFocus();
				return;
			}

			getEditorLock().activate(editController);
			$(activeCellNode).addClass("editable");

			// don't clear the cell if a custom editor is passed through
			if (!editor) {
				activeCellNode.innerHTML = "";
			}

			currentEditor = new (editor || getEditor(activeRow, activeCell))({
				grid: self,
				gridPosition: absBox($container[0]),
				position: absBox(activeCellNode),
				container: activeCellNode,
				column: columnDef,
				item: item || {},
				commitChanges: commitEditAndSetFocus,
				cancelChanges: cancelEditAndSetFocus
			});

			if (item) {
				currentEditor.loadValue(item);
			}

			serializedEditorValue = currentEditor.serializeValue();

			if (currentEditor.position) {
				handleActiveCellPositionChange();
			}
		}

		function commitEditAndSetFocus(DontMoveDown) {
			// if the commit fails, it would do so due to a validation error
			// if so, do not steal the focus from the editor
			if (getEditorLock().commitCurrentEdit()) {
				setFocus();
				DontMoveDown = (DontMoveDown ? true : false); //Paul: prevent moving down in some editor circumstances (e.g. when clicking save button)
				if ((options.autoEdit) && (!DontMoveDown)) {
					navigateDown();
				}
			}
		}

		function cancelEditAndSetFocus() {
			if (getEditorLock().cancelCurrentEdit()) {
				setFocus();
			}
		}

		function absBox(elem) {
			var box = {
				top: elem.offsetTop,
				left: elem.offsetLeft,
				bottom: 0,
				right: 0,
				width: $(elem).outerWidth(),
				height: $(elem).outerHeight(),
				visible: true
			};
			box.bottom = box.top + box.height;
			box.right = box.left + box.width;

			// walk up the tree
			var offsetParent = elem.offsetParent;
			while ((elem = elem.parentNode) != document.body) {
				if (box.visible && elem.scrollHeight != elem.offsetHeight && $(elem).css("overflowY") != "visible") {
					box.visible = box.bottom > elem.scrollTop && box.top < elem.scrollTop + elem.clientHeight;
				}

				if (box.visible && elem.scrollWidth != elem.offsetWidth && $(elem).css("overflowX") != "visible") {
					box.visible = box.right > elem.scrollLeft && box.left < elem.scrollLeft + elem.clientWidth;
				}

				box.left -= elem.scrollLeft;
				box.top -= elem.scrollTop;

				if (elem === offsetParent) {
					box.left += elem.offsetLeft;
					box.top += elem.offsetTop;
					offsetParent = elem.offsetParent;
				}

				box.bottom = box.top + box.height;
				box.right = box.left + box.width;
			}

			return box;
		}

		function getActiveCellPosition() {
			return absBox(activeCellNode);
		}

		function getGridPosition() {
			return absBox($container[0])
		}

		function handleActiveCellPositionChange() {
			if (!activeCellNode) {
				return;
			}

			trigger(self.onActiveCellPositionChanged, {});

			if (currentEditor) {
				var cellBox = getActiveCellPosition();
				if (currentEditor.show && currentEditor.hide) {
					if (!cellBox.visible) {
						currentEditor.hide();
					} else {
						currentEditor.show();
					}
				}

				if (currentEditor.position) {
					currentEditor.position(cellBox);
				}
			}
		}

		function getCellEditor() {
			return currentEditor;
		}

		function getActiveCell() {
			if (!activeCellNode) {
				return null;
			} else {
				return { row: activeRow, cell: activeCell };
			}
		}

		function getActiveCellNode() {
			return activeCellNode;
		}

		function scrollRowIntoView(row, doPaging) {
			var rowAtTop = row * options.rowHeight;
			var rowAtBottom = (row + 1) * options.rowHeight - viewportH + (viewportHasHScroll ? scrollbarDimensions.height : 0);

			// need to page down?
			if ((row + 1) * options.rowHeight > scrollTop + viewportH + offset) {
				scrollTo(doPaging ? rowAtTop : rowAtBottom);
				render();
			}
			// or page up?
			else if (row * options.rowHeight < scrollTop + offset) {
				scrollTo(doPaging ? rowAtBottom : rowAtTop);
				render();
			}
		}

		function scrollRowToTop(row) {
			scrollTo(row * options.rowHeight);
			render();
		}

		function getColspan(row, cell) {
			var metadata = data.getItemMetadata && data.getItemMetadata(row);
			if (!metadata || !metadata.columns) {
				return 1;
			}

			var columnData = metadata.columns[columns[cell].id] || metadata.columns[cell];
			var colspan = (columnData && columnData.colspan);
			if (colspan === "*") {
				colspan = columns.length - cell;
			} else {
				colspan = colspan || 1;
			}

			return colspan;
		}

		function findFirstFocusableCell(row) {
			var cell = 0;
			while (cell < columns.length) {
				if (canCellBeActive(row, cell)) {
					return cell;
				}
				cell += getColspan(row, cell);
			}
			return null;
		}

		function findLastFocusableCell(row) {
			var cell = 0;
			var lastFocusableCell = null;
			while (cell < columns.length) {
				if (canCellBeActive(row, cell)) {
					lastFocusableCell = cell;
				}
				cell += getColspan(row, cell);
			}
			return lastFocusableCell;
		}

		function gotoRight(row, cell, posX) {
			if (cell >= columns.length) {
				return null;
			}

			do {
				cell += getColspan(row, cell);
			}
			while (cell < columns.length && !canCellBeActive(row, cell));

			if (cell < columns.length) {
				return {
					"row": row,
					"cell": cell,
					"posX": cell
				};
			}
			return null;
		}

		function gotoLeft(row, cell, posX) {
			if (cell <= 0) {
				return null;
			}

			var firstFocusableCell = findFirstFocusableCell(row);
			if (firstFocusableCell === null || firstFocusableCell >= cell) {
				return null;
			}

			var prev = {
				"row": row,
				"cell": firstFocusableCell,
				"posX": firstFocusableCell
			};
			var pos;
			while (true) {
				pos = gotoRight(prev.row, prev.cell, prev.posX);
				if (!pos) {
					return null;
				}
				if (pos.cell >= cell) {
					return prev;
				}
				prev = pos;
			}
		}

		function gotoDown(row, cell, posX) {
			var prevCell;
			while (true) {
				if (++row >= getDataLength() + (options.enableAddRow ? 1 : 0)) {
					return null;
				}

				prevCell = cell = 0;
				while (cell <= posX) {
					prevCell = cell;
					cell += getColspan(row, cell);
				}

				if (canCellBeActive(row, prevCell)) {
					return {
						"row": row,
						"cell": prevCell,
						"posX": posX
					};
				}
			}
		}

		function gotoUp(row, cell, posX) {
			var prevCell;
			while (true) {
				if (--row < 0) {
					return null;
				}

				prevCell = cell = 0;
				while (cell <= posX) {
					prevCell = cell;
					cell += getColspan(row, cell);
				}

				if (canCellBeActive(row, prevCell)) {
					return {
						"row": row,
						"cell": prevCell,
						"posX": posX
					};
				}
			}
		}

		function gotoNext(row, cell, posX) {
			if (row == null && cell == null) {
				row = cell = posX = 0;
				if (canCellBeActive(row, cell)) {
					return {
						"row": row,
						"cell": cell,
						"posX": cell
					};
				}
			}

			var pos = gotoRight(row, cell, posX);
			if (pos) {
				return pos;
			}

			var firstFocusableCell = null;
			while (++row < getDataLength() + (options.enableAddRow ? 1 : 0)) {
				firstFocusableCell = findFirstFocusableCell(row);
				if (firstFocusableCell !== null) {
					return {
						"row": row,
						"cell": firstFocusableCell,
						"posX": firstFocusableCell
					};
				}
			}
			return null;
		}

		function gotoPrev(row, cell, posX) {
			if (row == null && cell == null) {
				row = getDataLength() + (options.enableAddRow ? 1 : 0) - 1;
				cell = posX = columns.length - 1;
				if (canCellBeActive(row, cell)) {
					return {
						"row": row,
						"cell": cell,
						"posX": cell
					};
				}
			}

			var pos;
			var lastSelectableCell;
			while (!pos) {
				pos = gotoLeft(row, cell, posX);
				if (pos) {
					break;
				}
				if (--row < 0) {
					return null;
				}

				cell = 0;
				lastSelectableCell = findLastFocusableCell(row);
				if (lastSelectableCell !== null) {
					pos = {
						"row": row,
						"cell": lastSelectableCell,
						"posX": lastSelectableCell
					};
				}
			}
			return pos;
		}

		function navigateRight() {
			return navigate("right");
		}

		function navigateLeft() {
			return navigate("left");
		}

		function navigateDown() {
			return navigate("down");
		}

		function navigateUp() {
			return navigate("up");
		}

		function navigateNext() {
			return navigate("next");
		}

		function navigatePrev() {
			return navigate("prev");
		}

		/**
		* @param {string} dir Navigation direction.
		* @return {boolean} Whether navigation resulted in a change of active cell.
		*/
		function navigate(dir) {
			if (!options.enableCellNavigation) {
				return false;
			}

			if (!activeCellNode && dir != "prev" && dir != "next") {
				return false;
			}

			if (!getEditorLock().commitCurrentEdit()) {
				return true;
			}
			setFocus();

			var tabbingDirections = {
				"up": -1,
				"down": 1,
				"left": -1,
				"right": 1,
				"prev": -1,
				"next": 1
			};
			tabbingDirection = tabbingDirections[dir];

			var stepFunctions = {
				"up": gotoUp,
				"down": gotoDown,
				"left": gotoLeft,
				"right": gotoRight,
				"prev": gotoPrev,
				"next": gotoNext
			};
			var stepFn = stepFunctions[dir];
			var pos = stepFn(activeRow, activeCell, activePosX);
			if (pos) {
				var isAddNewRow = (pos.row == getDataLength());
				scrollRowIntoView(pos.row, !isAddNewRow);
				scrollCellIntoView(pos.row, pos.cell);
				setActiveCellInternal(getCellNode(pos.row, pos.cell), isAddNewRow || options.autoEdit);
				activePosX = pos.posX;
				return true;
			} else {
				setActiveCellInternal(getCellNode(activeRow, activeCell), (activeRow == getDataLength()) || options.autoEdit);
				return false;
			}
		}

		function getCellNode(row, cell) {
			if (rowsCache[row]) {
				ensureCellNodesInRowsCache(row);
				return rowsCache[row].cellNodesByColumnIdx[cell];
			}
			return null;
		}

		function setActiveCell(row, cell) {
			if (!initialized) { return; }
			if (row > getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
				return;
			}

			if (!options.enableCellNavigation) {
				return;
			}

			scrollRowIntoView(row, false);
			scrollCellIntoView(row, cell);
			setActiveCellInternal(getCellNode(row, cell), false);
		}

		function canCellBeActive(row, cell) {
			if (!options.enableCellNavigation || row >= getDataLength() + (options.enableAddRow ? 1 : 0) ||
					row < 0 || cell >= columns.length || cell < 0) {
				return false;
			}

			var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
			if (rowMetadata && typeof rowMetadata.focusable === "boolean") {
				return rowMetadata.focusable;
			}

			var columnMetadata = rowMetadata && rowMetadata.columns;
			if (columnMetadata && columnMetadata[columns[cell].id] && typeof columnMetadata[columns[cell].id].focusable === "boolean") {
				return columnMetadata[columns[cell].id].focusable;
			}
			if (columnMetadata && columnMetadata[cell] && typeof columnMetadata[cell].focusable === "boolean") {
				return columnMetadata[cell].focusable;
			}

			if (typeof columns[cell].focusable === "boolean") {
				return columns[cell].focusable;
			}

			return true;
		}

		function canCellBeSelected(row, cell) {
			if (row >= getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
				return false;
			}

			var rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
			if (rowMetadata && typeof rowMetadata.selectable === "boolean") {
				return rowMetadata.selectable;
			}

			var columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[columns[cell].id] || rowMetadata.columns[cell]);
			if (columnMetadata && typeof columnMetadata.selectable === "boolean") {
				return columnMetadata.selectable;
			}

			if (typeof columns[cell].selectable === "boolean") {
				return columns[cell].selectable;
			}

			return true;
		}

		function gotoCell(row, cell, forceEdit) {
			if (!initialized) { return; }
			if (!canCellBeActive(row, cell)) {
				return;
			}

			if (!getEditorLock().commitCurrentEdit()) {
				return;
			}

			scrollRowIntoView(row, false);
			scrollCellIntoView(row, cell);

			var newCell = getCellNode(row, cell);

			// if selecting the 'add new' row, start editing right away
			setActiveCellInternal(newCell, forceEdit || (row === getDataLength()) || options.autoEdit);

			// if no editor was created, set the focus back on the grid
			if (!currentEditor) {
				setFocus();
			}
		}


		//////////////////////////////////////////////////////////////////////////////////////////////
		// IEditor implementation for the editor lock

		function commitCurrentEdit() {
			var item = getDataItem(activeRow);
			var column = columns[activeCell];

			if (currentEditor) {
				if (currentEditor.isValueChanged()) {
					var validationResults = currentEditor.validate();

					if (validationResults.valid) {
						if (activeRow < getDataLength()) {
							var editCommand = {
								row: activeRow,
								cell: activeCell,
								editor: currentEditor,
								serializedValue: currentEditor.serializeValue(),
								prevSerializedValue: serializedEditorValue,
								execute: function () {
									this.editor.applyValue(item, this.serializedValue);
									updateRow(this.row);
								},
								undo: function () {
									this.editor.applyValue(item, this.prevSerializedValue);
									updateRow(this.row);
								}
							};

							if (options.editCommandHandler) {
								makeActiveCellNormal();
								options.editCommandHandler(item, column, editCommand);
							} else {
								editCommand.execute();
								makeActiveCellNormal();
							}

							trigger(self.onCellChange, {
								row: activeRow,
								cell: activeCell,
								item: item
							});
						} else {
							var newItem = {};
							currentEditor.applyValue(newItem, currentEditor.serializeValue());
							makeActiveCellNormal();
							trigger(self.onAddNewRow, { item: newItem, column: column });
						}

						// check whether the lock has been re-acquired by event handlers
						return !getEditorLock().isActive();
					} else {
						// TODO: remove and put in onValidationError handlers in examples
						$(activeCellNode).addClass("invalid");
						$(activeCellNode).stop(true, true).effect("highlight", { color: "red" }, 300);

						trigger(self.onValidationError, {
							editor: currentEditor,
							cellNode: activeCellNode,
							validationResults: validationResults,
							row: activeRow,
							cell: activeCell,
							column: column
						});

						currentEditor.focus();
						return false;
					}
				}

				makeActiveCellNormal();
			}
			return true;
		}

		function cancelCurrentEdit() {
			makeActiveCellNormal();
			return true;
		}

		function rowsToRanges(rows) {
			var ranges = [];
			var lastCell = columns.length - 1;
			for (var i = 0; i < rows.length; i++) {
				ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
			}
			return ranges;
		}

		function getSelectedRows() {
			if (!selectionModel) {
				throw "Selection model is not set";
			}
			return selectedRows;
		}

		function setSelectedRows(rows) {
			if (!selectionModel) {
				throw "Selection model is not set";
			}
			selectionModel.setSelectedRanges(rowsToRanges(rows));
		}


		//////////////////////////////////////////////////////////////////////////////////////////////
		// Debug

		this.debug = function () {
			var s = "";

			s += ("\n" + "counter_rows_rendered:  " + counter_rows_rendered);
			s += ("\n" + "counter_rows_removed:  " + counter_rows_removed);
			s += ("\n" + "renderedRows:  " + renderedRows);
			s += ("\n" + "numVisibleRows:  " + numVisibleRows);
			s += ("\n" + "maxSupportedCssHeight:  " + maxSupportedCssHeight);
			s += ("\n" + "n(umber of pages):  " + n);
			s += ("\n" + "(current) page:  " + page);
			s += ("\n" + "page height (ph):  " + ph);
			s += ("\n" + "vScrollDir:  " + vScrollDir);

			alert(s);
		};

		// a debug helper to be able to access private members
		this.eval = function (expr) {
			return eval(expr);
		};

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Public API

		$.extend(this, {
			"slickGridVersion": "2.1",

			// Events
			"onScroll": new Slick.Event(),
			"onSort": new Slick.Event(),
			"onHeaderMouseEnter": new Slick.Event(),
			"onHeaderMouseLeave": new Slick.Event(),
			"onHeaderContextMenu": new Slick.Event(),
			"onHeaderClick": new Slick.Event(),
			"onHeaderCellRendered": new Slick.Event(),
			"onBeforeHeaderCellDestroy": new Slick.Event(),
			"onHeaderRowCellRendered": new Slick.Event(),
			"onBeforeHeaderRowCellDestroy": new Slick.Event(),
			"onMouseEnter": new Slick.Event(),
			"onMouseLeave": new Slick.Event(),
			"onClick": new Slick.Event(),
			"onDblClick": new Slick.Event(),
			"onContextMenu": new Slick.Event(),
			"onKeyDown": new Slick.Event(),
			"onAddNewRow": new Slick.Event(),
			"onValidationError": new Slick.Event(),
			"onViewportChanged": new Slick.Event(),
			"onColumnsReordered": new Slick.Event(),
			"onColumnsResized": new Slick.Event(),
			"onCellChange": new Slick.Event(),
			"onBeforeEditCell": new Slick.Event(),
			"onBeforeCellEditorDestroy": new Slick.Event(),
			"onBeforeDestroy": new Slick.Event(),
			"onActiveCellChanged": new Slick.Event(),
			"onActiveCellPositionChanged": new Slick.Event(),
			"onDragInit": new Slick.Event(),
			"onDragStart": new Slick.Event(),
			"onDrag": new Slick.Event(),
			"onDragEnd": new Slick.Event(),
			"onSelectedRowsChanged": new Slick.Event(),
			"onCellCssStylesChanged": new Slick.Event(),

			// Methods
			"registerPlugin": registerPlugin,
			"unregisterPlugin": unregisterPlugin,
			"getColumns": getColumns,
			"setColumns": setColumns,
			"getColumnIndex": getColumnIndex,
			"updateColumnHeader": updateColumnHeader,
			"setSortColumn": setSortColumn,
			"setSortColumns": setSortColumns,
			"getSortColumns": getSortColumns,
			"autosizeColumns": autosizeColumns,
			"getOptions": getOptions,
			"setOptions": setOptions,
			"getData": getData,
			"getDataLength": getDataLength,
			"getDataItem": getDataItem,
			"setData": setData,
			"getSelectionModel": getSelectionModel,
			"setSelectionModel": setSelectionModel,
			"getSelectedRows": getSelectedRows,
			"setSelectedRows": setSelectedRows,

			"render": render,
			"invalidate": invalidate,
			"invalidateRow": invalidateRow,
			"invalidateRows": invalidateRows,
			"invalidateAllRows": invalidateAllRows,
			"updateCell": updateCell,
			"updateRow": updateRow,
			"getViewport": getVisibleRange,
			"getRenderedRange": getRenderedRange,
			"resizeCanvas": resizeCanvas,
			"updateRowCount": updateRowCount,
			"scrollRowIntoView": scrollRowIntoView,
			"scrollRowToTop": scrollRowToTop,
			"scrollCellIntoView": scrollCellIntoView,
			"getCanvasNode": getCanvasNode,
			"focus": setFocus,

			"getCellFromPoint": getCellFromPoint,
			"getCellFromEvent": getCellFromEvent,
			"getActiveCell": getActiveCell,
			"setActiveCell": setActiveCell,
			"getActiveCellNode": getActiveCellNode,
			"getActiveCellPosition": getActiveCellPosition,
			"resetActiveCell": resetActiveCell,
			"editActiveCell": makeActiveCellEditable,
			"getCellEditor": getCellEditor,
			"getCellNode": getCellNode,
			"getCellNodeBox": getCellNodeBox,
			"canCellBeSelected": canCellBeSelected,
			"canCellBeActive": canCellBeActive,
			"navigatePrev": navigatePrev,
			"navigateNext": navigateNext,
			"navigateUp": navigateUp,
			"navigateDown": navigateDown,
			"navigateLeft": navigateLeft,
			"navigateRight": navigateRight,
			"gotoCell": gotoCell,
			"getTopPanel": getTopPanel,
			"setTopPanelVisibility": setTopPanelVisibility,
			"setHeaderRowVisibility": setHeaderRowVisibility,
			"getHeaderRow": getHeaderRow,
			"getHeaderRowColumn": getHeaderRowColumn,
			"getGridPosition": getGridPosition,
			"flashCell": flashCell,
			"addCellCssStyles": addCellCssStyles,
			"setCellCssStyles": setCellCssStyles,
			"removeCellCssStyles": removeCellCssStyles,
			"getCellCssStyles": getCellCssStyles,

			"init": finishInitialization,
			"destroy": destroy,

			// IEditor implementation
			"getEditorLock": getEditorLock,
			"getEditController": getEditController
		});

		init();
	}
})($);

/* slick.dataview.js */
(function ($) {
	$.extend(true, window, {
		Slick: {
			Data: {
				DataView: DataView,
				Aggregators: {
					Avg: AvgAggregator,
					Min: MinAggregator,
					Max: MaxAggregator,
					Sum: SumAggregator
				}
			}
		}
	});


	/***
	* A sample Model implementation.
	* Provides a filtered view of the underlying data.
	*
	* Relies on the data item having an "id" property uniquely identifying it.
	*/
	function DataView(options) {
		var self = this;

		var defaults = {
			groupItemMetadataProvider: null,
			inlineFilters: false
		};


		// private
		var idProperty = "id";  // property holding a unique row id
		var items = [];         // data by index
		var rows = [];          // data by row
		var idxById = {};       // indexes by id
		var rowsById = null;    // rows by id; lazy-calculated
		var filter = null;      // filter function
		var updated = null;     // updated item ids
		var suspend = false;    // suspends the recalculation
		var sortAsc = true;
		var fastSortField;
		var sortComparer;
		var refreshHints = {};
		var prevRefreshHints = {};
		var filterArgs;
		var filteredItems = [];
		var compiledFilter;
		var compiledFilterWithCaching;
		var filterCache = [];

		// grouping
		var groupingInfoDefaults = {
			getter: null,
			formatter: null,
			comparer: function (a, b) { return a.value - b.value; },
			predefinedValues: [],
			aggregators: [],
			aggregateEmpty: false,
			aggregateCollapsed: false,
			aggregateChildGroups: false,
			collapsed: false
		};
		var groupingInfos = [];
		var groups = [];
		var toggledGroupsByLevel = [];
		var groupingDelimiter = ':|:';

		var pagesize = 0;
		var pagenum = 0;
		var totalRows = 0;

		// events
		var onRowCountChanged = new Slick.Event();
		var onRowsChanged = new Slick.Event();
		var onPagingInfoChanged = new Slick.Event();

		options = $.extend(true, {}, defaults, options);


		function beginUpdate() {
			suspend = true;
		}

		function endUpdate() {
			suspend = false;
			refresh();
		}

		function setRefreshHints(hints) {
			refreshHints = hints;
		}

		function setFilterArgs(args) {
			filterArgs = args;
		}

		function updateIdxById(startingIndex) {
			startingIndex = startingIndex || 0;
			var id;
			for (var i = startingIndex, l = items.length; i < l; i++) {
				id = items[i][idProperty];
				if (id === undefined) {
					throw "Each data element must implement a unique 'id' property";
				}
				idxById[id] = i;
			}
		}

		function ensureIdUniqueness() {
			var id;
			for (var i = 0, l = items.length; i < l; i++) {
				id = items[i][idProperty];
				if (id === undefined || idxById[id] !== i) {
					throw "Each data element must implement a unique 'id' property";
				}
			}
		}

		function getItems() {
			return items;
		}

		function setItems(data, objectIdProperty) {
			if (objectIdProperty !== undefined) {
				idProperty = objectIdProperty;
			}
			items = filteredItems = data;
			idxById = {};
			updateIdxById();
			ensureIdUniqueness();
			refresh();
		}

		function setPagingOptions(args) {
			if (args.pageSize != undefined) {
				pagesize = args.pageSize;
				pagenum = pagesize ? Math.min(pagenum, Math.max(0, Math.ceil(totalRows / pagesize) - 1)) : 0;
			}

			if (args.pageNum != undefined) {
				pagenum = Math.min(args.pageNum, Math.max(0, Math.ceil(totalRows / pagesize) - 1));
			}

			onPagingInfoChanged.notify(getPagingInfo(), null, self);

			refresh();
		}

		function getPagingInfo() {
			var totalPages = pagesize ? Math.max(1, Math.ceil(totalRows / pagesize)) : 1;
			return { pageSize: pagesize, pageNum: pagenum, totalRows: totalRows, totalPages: totalPages };
		}

		function sort(comparer, ascending) {
			sortAsc = ascending;
			sortComparer = comparer;
			fastSortField = null;
			if (ascending === false) {
				items.reverse();
			}
			items.sort(comparer);
			if (ascending === false) {
				items.reverse();
			}
			idxById = {};
			updateIdxById();
			refresh();
		}

		/***
		* Provides a workaround for the extremely slow sorting in IE.
		* Does a [lexicographic] sort on a give column by temporarily overriding Object.prototype.toString
		* to return the value of that field and then doing a native Array.sort().
		*/
		function fastSort(field, ascending) {
			sortAsc = ascending;
			fastSortField = field;
			sortComparer = null;
			var oldToString = Object.prototype.toString;
			Object.prototype.toString = (typeof field == "function") ? field : function () {
				return this[field]
			};
			// an extra reversal for descending sort keeps the sort stable
			// (assuming a stable native sort implementation, which isn't true in some cases)
			if (ascending === false) {
				items.reverse();
			}
			items.sort();
			Object.prototype.toString = oldToString;
			if (ascending === false) {
				items.reverse();
			}
			idxById = {};
			updateIdxById();
			refresh();
		}

		function reSort() {
			if (sortComparer) {
				sort(sortComparer, sortAsc);
			} else if (fastSortField) {
				fastSort(fastSortField, sortAsc);
			}
		}

		function setFilter(filterFn) {
			filter = filterFn;
			if (options.inlineFilters) {
				compiledFilter = compileFilter();
				compiledFilterWithCaching = compileFilterWithCaching();
			}
			refresh();
		}

		function getGrouping() {
			return groupingInfos;
		}

		function setGrouping(groupingInfo) {
			if (!options.groupItemMetadataProvider) {
				options.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			}

			groups = [];
			toggledGroupsByLevel = [];
			groupingInfo = groupingInfo || [];
			groupingInfos = (groupingInfo instanceof Array) ? groupingInfo : [groupingInfo];

			for (var i = 0; i < groupingInfos.length; i++) {
				var gi = groupingInfos[i] = $.extend(true, {}, groupingInfoDefaults, groupingInfos[i]);
				gi.getterIsAFn = typeof gi.getter === "function";

				// pre-compile accumulator loops
				gi.compiledAccumulators = [];
				var idx = gi.aggregators.length;
				while (idx--) {
					gi.compiledAccumulators[idx] = compileAccumulatorLoop(gi.aggregators[idx]);
				}

				toggledGroupsByLevel[i] = {};
			}

			refresh();
		}

		function getItemByIdx(i) {
			return items[i];
		}

		function getIdxById(id) {
			return idxById[id];
		}

		function ensureRowsByIdCache() {
			if (!rowsById) {
				rowsById = {};
				for (var i = 0, l = rows.length; i < l; i++) {
					rowsById[rows[i][idProperty]] = i;
				}
			}
		}

		function getRowById(id) {
			ensureRowsByIdCache();
			return rowsById[id];
		}

		function getItemById(id) {
			return items[idxById[id]];
		}

		function mapIdsToRows(idArray) {
			var rows = [];
			ensureRowsByIdCache();
			for (var i = 0; i < idArray.length; i++) {
				var row = rowsById[idArray[i]];
				if (row != null) {
					rows[rows.length] = row;
				}
			}
			return rows;
		}

		function mapRowsToIds(rowArray) {
			var ids = [];
			for (var i = 0; i < rowArray.length; i++) {
				if (rowArray[i] < rows.length) {
					ids[ids.length] = rows[rowArray[i]][idProperty];
				}
			}
			return ids;
		}

		function updateItem(id, item) {
			if (idxById[id] === undefined || id !== item[idProperty]) {
				throw "Invalid or non-matching id";
			}
			items[idxById[id]] = item;
			if (!updated) {
				updated = {};
			}
			updated[id] = true;
			refresh();
		}

		function insertItem(insertBefore, item) {
			items.splice(insertBefore, 0, item);
			updateIdxById(insertBefore);
			refresh();
		}

		function addItem(item) {
			items.push(item);
			updateIdxById(items.length - 1);
			refresh();
		}

		function deleteItem(id) {
			var idx = idxById[id];
			if (idx === undefined) {
				throw "Invalid id";
			}
			delete idxById[id];
			items.splice(idx, 1);
			updateIdxById(idx);
			refresh();
		}

		function getLength() {
			return rows.length;
		}

		function getItem(i) {
			return rows[i];
		}

		function getItemMetadata(i) {
			var item = rows[i];
			if (item === undefined) {
				return null;
			}

			// overrides for setGrouping rows
			if (item.__group) {
				return options.groupItemMetadataProvider.getGroupRowMetadata(item);
			}

			// overrides for totals rows
			if (item.__groupTotals) {
				return options.groupItemMetadataProvider.getTotalsRowMetadata(item);
			}

			return null;
		}

		function expandCollapseAllGroups(level, collapse) {
			if (level == null) {
				for (var i = 0; i < groupingInfos.length; i++) {
					toggledGroupsByLevel[i] = {};
					groupingInfos[i].collapsed = collapse;
				}
			} else {
				toggledGroupsByLevel[level] = {};
				groupingInfos[level].collapsed = collapse;
			}
			refresh();
		}

		/**
		* @param level {Number} Optional level to collapse.  If not specified, applies to all levels.
		*/
		function collapseAllGroups(level) {
			expandCollapseAllGroups(level, true);
		}

		/**
		* @param level {Number} Optional level to expand.  If not specified, applies to all levels.
		*/
		function expandAllGroups(level) {
			expandCollapseAllGroups(level, false);
		}

		function expandCollapseGroup(level, groupingKey, collapse) {
			toggledGroupsByLevel[level][groupingKey] = groupingInfos[level].collapsed ^ collapse;
			refresh();
		}

		/**
		* @param varArgs Either a Slick.Group's "groupingKey" property, or a
		*     variable argument list of grouping values denoting a unique path to the row.  For
		*     example, calling collapseGroup('high', '10%') will collapse the '10%' subgroup of
		*     the 'high' setGrouping.
		*/
		function collapseGroup(varArgs) {
			var args = Array.prototype.slice.call(arguments);
			var arg0 = args[0];
			if (args.length == 1 && arg0.indexOf(groupingDelimiter) != -1) {
				expandCollapseGroup(arg0.split(groupingDelimiter).length - 1, arg0, true);
			} else {
				expandCollapseGroup(args.length - 1, args.join(groupingDelimiter), true);
			}
		}

		/**
		* @param varArgs Either a Slick.Group's "groupingKey" property, or a
		*     variable argument list of grouping values denoting a unique path to the row.  For
		*     example, calling expandGroup('high', '10%') will expand the '10%' subgroup of
		*     the 'high' setGrouping.
		*/
		function expandGroup(varArgs) {
			var args = Array.prototype.slice.call(arguments);
			var arg0 = args[0];
			if (args.length == 1 && arg0.indexOf(groupingDelimiter) != -1) {
				expandCollapseGroup(arg0.split(groupingDelimiter).length - 1, arg0, false);
			} else {
				expandCollapseGroup(args.length - 1, args.join(groupingDelimiter), false);
			}
		}

		function getGroups() {
			return groups;
		}

		function extractGroups(rows, parentGroup) {
			var group;
			var val;
			var groups = [];
			var groupsByVal = [];
			var r;
			var level = parentGroup ? parentGroup.level + 1 : 0;
			var gi = groupingInfos[level];

			for (var i = 0, l = gi.predefinedValues.length; i < l; i++) {
				val = gi.predefinedValues[i];
				group = groupsByVal[val];
				if (!group) {
					group = new Slick.Group();
					group.value = val;
					group.level = level;
					group.groupingKey = (parentGroup ? parentGroup.groupingKey + groupingDelimiter : '') + val;
					groups[groups.length] = group;
					groupsByVal[val] = group;
				}
			}

			for (var i = 0, l = rows.length; i < l; i++) {
				r = rows[i];
				val = gi.getterIsAFn ? gi.getter(r) : r[gi.getter];
				group = groupsByVal[val];
				if (!group) {
					group = new Slick.Group();
					group.value = val;
					group.level = level;
					group.groupingKey = (parentGroup ? parentGroup.groupingKey + groupingDelimiter : '') + val;
					groups[groups.length] = group;
					groupsByVal[val] = group;
				}

				group.rows[group.count++] = r;
			}

			if (level < groupingInfos.length - 1) {
				for (var i = 0; i < groups.length; i++) {
					group = groups[i];
					group.groups = extractGroups(group.rows, group);
				}
			}

			groups.sort(groupingInfos[level].comparer);

			return groups;
		}

		// TODO:  lazy totals calculation
		function calculateGroupTotals(group) {
			// TODO:  try moving iterating over groups into compiled accumulator
			var gi = groupingInfos[group.level];
			var isLeafLevel = (group.level == groupingInfos.length);
			var totals = new Slick.GroupTotals();
			var agg, idx = gi.aggregators.length;
			while (idx--) {
				agg = gi.aggregators[idx];
				agg.init();
				gi.compiledAccumulators[idx].call(agg,
						(!isLeafLevel && gi.aggregateChildGroups) ? group.groups : group.rows);
				agg.storeResult(totals);
			}
			totals.group = group;
			group.totals = totals;
		}

		function calculateTotals(groups, level) {
			level = level || 0;
			var gi = groupingInfos[level];
			var idx = groups.length, g;
			while (idx--) {
				g = groups[idx];

				if (g.collapsed && !gi.aggregateCollapsed) {
					continue;
				}

				// Do a depth-first aggregation so that parent setGrouping aggregators can access subgroup totals.
				if (g.groups) {
					calculateTotals(g.groups, level + 1);
				}

				if (gi.aggregators.length && (
						gi.aggregateEmpty || g.rows.length || (g.groups && g.groups.length))) {
					calculateGroupTotals(g);
				}
			}
		}

		function finalizeGroups(groups, level) {
			level = level || 0;
			var gi = groupingInfos[level];
			var groupCollapsed = gi.collapsed;
			var toggledGroups = toggledGroupsByLevel[level];
			var idx = groups.length, g;
			while (idx--) {
				g = groups[idx];
				g.collapsed = groupCollapsed ^ toggledGroups[g.groupingKey];
				g.title = gi.formatter ? gi.formatter(g) : g.value;

				if (g.groups) {
					finalizeGroups(g.groups, level + 1);
					// Let the non-leaf setGrouping rows get garbage-collected.
					// They may have been used by aggregates that go over all of the descendants,
					// but at this point they are no longer needed.
					g.rows = [];
				}
			}
		}

		function flattenGroupedRows(groups) {
			var groupedRows = [], rows, gl = 0, g;
			for (var i = 0, l = groups.length; i < l; i++) {
				g = groups[i];
				groupedRows[gl++] = g;

				if (!g.collapsed) {
					rows = g.groups ? flattenGroupedRows(g.groups) : g.rows;
					for (var j = 0, jj = rows.length; j < jj; j++) {
						groupedRows[gl++] = rows[j];
					}
				}

				if (g.totals && (!g.collapsed || groupingInfos[g.level].aggregateCollapsed)) {
					groupedRows[gl++] = g.totals;
				}
			}
			return groupedRows;
		}

		function getFunctionInfo(fn) {
			var fnRegex = /^function[^(]*\(([^)]*)\)\s*{([\s\S]*)}$/;
			var matches = fn.toString().match(fnRegex);
			return {
				params: matches[1].split(","),
				body: matches[2]
			};
		}

		function compileAccumulatorLoop(aggregator) {
			var accumulatorInfo = getFunctionInfo(aggregator.accumulate);
			var fn = new Function(
					"_items",
					"for (var " + accumulatorInfo.params[0] + ", _i=0, _il=_items.length; _i<_il; _i++) {" +
							accumulatorInfo.params[0] + " = _items[_i]; " +
							accumulatorInfo.body +
					"}"
			);
			fn.displayName = fn.name = "compiledAccumulatorLoop";
			return fn;
		}

		function compileFilter() {
			var filterInfo = getFunctionInfo(filter);

			var filterBody = filterInfo.body
					.replace(/return false[;}]/gi, "{ continue _coreloop; }")
					.replace(/return true[;}]/gi, "{ _retval[_idx++] = $item$; continue _coreloop; }")
					.replace(/return ([^;}]+?);/gi,
					"{ if ($1) { _retval[_idx++] = $item$; }; continue _coreloop; }");

			// This preserves the function template code after JS compression,
			// so that replace() commands still work as expected.
			var tpl = [
			//"function(_items, _args) { ",
				"var _retval = [], _idx = 0; ",
				"var $item$, $args$ = _args; ",
				"_coreloop: ",
				"for (var _i = 0, _il = _items.length; _i < _il; _i++) { ",
				"$item$ = _items[_i]; ",
				"$filter$; ",
				"} ",
				"return _retval; "
			//"}"
			].join("");
			tpl = tpl.replace(/\$filter\$/gi, filterBody);
			tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
			tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);

			var fn = new Function("_items,_args", tpl);
			fn.displayName = fn.name = "compiledFilter";
			return fn;
		}

		function compileFilterWithCaching() {
			var filterInfo = getFunctionInfo(filter);

			var filterBody = filterInfo.body
					.replace(/return false[;}]/gi, "{ continue _coreloop; }")
					.replace(/return true[;}]/gi, "{ _cache[_i] = true;_retval[_idx++] = $item$; continue _coreloop; }")
					.replace(/return ([^;}]+?);/gi,
					"{ if ((_cache[_i] = $1)) { _retval[_idx++] = $item$; }; continue _coreloop; }");

			// This preserves the function template code after JS compression,
			// so that replace() commands still work as expected.
			var tpl = [
			//"function(_items, _args, _cache) { ",
				"var _retval = [], _idx = 0; ",
				"var $item$, $args$ = _args; ",
				"_coreloop: ",
				"for (var _i = 0, _il = _items.length; _i < _il; _i++) { ",
				"$item$ = _items[_i]; ",
				"if (_cache[_i]) { ",
				"_retval[_idx++] = $item$; ",
				"continue _coreloop; ",
				"} ",
				"$filter$; ",
				"} ",
				"return _retval; "
			//"}"
			].join("");
			tpl = tpl.replace(/\$filter\$/gi, filterBody);
			tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
			tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);

			var fn = new Function("_items,_args,_cache", tpl);
			fn.displayName = fn.name = "compiledFilterWithCaching";
			return fn;
		}

		function uncompiledFilter(items, args) {
			var retval = [], idx = 0;

			for (var i = 0, ii = items.length; i < ii; i++) {
				if (filter(items[i], args)) {
					retval[idx++] = items[i];
				}
			}

			return retval;
		}

		function uncompiledFilterWithCaching(items, args, cache) {
			var retval = [], idx = 0, item;

			for (var i = 0, ii = items.length; i < ii; i++) {
				item = items[i];
				if (cache[i]) {
					retval[idx++] = item;
				} else if (filter(item, args)) {
					retval[idx++] = item;
					cache[i] = true;
				}
			}

			return retval;
		}

		function getFilteredAndPagedItems(items) {
			if (filter) {
				var batchFilter = options.inlineFilters ? compiledFilter : uncompiledFilter;
				var batchFilterWithCaching = options.inlineFilters ? compiledFilterWithCaching : uncompiledFilterWithCaching;

				if (refreshHints.isFilterNarrowing) {
					filteredItems = batchFilter(filteredItems, filterArgs);
				} else if (refreshHints.isFilterExpanding) {
					filteredItems = batchFilterWithCaching(items, filterArgs, filterCache);
				} else if (!refreshHints.isFilterUnchanged) {
					filteredItems = batchFilter(items, filterArgs);
				}
			} else {
				// special case:  if not filtering and not paging, the resulting
				// rows collection needs to be a copy so that changes due to sort
				// can be caught
				filteredItems = pagesize ? items : items.concat();
			}

			// get the current page
			var paged;
			if (pagesize) {
				if (filteredItems.length < pagenum * pagesize) {
					pagenum = Math.floor(filteredItems.length / pagesize);
				}
				paged = filteredItems.slice(pagesize * pagenum, pagesize * pagenum + pagesize);
			} else {
				paged = filteredItems;
			}

			return { totalRows: filteredItems.length, rows: paged };
		}

		function getRowDiffs(rows, newRows) {
			var item, r, eitherIsNonData, diff = [];
			var from = 0, to = newRows.length;

			if (refreshHints && refreshHints.ignoreDiffsBefore) {
				from = Math.max(0,
						Math.min(newRows.length, refreshHints.ignoreDiffsBefore));
			}

			if (refreshHints && refreshHints.ignoreDiffsAfter) {
				to = Math.min(newRows.length,
						Math.max(0, refreshHints.ignoreDiffsAfter));
			}

			for (var i = from, rl = rows.length; i < to; i++) {
				if (i >= rl) {
					diff[diff.length] = i;
				} else {
					item = newRows[i];
					r = rows[i];

					if ((groupingInfos.length && (eitherIsNonData = (item.__nonDataRow) || (r.__nonDataRow)) &&
							item.__group !== r.__group ||
							item.__group && !item.equals(r))
							|| (eitherIsNonData &&
					// no good way to compare totals since they are arbitrary DTOs
					// deep object comparison is pretty expensive
					// always considering them 'dirty' seems easier for the time being
							(item.__groupTotals || r.__groupTotals))
							|| item[idProperty] != r[idProperty]
							|| (updated && updated[item[idProperty]])
							) {
						diff[diff.length] = i;
					}
				}
			}
			return diff;
		}

		function recalc(_items) {
			rowsById = null;

			if (refreshHints.isFilterNarrowing != prevRefreshHints.isFilterNarrowing ||
					refreshHints.isFilterExpanding != prevRefreshHints.isFilterExpanding) {
				filterCache = [];
			}

			var filteredItems = getFilteredAndPagedItems(_items);
			totalRows = filteredItems.totalRows;
			var newRows = filteredItems.rows;

			groups = [];
			if (groupingInfos.length) {
				groups = extractGroups(newRows);
				if (groups.length) {
					calculateTotals(groups);
					finalizeGroups(groups);
					newRows = flattenGroupedRows(groups);
				}
			}

			var diff = getRowDiffs(rows, newRows);

			rows = newRows;

			return diff;
		}

		function refresh() {
			if (suspend) {
				return;
			}

			var countBefore = rows.length;
			var totalRowsBefore = totalRows;

			var diff = recalc(items, filter); // pass as direct refs to avoid closure perf hit

			// if the current page is no longer valid, go to last page and recalc
			// we suffer a performance penalty here, but the main loop (recalc) remains highly optimized
			if (pagesize && totalRows < pagenum * pagesize) {
				pagenum = Math.max(0, Math.ceil(totalRows / pagesize) - 1);
				diff = recalc(items, filter);
			}

			updated = null;
			prevRefreshHints = refreshHints;
			refreshHints = {};

			if (totalRowsBefore != totalRows) {
				onPagingInfoChanged.notify(getPagingInfo(), null, self);
			}
			if (countBefore != rows.length) {
				onRowCountChanged.notify({ previous: countBefore, current: rows.length }, null, self);
			}
			if (diff.length > 0) {
				onRowsChanged.notify({ rows: diff }, null, self);
			}
		}

		function syncGridSelection(grid, preserveHidden) {
			var self = this;
			var selectedRowIds = self.mapRowsToIds(grid.getSelectedRows());
			var inHandler;

			function update() {
				if (selectedRowIds.length > 0) {
					inHandler = true;
					var selectedRows = self.mapIdsToRows(selectedRowIds);
					if (!preserveHidden) {
						selectedRowIds = self.mapRowsToIds(selectedRows);
					}
					grid.setSelectedRows(selectedRows);
					inHandler = false;
				}
			}

			grid.onSelectedRowsChanged.subscribe(function (e, args) {
				if (inHandler) { return; }
				selectedRowIds = self.mapRowsToIds(grid.getSelectedRows());
			});

			this.onRowsChanged.subscribe(update);

			this.onRowCountChanged.subscribe(update);
		}

		function syncGridCellCssStyles(grid, key) {
			var hashById;
			var inHandler;

			// since this method can be called after the cell styles have been set,
			// get the existing ones right away
			storeCellCssStyles(grid.getCellCssStyles(key));

			function storeCellCssStyles(hash) {
				hashById = {};
				for (var row in hash) {
					var id = rows[row][idProperty];
					hashById[id] = hash[row];
				}
			}

			function update() {
				if (hashById) {
					inHandler = true;
					ensureRowsByIdCache();
					var newHash = {};
					for (var id in hashById) {
						var row = rowsById[id];
						if (row != undefined) {
							newHash[row] = hashById[id];
						}
					}
					grid.setCellCssStyles(key, newHash);
					inHandler = false;
				}
			}

			grid.onCellCssStylesChanged.subscribe(function (e, args) {
				if (inHandler) { return; }
				if (key != args.key) { return; }
				if (args.hash) {
					storeCellCssStyles(args.hash);
				}
			});

			this.onRowsChanged.subscribe(update);

			this.onRowCountChanged.subscribe(update);
		}

		return {
			// methods
			"beginUpdate": beginUpdate,
			"endUpdate": endUpdate,
			"setPagingOptions": setPagingOptions,
			"getPagingInfo": getPagingInfo,
			"getItems": getItems,
			"setItems": setItems,
			"setFilter": setFilter,
			"sort": sort,
			"fastSort": fastSort,
			"reSort": reSort,
			"setGrouping": setGrouping,
			"getGrouping": getGrouping,
			"collapseAllGroups": collapseAllGroups,
			"expandAllGroups": expandAllGroups,
			"collapseGroup": collapseGroup,
			"expandGroup": expandGroup,
			"getGroups": getGroups,
			"getIdxById": getIdxById,
			"getRowById": getRowById,
			"getItemById": getItemById,
			"getItemByIdx": getItemByIdx,
			"mapRowsToIds": mapRowsToIds,
			"mapIdsToRows": mapIdsToRows,
			"setRefreshHints": setRefreshHints,
			"setFilterArgs": setFilterArgs,
			"refresh": refresh,
			"updateItem": updateItem,
			"insertItem": insertItem,
			"addItem": addItem,
			"deleteItem": deleteItem,
			"syncGridSelection": syncGridSelection,
			"syncGridCellCssStyles": syncGridCellCssStyles,

			// data provider methods
			"getLength": getLength,
			"getItem": getItem,
			"getItemMetadata": getItemMetadata,

			// events
			"onRowCountChanged": onRowCountChanged,
			"onRowsChanged": onRowsChanged,
			"onPagingInfoChanged": onPagingInfoChanged
		};
	}

	function AvgAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.count_ = 0;
			this.nonNullCount_ = 0;
			this.sum_ = 0;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			this.count_++;
			if (val != null && val !== "" && val !== NaN) {
				this.nonNullCount_++;
				this.sum_ += parseFloat(val);
			}
		};

		this.storeResult = function (groupTotals) {
			if (!groupTotals.avg) {
				groupTotals.avg = {};
			}
			if (this.nonNullCount_ != 0) {
				groupTotals.avg[this.field_] = this.sum_ / this.nonNullCount_;
			}
		};
	}

	function MinAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.min_ = null;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			if (val != null && val !== "" && val !== NaN) {
				if (this.min_ == null || ((val != 0) && (val < this.min_))) {
					this.min_ = val;
				}
			}
		};

		this.storeResult = function (groupTotals) {
			if (!groupTotals.min) {
				groupTotals.min = {};
			}
			groupTotals.min[this.field_] = this.min_;
		}
	}

	function MaxAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.max_ = null;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			if (val != null && val !== "" && val !== NaN) {
				if (this.max_ == null || val > this.max_) {
					this.max_ = val;
				}
			}
		};

		this.storeResult = function (groupTotals) {
			if (!groupTotals.max) {
				groupTotals.max = {};
			}
			groupTotals.max[this.field_] = this.max_;
		}
	}

	function SumAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.sum_ = null;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			if (val != null && val !== "" && val !== NaN) {
				this.sum_ += parseFloat(val);
			}
		};

		this.storeResult = function (groupTotals) {
			if (!groupTotals.sum) {
				groupTotals.sum = {};
			}
			groupTotals.sum[this.field_] = this.sum_;
		}
	}

	// TODO:  add more built-in aggregators
	// TODO:  merge common aggregators in one to prevent needles iterating
})($);

/* slick.groupitemmetadataprovider.js */
(function ($) {
	$.extend(true, window, {
		Slick: {
			Data: {
				GroupItemMetadataProvider: GroupItemMetadataProvider
			}
		}
	});

	/***
	* Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView.
	* This metadata overrides the default behavior and formatting of those rows so that they appear and function
	* correctly when processed by the grid.
	*
	* This class also acts as a grid plugin providing event handlers to expand & collapse groups.
	* If "grid.registerPlugin(...)" is not called, expand & collapse will not work.
	*
	* @class GroupItemMetadataProvider
	* @module Data
	* @namespace Slick.Data
	* @constructor
	* @param options
	*/
	function GroupItemMetadataProvider(options) {
		var _grid;
		var _defaults = {
			groupCssClass: "slick-group",
			groupTitleCssClass: "slick-group-title",
			totalsCssClass: "slick-group-totals",
			groupFocusable: true,
			totalsFocusable: false,
			toggleCssClass: "slick-group-toggle",
			toggleExpandedCssClass: "expanded",
			toggleCollapsedCssClass: "collapsed",
			enableExpandCollapse: true
		};

		options = $.extend(true, {}, _defaults, options);

		function defaultGroupCellFormatter(row, cell, value, columnDef, item) {
			if (!options.enableExpandCollapse) { return item.title; }
			var indentation = item.level * 15 + "px";
			return "<span class='" + options.toggleCssClass + " " +
					(item.collapsed ? options.toggleCollapsedCssClass : options.toggleExpandedCssClass) +
					"' style='margin-left:" + indentation + "'>" +
					"</span>" +
					"<span class='" + options.groupTitleCssClass + "' level='" + item.level + "'>" +
						item.title +
					"</span>";
		}

		function defaultTotalsCellFormatter(row, cell, value, columnDef, item) {
			//modified by Paul
			var val;
			switch (columnDef.Aggregate || "") {
				case "Sum":
					val = item.sum && item.sum[columnDef.field];
					if (val != null) { return (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(row, cell, val, columnDef, item)) || ""; }
					break;
				case "Avg":
					val = item.avg && item.avg[columnDef.field];
					if (val != null) { return "Avg:" + (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(row, cell, val, columnDef, item)) || ""; }
					break;
				case "Min":
					val = item.min && item.min[columnDef.field];
					if (val != null) { return "Min:" + (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(row, cell, val, columnDef, item)) || ""; }
					break;
				case "Max":
					val = item.max && item.max[columnDef.field];
					if (val != null) { return "Max:" + (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(row, cell, val, columnDef, item)) || ""; }
					break;
				default:
			}
			return (columnDef.groupTotalsFormatter && columnDef.groupTotalsFormatter(row, cell, value, columnDef, item)) || "";
		}

		function init(grid) {
			_grid = grid;
			_grid.onClick.subscribe(handleGridClick);
			_grid.onKeyDown.subscribe(handleGridKeyDown);

		}

		function destroy() {
			if (_grid) {
				_grid.onClick.unsubscribe(handleGridClick);
				_grid.onKeyDown.unsubscribe(handleGridKeyDown);
			}
		}

		function handleGridClick(e, args) {
			var item = this.getDataItem(args.row);
			if (item && item instanceof Slick.Group && $(e.target).hasClass(options.toggleCssClass)) {
				if (item.collapsed) {
					this.getData().expandGroup(item.groupingKey);
				} else {
					this.getData().collapseGroup(item.groupingKey);
				}
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		}

		// TODO:  add -/+ handling
		function handleGridKeyDown(e, args) {
			if (options.enableExpandCollapse && (e.which == $.ui.keyCode.SPACE)) {
				var activeCell = this.getActiveCell();
				if (activeCell) {
					var item = this.getDataItem(activeCell.row);
					if (item && item instanceof Slick.Group) {
						if (item.collapsed) {
							this.getData().expandGroup(item.groupingKey);
						} else {
							this.getData().collapseGroup(item.groupingKey);
						}
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				}
			}
		}

		function getGroupRowMetadata(item) {
			return {
				selectable: false,
				focusable: options.groupFocusable,
				cssClasses: options.groupCssClass,
				columns: {
					0: {
						colspan: "*",
						formatter: defaultGroupCellFormatter,
						editor: null
					}
				}
			};
		}

		function getTotalsRowMetadata(item) {
			return {
				selectable: false,
				focusable: options.totalsFocusable,
				cssClasses: options.totalsCssClass,
				formatter: defaultTotalsCellFormatter,
				editor: null
			};
		}

		return {
			"init": init,
			"destroy": destroy,
			"getGroupRowMetadata": getGroupRowMetadata,
			"getTotalsRowMetadata": getTotalsRowMetadata
		};
	}

/* slick.headermenu.js */
	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Plugins": {
				"HeaderMenu": HeaderMenu
			}
		}
	});


	/***
	 * A plugin to add drop-down menus to column headers.
	 *
	 * USAGE:
	 *
	 * Add the plugin .js & .css files and register it with the grid.
	 *
	 * To specify a menu in a column header, extend the column definition like so:
	 *
	 *   var columns = [
	 *     {
	 *       id: 'myColumn',
	 *       name: 'My column',
	 *
	 *       // This is the relevant part
	 *       header: {
	 *          menu: {
	 *              items: [
	 *                {
	 *                  // menu item options
	 *                },
	 *                {
	 *                  // menu item options
	 *                }
	 *              ]
	 *          }
	 *       }
	 *     }
	 *   ];
	 *
	 *
	 * Available menu options:
	 *    tooltip:      Menu button tooltip.
	 *
	 *
	 * Available menu item options:
	 *    title:        Menu item text.
	 *    disabled:     Whether the item is disabled.
	 *    tooltip:      Item tooltip.
	 *    command:      A command identifier to be passed to the onCommand event handlers.
	 *    iconCssClass: A CSS class to be added to the menu item icon.
	 *    iconImage:    A url to the icon image.
	 *
	 *
	 * The plugin exposes the following events:
	 *    onBeforeMenuShow:   Fired before the menu is shown.  You can customize the menu or dismiss it by returning false.
	 *        Event args:
	 *            grid:     Reference to the grid.
	 *            column:   Column definition.
	 *            menu:     Menu options.  Note that you can change the menu items here.
	 *
	 *    onCommand:    Fired on menu item click for buttons with 'command' specified.
	 *        Event args:
	 *            grid:     Reference to the grid.
	 *            column:   Column definition.
	 *            command:  Button command identified.
	 *            button:   Button options.  Note that you can change the button options in your
	 *                      event handler, and the column header will be automatically updated to
	 *                      reflect them.  This is useful if you want to implement something like a
	 *                      toggle button.
	 *
	 *
	 * @param options {Object} Options:
	 *    buttonCssClass:   an extra CSS class to add to the menu button
	 *    buttonImage:      a url to the menu button image (default '../images/down.gif')
	 * @class Slick.Plugins.HeaderButtons
	 * @constructor
	 */
	function HeaderMenu(options) {
		var _grid;
		var _self = this;
		var _handler = new Slick.EventHandler();
		var _defaults = {
			buttonCssClass: null,
			buttonImage: (GridImgFolder) ? encodeURI(GridImgFolder + '/down.gif') : "../styles/images/down.gif"
		};

		var $menu;
		var $activeHeaderColumn;


		function init(grid) {
			options = $.extend(true, {}, _defaults, options);
			_grid = grid;
			_handler
				.subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
				.subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

			// Force the grid to re-render the header now that the events are hooked up.
			_grid.setColumns(_grid.getColumns());

			// Hide the menu on outside click.
			$(document.body).bind("mousedown", handleBodyMouseDown);
		}


		function destroy() {
			_handler.unsubscribeAll();
			$(document.body).unbind("mousedown", handleBodyMouseDown);
		}


		function handleBodyMouseDown(e) {
			if ($menu && $menu[0] != e.target && !$.contains($menu[0], e.target)) {
				hideMenu();
			}
		}


		function hideMenu() {
			if ($menu) {
				$menu.remove();
				$menu = null;
				$activeHeaderColumn
					.removeClass("slick-header-column-active");
			}
		}

		function handleHeaderCellRendered(e, args) {
			var column = args.column;
			var menu = column.header && column.header.menu;

			if (menu) {
				var $el = $("<div></div>")
					.addClass("slick-header-menubutton")
					.data("column", column)
					.data("menu", menu);

				if (options.buttonCssClass) {
					$el.addClass(options.buttonCssClass);
				}

				if (options.buttonImage) {
					$el.css("background-image", "url(" + options.buttonImage + ")");
				}

				if (menu.tooltip) {
					$el.attr("title", menu.tooltip);
				}

				$el
					.bind("click", showMenu)
					.appendTo(args.node);
			}
		}


		function handleBeforeHeaderCellDestroy(e, args) {
			var column = args.column;

			if (column.header && column.header.menu) {
				$(args.node).find(".slick-header-menubutton").remove();
			}
		}


		function showMenu(e) {
			// Stop propagation so that it doesn't register as a header click event.
			e.preventDefault(); e.stopPropagation();

			var $menuButton = $(this);
			var menu = $menuButton.data("menu");
			var columnDef = $menuButton.data("column");

			// Let the user modify the menu or cancel altogether,
			// or provide alternative menu implementation.
			if (_self.onBeforeMenuShow.notify({
					"grid": _grid,
					"column": columnDef,
					"menu": menu
				}, e, _self) == false) {
				return;
			}

			if (!$menu) {
				$menu = $("<div class='slick-header-menu'></div>")
					.appendTo(document.body);
			}
			$menu.empty();

			// Construct the menu items.
			for (var i = 0; i < menu.items.length; i++) {
				var item = menu.items[i];
				var $li = $("<div class='slick-header-menuitem'></div>")
					.data("command", item.command || '')
					.data("column", columnDef)
					.data("item", item)
					.bind("click", handleMenuItemClick)
					.appendTo($menu);
				if (item.disabled) { $li.addClass("slick-header-menuitem-disabled"); }
				if (item.tooltip) { $li.attr("title", item.tooltip); }
				var $icon = $("<div class='slick-header-menuicon'></div>").appendTo($li);
				if (item.iconCssClass) { $icon.addClass(item.iconCssClass); }
				if (item.iconImage) { $icon.css("background-image", "url(" + item.iconImage + ")"); }
				$("<span class='slick-header-menucontent'></span>").text(item.title).appendTo($li);
			}
			// Position the menu.
			$menu.css("top", $(this).offset().top + $(this).height()).css("left", $(this).offset().left);
			// Mark the header as active to keep the highlighting.
			$activeHeaderColumn = $menuButton.closest(".slick-header-column");
			$activeHeaderColumn.addClass("slick-header-column-active");
		}

		function handleMenuItemClick(e) {
			var command = $(this).data("command");
			var columnDef = $(this).data("column");
			var item = $(this).data("item");

			if (item.disabled) {
				return;
			}

			hideMenu();

			if (command != null && command != '') {
				_self.onCommand.notify({
						"grid": _grid,
						"column": columnDef,
						"command": command,
						"item": item
					}, e, _self);
			}

			// Stop propagation so that it doesn't register as a header click event.
			e.preventDefault(); e.stopPropagation();
		}

		$.extend(this, {
			"init": init,
			"destroy": destroy,
			"onBeforeMenuShow": new Slick.Event(),
			"onCommand": new Slick.Event()
		});
	}
})($);
