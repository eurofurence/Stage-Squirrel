SubFormLabel = function(id, parentId, label, renderFunc) {
    this.id = id;
    this.parentId = parentId;
    this.label = label;

    this.__render = renderFunc;

    this.type = SubFormLabel.TypeId;
    this.width = 0;
};

SubFormLabel.TypeId = 2;

SubFormLabel.createFromElement = function(element) {
    return new SubFormLabel(
        element.id,
        element.parentId,
        element.label,
        require('../../getPartialByFormElementType')(element.type, false)
    );
};

SubFormLabel.prototype.render = function() {
    return this.__render(this);
};

module.exports = SubFormLabel;