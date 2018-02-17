var Element = require('../lib/DataModels/Element');

module.exports = function(elementRows, customDataMap) {
    if (elementRows === undefined) {
        return [];
    }

    // Build first two layers of
    // tree structure from table entries,
    // based on type
    var panels = {};
    var normalElements = [];
    var subForms = {};

    for (var elementRow of elementRows) {
        var customValue = customDataMap[elementRow.element_id];
        var element = Element.createFromTableRow(elementRow, customValue);

        if (element.isPanel()) {
            panels[element.id] = Element.toTypeObject(element, true);
        } else if (element.isSubForm()) {
            subForms[element.id] = Element.toTypeObject(element, true);
        } else if (element.isNormalElement()) {
            normalElements.push(element);
        }
    }

    for (var normalElement of normalElements) {
        if (panels[normalElement.parentId]) {
            var panelElement = Element.toTypeObject(normalElement, true);
            if (panelElement !== null) {
                panels[normalElement.parentId].elements.push(panelElement);
            }
        } else if (subForms[normalElement.parentId]) {
            var subFormElement = Element.toTypeObject(normalElement, false);
            if (subFormElement !== null) {
                subForms[normalElement.parentId].elements.push(subFormElement);
            }
        }
    }

    for (var panelId in subForms) {
        var subForm = subForms[panelId];
        if (panels[subForm.parentId]) {
            panels[subForm.parentId].elements.push(subForm.syncInternals());
        }
    }

    // TODO: upgrade "node" to version with full ES6 support for Object.values(...) ...
    var result = [];
    for (var id in panels) {
        result.push(panels[id]);
    }

    return result;
};