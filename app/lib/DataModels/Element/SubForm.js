SubForm = function(id, parentId, headlines, isExpandable, viewPath) {
    this.headlines = headlines;
    this.id = id;
    this.isExpandable = isExpandable;
    this.parentId = parentId;
    this.viewPath = viewPath;

    this.elements = [];
    this.rowCount = 1;
    this.type = SubForm.TypeId;
    this.width = 0;
};

SubForm.TypeId = 8;

SubForm.createFromElement = function(element) {
    return new SubForm(
        element.id,
        element.parentId,
        (element.label.indexOf(';') > -1 ? element.label.split(';') : []),
        (element.tags.search('no-expand') === -1),
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

SubForm.prototype.syncInternals = function() {
    this.__recalculateRowCount();
    this.__recalculateWidth();

    for (var element of this.elements) {
        element.width = this.width;
    }

    return this;
};

SubForm.prototype.__recalculateRowCount = function() {
    this.rowCount = 1;
    if (this.elements.length > 0 && this.elements[0].currentValue) {
        this.rowCount = Math.max(
            this.rowCount,
            this.elements[0].currentValue.length
        );
    }
    if (this.rowCoun == 1 && this.elements.length > 1 && this.elements[1].currentValue) {
        this.rowCount = Math.max(
            this.rowCount,
            this.elements[1].currentValue.length
        );
    }
};

SubForm.prototype.__recalculateWidth = function() {
    if (this.elements.length > 0) {
        this.width = (12 / this.elements.length);
    } else if (this.headlines.length > 0) {
        this.width = (12 / this.headlines.length);
    }
};

module.exports = SubForm;