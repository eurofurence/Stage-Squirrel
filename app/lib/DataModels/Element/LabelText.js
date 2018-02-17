LabelText = function(id, parentId, label, viewPath) {
    this.id = id;
    this.parentId = parentId;
    this.label = label;
    this.viewPath = viewPath;

    this.type = LabelText.TypeId;
};

LabelText.TypeId = 10;

LabelText.createFromElement = function(element) {
    return new LabelText(
        element.id,
        element.parentId,
        element.default,
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

module.exports = LabelText;