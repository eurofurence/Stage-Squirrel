var util = require('util');

SubFormText = function(id, parentId, label, values, isMultiLine, renderFunc) {
    this.id = id;
    this.isMultiLine = isMultiLine;
    this.label = label;
    this.parentId = parentId;

    this.__render = renderFunc;
    this.__values = values;

    this.type = SubFormLabel.TypeId;
    this.value = values[0] || '';
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

SubFormText.prototype.render = function(index) {
    this.value = '';
    if (this.__values.length > 0) {
        this.value = (this.__values[index] || '');
    }
    return this.__render(this);
};

module.exports = SubFormText;