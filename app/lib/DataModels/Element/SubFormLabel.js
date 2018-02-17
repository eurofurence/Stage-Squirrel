SubFormLabel = function(id, parentId, label, viewPath) {
    this.id = id;
    this.parentId = parentId;
    this.label = label;
    this.viewPath = viewPath;

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

SubFormLabel.prototype.forValueIndex = function(index) {
    return this;
};

module.exports = SubFormLabel;