var ejs = require('ejs');
var fs = require('fs');

var CheckBoxList = require('./DataModels/Element/CheckBoxList');
var DropDownList = require('./DataModels/Element/DropDownList');
var LabelText = require('./DataModels/Element/LabelText');
var MultiLineTextField = require('./DataModels/Element/MultiLineTextField');
var Panel = require('./DataModels/Element/Panel');
var RadioBoxList = require('./DataModels/Element/RadioBoxList');
var SingleLineTextField = require('./DataModels/Element/SingleLineTextField');
var SubForm = require('./DataModels/Element/SubForm');
var SubFormDropDown = require('./DataModels/Element/SubFormDropDown');
var SubFormLabel = require('./DataModels/Element/SubFormLabel');
var SubFormLineCount = require('./DataModels/Element/SubFormLineCount');
var SubFormText = require('./DataModels/Element/SubFormText');

var templateMap = [{}, {}];

templateMap[0][CheckBoxList.TypeId] = 'checkboxes';
templateMap[0][DropDownList.TypeId] = 'dropdownlist';
templateMap[0][LabelText.TypeId] = 'labeltext';
templateMap[0][MultiLineTextField.TypeId] = 'textfield-multi';
templateMap[0][Panel.TypeId] = 'panel';
templateMap[0][RadioBoxList.TypeId] = 'radioboxes';
templateMap[0][SingleLineTextField.TypeId] = 'textfield-single';
templateMap[0][SubForm.TypeId] = 'subform';

templateMap[1][SubFormDropDown.TypeId] = 'subform/dropdown';
templateMap[1][SubFormLabel.TypeId] = 'subform/label';
templateMap[1][SubFormLineCount.TypeId] = 'subform/linecount';
templateMap[1][SubFormText.TypeId] = 'subform/text';

var defaultTemplate = ejs.compile('');
var templateDirectory = (process.cwd() + '/views/partials/form-element/');

for (var panelType in templateMap) {
    for (var templateId in templateMap[panelType]) {
        var templatePath = (templateDirectory + templateMap[panelType][templateId] + '.ejs');
        var template = fs.readFileSync(templatePath, 'utf8');
        templateMap[panelType][templateId] = ejs.compile(template);
    }
}

module.exports = function(type, isPanelType) {
    var panelTypeIndex = (isPanelType === true ? 0 : 1);
    return (templateMap[panelTypeIndex][type] || defaultTemplate);
};