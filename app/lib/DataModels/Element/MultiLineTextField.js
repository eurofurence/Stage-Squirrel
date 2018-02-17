MultiLineTextField = function(id, parentId, label, value, isMultiLine, viewPath) {
    this.id = id;
    this.parentId = parentId;
    this.label = label;
    this.value = value;
    this.isMultiLine = isMultiLine;
    this.viewPath = viewPath;

    this.type = MultiLineTextField.TypeId;
};

MultiLineTextField.TypeId = 3;

MultiLineTextField.createFromElement = function(element) {
    return new MultiLineTextField(
        element.id,
        element.parentId,
        element.label,
        element.value,
        (element.tags.search('multiline') > -1),
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

module.exports = MultiLineTextField;