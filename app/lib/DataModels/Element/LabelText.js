LabelText = function(id, parentId, label, renderFunc) {
    this.id = id;
    this.parentId = parentId;
    this.label = label;

    this.__render = renderFunc;

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

LabelText.prototype.render = function() {
    return this.__render(this);
};

module.exports = LabelText;