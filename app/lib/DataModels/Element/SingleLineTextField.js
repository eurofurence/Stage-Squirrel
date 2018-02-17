SingleLineTextField = function(id, parentId, label, value, viewPath) {
    this.id = id;
    this.label = label;
    this.parentId = parentId;
    this.value = value;
    this.viewPath = viewPath;

    this.type = SingleLineTextField.TypeId;
};

SingleLineTextField.TypeId = 2;

SingleLineTextField.createFromElement = function(element) {
    return new SingleLineTextField(
        element.id,
        element.parentId,
        element.label,
        element.value,
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

module.exports = SingleLineTextField;