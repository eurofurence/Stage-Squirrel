var util = require('util');

RadioBoxList = function(id, parentId, label, bareOptions, selectedOptions, renderFunc) {
    this.id = id;
    this.label = label;
    this.parentId = parentId;

    this.__render = renderFunc;

    var buttonSelectionStates = {};
    var values = (util.isArray(selectedOptions) ? selectedOptions : []);
    for (var value of values) {
        buttonSelectionStates[value] = true;
    }

    this.options = [];
    var options = (util.isArray(bareOptions) ? bareOptions : []);
    for (var option of options) {
        this.addOption(option, buttonSelectionStates[option]);
    }

    this.recalculateWidthValues();

    this.type = RadioBoxList.TypeId;
};

RadioBoxList.TypeId = 7;

RadioBoxList.createFromElement = function(element) {
    return new RadioBoxList(
        element.id,
        element.parentId,
        element.label,
        (element.default.indexOf(';') > -1 ? element.default.split(';') : [element.default]),
        (element.value.indexOf(';') > -1 ? element.value.split(';') : [element.value]),
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

RadioBoxList.prototype.recalculateWidthValues = function() {
    var labelWidth = 12;
    var valueWidth = 2;

    if (this.options.length == 2) {
        labelwidth = 6;
        valuewidth = 3;
    } else if (this.options.length == 3) {
        labelwidth = 6;
        valuewidth = 2;
    } else if (this.options.length == 4) {
        valuewidth = 3;
    }

    this.labelWidth = labelWidth;
    this.valueWidth = valueWidth;
};

RadioBoxList.prototype.addOption = function(option, isSelected) {
    this.options.push({
        id: (this.options.length + 1),
        isSelected: (isSelected === true),
        value: option,
    });
};

RadioBoxList.prototype.render = function() {
    return this.__render(this);
};

module.exports = RadioBoxList;