var Element = function(id, label, tags, type, currentValue, defaultValue, parentId) {
    this.default = defaultValue;
    this.id = id;
    this.label = label;
    this.parentId = parentId;
    this.tags = tags;
    this.type = type;
    this.value = currentValue;
};

Element.CheckBoxList = require('./Element/CheckBoxList');
Element.DropDownList = require('./Element/DropDownList');
Element.LabelText = require('./Element/LabelText');
Element.MultiLineTextField = require('./Element/MultiLineTextField');
Element.Panel = require('./Element/Panel');
Element.RadioBoxList = require('./Element/RadioBoxList');
Element.SingleLineTextField = require('./Element/SingleLineTextField');
Element.SubForm = require('./Element/SubForm');
Element.SubFormDropDown = require('./Element/SubFormDropDown');
Element.SubFormLabel = require('./Element/SubFormLabel');
Element.SubFormLineCount = require('./Element/SubFormLineCount');
Element.SubFormText = require('./Element/SubFormText');

Element.createFromTableRow = function(row, currentValue) {
    return new Element(
        (row.element_id || 0) + 0,
        row.element_label || '',
        row.element_tags || '',
        (row.element_type || 0) + 0,
        currentValue || '',
        row.element_value || '',
        (row.parent_id || 0) + 0
    );
};

Element.prototype.isPanel = function() {
    return (this.type === Element.Panel.TypeId);
};

Element.prototype.isSubForm = function() {
    return (this.type === Element.SubForm.TypeId);
};

Element.prototype.isNormalElement = function() {
    return (!this.isPanel() && !this.isSubForm() && this.parentId !== 0);
};

function toPanelTypeObject(element) {}

Element.toTypeObject = function(element, isPanelType) {
    if (isPanelType === true) {
        switch (element.type) {
            case Element.CheckBoxList.TypeId:
                return Element.CheckBoxList.createFromElement(element);
            case Element.DropDownList.TypeId:
                return Element.DropDownList.createFromElement(element);
            case Element.LabelText.TypeId:
                return Element.LabelText.createFromElement(element);
            case Element.MultiLineTextField.TypeId:
                return Element.MultiLineTextField.createFromElement(element);
            case Element.Panel.TypeId:
                return Element.Panel.createFromElement(element);
            case Element.RadioBoxList.TypeId:
                return Element.RadioBoxList.createFromElement(element);
            case Element.SingleLineTextField.TypeId:
                return Element.SingleLineTextField.createFromElement(element);
            case Element.SubForm.TypeId:
                return Element.SubForm.createFromElement(element);
        }
    }
    if (isPanelType === false) {
        switch (element.type) {
            case Element.SubFormDropDown.TypeId:
                return Element.SubFormDropDown.createFromElement(element);
            case Element.SubFormLabel.TypeId:
                return Element.SubFormLabel.createFromElement(element);
            case Element.SubFormLineCount.TypeId:
                return Element.SubFormLineCount.createFromElement(element);
            case Element.SubFormText.TypeId:
                return Element.SubFormText.createFromElement(element);
        }
    }
    return null;
};

module.exports = Element;