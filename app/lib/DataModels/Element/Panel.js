var Panel = function(id, label, value, viewPath) {
    this.elements = [];
    this.id = id;
    this.label = label;
    this.value = value;
    this.viewPath = viewPath;
};

Panel.TypeId = 1;

Panel.createFromElement = function(element) {
    return new Panel(element.id, element.label, element.default, '');
};

Panel.createBlank = function(id) {
    return new Panel(id || '', '', '', '');
};

module.exports = Panel;