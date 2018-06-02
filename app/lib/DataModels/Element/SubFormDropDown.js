var util = require('util');

SubFormDropDown = function(id, parentId, values, bareOptions, renderFunc) {
    this.id = id;
    this.parentId = parentId;

    this.__render = renderFunc;
    this.__values = values;

    this.options = [];
    var options = (util.isArray(bareOptions) ? bareOptions : []);
    for (var option of options) {
        this.addOption(option);
    }

    this.type = SubFormDropDown.TypeId;
    this.selected = values[0] || '';
    this.width = 0;
};

SubFormDropDown.TypeId = 4;

SubFormDropDown.createFromElement = function(element) {
    return new SubFormDropDown(
        element.id,
        element.parentId,
        (element.value.indexOf("\r\n") > -1 ? element.value.split("\r\n") : [element.value]),
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

SubFormDropDown.prototype.render = function(index) {
    this.selected = '';
    if (this.__values.length > 0) {
        this.selected = (this.__values[index] || '');
    }
    return this.__render(this);
};

module.exports = SubFormDropDown;