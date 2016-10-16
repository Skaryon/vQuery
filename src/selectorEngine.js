
var CssSelectorParser = require('css-selector-parser').CssSelectorParser,
    sparser = new CssSelectorParser(),
    vDOM = require('./vDOM.js');

sparser.registerSelectorPseudos('has', 'not');
sparser.registerNestingOperators('>', '+', '~');
sparser.registerAttrEqualityMods('^', '$', '*', '~');
sparser.enableSubstitutes();

function hasMoreRules(rules) {
    return typeof rules.rule !== "undefined" || typeof rules.ruleSet !== "undefined"|| typeof rules.selectors !== "undefined";
}

function getNextRules(rules) {
    if (typeof rules.ruleSet !== "undefined")
        return [rules.ruleSet];
    if (typeof rules.selectors !== "undefined")
        return rules.selectors.map(function(item) {
            return item.rule
        });
    else return [rules.rule];
};

function checkClasses(rules, node) {
    if (typeof rules.classNames === "undefined")
        return true;
    for (var i=0; i<rules.classNames.length; i++) {
        if (node.classNames.indexOf(rules.classNames[i]) === -1)
            return false;
    }
    return true;
}

function checkTagName(rules, node) {
    if (typeof rules.tagName === "undefined")
        return true;
    if (rules.tagName === node.name)
        return true;
    return false;    
}

function checkID(rules, node) {
    if (typeof rules.id === "undefined")
        return true;
    if (rules.id === node.id)
        return true;
    return false;    
}

function checkPseudos(rules, node) {
    if (typeof rules.pseudos === "undefined")
        return true;
    var pseudos = rules.pseudos;
    for (var i=0; i<pseudos.length; i++) {
        var pseudo = pseudos[i];
        switch(pseudo.name) {
            case "first-child":
            case "last-child":
            case "only-child":
            case "nth-child":
            case "nth-last-child":
                var children = node.parentNode.children;
                if (typeof rules.tagName !== "undefined")
                    children = children.filter(function(child) {
                        return child.name === rules.tagName;
                    });
                switch(pseudo.name) {
                    case "first-child":
                        return children.indexOf(node) === 0;
                    case "last-child":
                        return children.indexOf(node) === children.length - 1;
                    case "nth-child":
                        return children.indexOf(node) + 1 === parseInt(pseudo.value);
                    case "nth-last-child":
                        return children.reverse().indexOf(node) + 1 === parseInt(pseudo.value);
                    case "only-child":
                        return children.length === 1;
                }
            case "has":
                var selectedNodes = [],
                nextRules = getNextRules(pseudo.value);
                for (var i = 0; i < node.children.length; i++) {
                    traverseVDOM(nextRules, node.children[i], selectedNodes, nextRules.nestingOperator === ">", true);
                }
                return selectedNodes.length > 0;
            case "not":
                var selectedNodes = [],
                nextRules = getNextRules(pseudo.value);
                traverseVDOM(nextRules, node, selectedNodes, nextRules.nestingOperator === ">", true);
                return selectedNodes.length === 0;
        }
    }
    return false;    
}
var checks = [
    checkTagName,
    checkID,
    checkClasses,
    checkPseudos
]
checkHits = function(rules, currentVDOM) {
    var res = true;
    for (var i=0; i<checks.length; i++) {
        if (!checks[i](rules, currentVDOM))
            return false;
    }
    return true;
}

function traverseVDOM(rules, currentVDOM, selectedNodes, exact, pseudoMode) {
    for (var r=0; r<rules.length; r++) {
        var rule = rules[r];
        if (rule.id && !pseudoMode) {
            var idNode = vDOM.idNodes[rule.id];
            if (typeof idNode !== "undefined" && idNode.length !== []) {
                if (!hasMoreRules(rule)) {
                    if (selectedNodes.indexOf(idNode) === -1)
                        selectedNodes.push(idNode);
                }
                else {
                    var nextRules = getNextRules(rule);
                    for (var i = 0; i < idNode.children.length; i++) {
                        traverseVDOM(nextRules, idNode.children[i], selectedNodes, nextRules.nestingOperator === ">", pseudoMode);
                    }
                }
                continue;
            }
        }
        if (checkHits(rule, currentVDOM)) {
            if (!hasMoreRules(rule)) {
                if (selectedNodes.indexOf(currentVDOM) === -1)
                    selectedNodes.push(currentVDOM);
            }
            else {
                var nextRules = getNextRules(rule);
                for (var i = 0; i < currentVDOM.children.length; i++) {
                    traverseVDOM(nextRules, currentVDOM.children[i], selectedNodes, nextRules.nestingOperator === ">", pseudoMode);
                }
            }
        } else
            if (!exact && currentVDOM.children.length > 0)
                for (var i = 0; i < currentVDOM.children.length; i++)
                    traverseVDOM(rules, currentVDOM.children[i], selectedNodes, pseudoMode);
    }
}

module.exports.query = function(virtualNode, selector) {
    var parsedSelector = sparser.parse(selector),
        selectedNodes = [],
        nextRules = getNextRules(parsedSelector);
    
    if (hasMoreRules(parsedSelector))
        traverseVDOM(nextRules, virtualNode.children[0], selectedNodes, nextRules.nestingOperator === ">", false);
    return selectedNodes;
}