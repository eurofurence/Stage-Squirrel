var Panel = function(id, label, value, renderFunc) {
    this.elements = [];
    this.id = id;
    this.label = label;
    this.value = value;

    this.__render = renderFunc;
};

Panel.TypeId = 1;

Panel.createFromElement = function(element) {
    return new Panel(
        element.id,
        element.label,
        element.default,
        require('../../getPartialByFormElementType')(element.type, true)
    );
};

Panel.createBlank = function(id) {
    return new Panel(id || '', '', '', '');
};

Panel.prototype.render = function() {
    return this.__render(this);
};

module.exports = Panel;