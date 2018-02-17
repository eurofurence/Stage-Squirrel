var util = require('util');

SubFormText = function(id, parentId, label, values, isMultiLine, viewPath) {
    this.id = id;
    this.isMultiLine = isMultiLine;
    this.label = label;
    this.parentId = parentId;
    this.viewPath = viewPath;

    this.__values = values;

    this.type = SubFormLabel.TypeId;
    this.value = value[0] || '';
    this.width = 0;
};

SubFormText.TypeId = 3;

SubFormText.createFromElement = function(element) {
    return new SubFormText(
        element.id,
        element.parentId,
        element.label,
        (element.value.indexOf(';') > -1 ? element.value.split(';') : [element.value]),
        (element.tags.search('multiline') > -1),
        require('../../getPartialByFormElementType')(element.type, false)
    );
};

SubFormText.prototype.forValueIndex = function(index) {
    this.value = '';
    if (this.__values.length > 0) {
        this.value = (this.__values[index] || '');
    }
    return this;
};

module.exports = SubFormText;