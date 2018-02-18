var util = require('util');

CheckBoxList = function(id, parentId, label, bareOptions, selectedOptions, renderFunc) {
    this.id = id;
    this.label = label;
    this.parentId = parentId;

    this.__render = renderFunc;

    var boxSelectionStates = {};
    var values = (util.isArray(selectedOptions) ? selectedOptions : []);
    for (var value of values) {
        boxSelectionStates[value] = true;
    }

    this.options = [];
    var options = (util.isArray(bareOptions) ? bareOptions : []);
    for (var option of options) {
        this.addOption(option, boxSelectionStates[option]);
    }

    this.recalculateWidthValues();

    this.type = CheckBoxList.TypeId;
};

CheckBoxList.TypeId = 6;

CheckBoxList.createFromElement = function(element) {
    return new CheckBoxList(
        element.id,
        element.parentId,
        element.label,
        (element.default.indexOf(';') > -1 ? element.default.split(';') : [element.default]),
        (element.value.indexOf(';') > -1 ? element.value.split(';') : [element.value]),
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

CheckBoxList.prototype.recalculateWidthValues = function() {
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

CheckBoxList.prototype.addOption = function(option, isSelected) {
    this.options.push({
        id: (this.options.length + 1),
        isSelected: (isSelected === true),
        value: option,
    });
};

CheckBoxList.prototype.render = function() {
    return this.__render(this);
};

module.exports = CheckBoxList;