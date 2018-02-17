var util = require('util');

DropDownList = function(id, parentId, label, selected, bareOptions, viewPath) {
    this.id = id;
    this.label = label;
    this.parentId = parentId;
    this.selected = selected;
    this.viewPath = viewPath;

    this.options = [];
    var options = (util.isArray(bareOptions) ? bareOptions : []);
    for (var option of options) {
        this.addOption(option);
    }

    this.type = DropDownList.TypeId;
    this.width = (this.label.length > 0 ? 6 : 12);
};

DropDownList.TypeId = 4;

DropDownList.createFromElement = function(element) {
    return new DropDownList(
        element.id,
        element.parentId,
        element.label,
        element.currentValue,
        (element.default.indexOf(';') > -1 ? element.default.split(';') : [element.default]),
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

DropDownList.prototype.addOption = function(option) {
    this.options.push({
        id: (this.options.length + 1),
        value: option,
    });
};

module.exports = DropDownList;