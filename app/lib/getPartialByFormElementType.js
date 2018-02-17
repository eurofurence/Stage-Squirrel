var templateMap = [{}, {}];

templateMap[0][require('./DataModels/Element/SubFormDropDown').TypeId] = 'dropdown';
templateMap[0][require('./DataModels/Element/SubFormLabel').TypeId] = 'label';
templateMap[0][require('./DataModels/Element/SubFormLineCount').TypeId] = 'linecount';
templateMap[0][require('./DataModels/Element/SubFormText').TypeId] = 'text';

templateMap[1][require('./DataModels/Element/CheckBoxList').TypeId] = 'checkboxes';
templateMap[1][require('./DataModels/Element/DropDownList').TypeId] = 'dropdownlist';
templateMap[1][require('./DataModels/Element/LabelText').TypeId] = 'labeltext';
templateMap[1][require('./DataModels/Element/MultiLineTextField').TypeId] = 'textfield-multi';
templateMap[1][require('./DataModels/Element/Panel').TypeId] = 'panel';
templateMap[1][require('./DataModels/Element/RadioBoxList').TypeId] = 'radioboxes';
templateMap[1][require('./DataModels/Element/SingleLineTextField').TypeId] = 'textfield-single';
templateMap[1][require('./DataModels/Element/SubForm').TypeId] = 'subform';

var templatePrefix = [
    'subform/',
    'partials/form-element/'
];

module.exports = function(type, isPanelType) {
    var panelTypeIndex = (isPanelType === true ? 1 : 0);
    return (
        templatePrefix[panelTypeIndex] +
        (templateMap[panelTypeIndex][type] || '')
    );
};