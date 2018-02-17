var getPartialByFormElementType = require('../../getPartialByFormElementType');

SubFormLineCount = function(id, parentId, viewPath) {
    this.id = id;
    this.parentId = parentId;
    this.viewPath = viewPath;

    this.lineNumber = 1;
    this.type = SubFormLineCount.TypeId;
    this.width = 0;
};

SubFormLineCount.TypeId = 9;

SubFormLineCount.createFromElement = function(element) {
    return new SubFormLineCount(
        element.id,
        element.parentId,
        require('../../getPartialByFormElementType')(element.type, false)
    );
};

SubFormLineCount.prototype.forValueIndex = function(index) {
    this.lineNumber = Math.max(1, index + 1);
    return this;
};

module.exports = SubFormLineCount;