var util = require('util');

SubFormDropDown = function(id, parentId, selected, bareOptions, viewPath) {
    this.id = id;
    this.parentId = parentId;
    this.selected = selected;
    this.viewPath = viewPath;

    this.options = [];
    var options = (util.isArray(bareOptions) ? bareOptions : []);
    for (var option of options) {
        this.addOption(option);
    }

    this.type = SubFormDropDown.TypeId;
    this.width = 0;
};

SubFormDropDown.TypeId = 4;

SubFormDropDown.createFromElement = function(element) {
    return new SubFormDropDown(
        element.id,
        element.parentId,
        element.value,
        (element.default.indexOf(';') > -1 ? element.default.split(';') : [element.default]),
        require('../../getPartialByFormElementType')(element.type, false)
    );
};

SubFormDropDown.prototype.addOption = function(option) {
    this.options.push({
        id: (this.options.length + 1),
        value: option,
    });
};

SubFormDropDown.prototype.forValueIndex = function(index) {
    return this;
};

module.exports = SubFormDropDown;