SingleLineTextField = function(id, parentId, label, value, renderFunc) {
    this.id = id;
    this.label = label;
    this.parentId = parentId;
    this.value = value;

    this.__render = renderFunc;

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

SingleLineTextField.prototype.render = function() {
    return this.__render(this);
};

module.exports = SingleLineTextField;