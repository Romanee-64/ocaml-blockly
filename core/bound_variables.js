/**
 * @fileoverview Utility functions for variable binding.
 * @author harukam0416@gmail.com (Haruka Matsumoto)
 */
'use strict';

/**
 * @name Blockly.BoundVariables
 * @namespace
 **/
goog.provide('Blockly.BoundVariables');

goog.require('Blockly.BoundVariableValue');
goog.require('Blockly.BoundVariableValueReference');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Create a value on the given block.
 * @param {!Blockly.Block} block The block to add the value to.
 * @param {string} fieldName The name of the variable field.
 * @param {!Blockly.TypeExpr} valueTypeExpr The type for the value.
 * @param {string} scopeInputName The name of input on which the variable value
 *     is visible.
 * @param {!string} variableName The default name of this variable value.
 */
Blockly.BoundVariables.createValue = function(block, fieldName, valueTypeExpr,
      scopeInputName, variableName) {
  return new Blockly.BoundVariableValue(block, fieldName, valueTypeExpr,
      scopeInputName, variableName);
};

/**
 * Adds a value to the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to add the value to.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.addValue = function(workspace, value) {
  var block = value.getSourceBlock();
  var fieldName = value.getContainerFieldName();

  if (block.typedValue[fieldName] || value.inBlockDB) {
    throw 'The value is already added to the variable map of other block.';
  }
  block.typedValue[fieldName] = value;
  value.inBlockDB = true;

  var id = value.getId();
  var valueDB = workspace.getValueDB();

  if (valueDB[id] || value.inWorkspaceDB) {
    throw 'The value already exists in DB.';
  }
  valueDB[id] = value;
  value.inWorkspaceDB = true;
};

/**
 * Remove a value from the list of values.
 * @param {!Blockly.Workspace} workspace The workspace to remove the value
 *     from.
 * @param {!Blockly.BoundVariableValue}
 */
Blockly.BoundVariables.removeValue = function(workspace, value) {
  var block = value.getSourceBlock();
  var fieldName = value.getContainerFieldName();

  if (value.inBlockDB && !block.typedValue[fieldName]) {
    throw 'The value doesn\'t exist in DB.';
  }
  delete block.typedValue[fieldName];
  value.inBlockDB = false;

  var id = value.getId();
  var valueDB = workspace.getValueDB();

  if (value.inWorkspaceDB && !valueDB[id]) {
    throw 'The value doesn\'t exist in DB.';
  }
  delete valueDB[id];
  value.inWorkspaceDB = false;
};

/**
 * Find the value on workspace workspace with the specified ID.
 * @param {!Blockly.Workspace} workspace The workspace to search for the value.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.BoundVariableValue} The sought after value or null.
 */
Blockly.BoundVariables.getValueById = function(workspace, id) {
  var valueDB = workspace.getValueDB();
  return valueDB[id] || null;
};

/**
 * Create a reference on the given block.
 * @param {!Blockly.Block} block The block to add the reference to.
 * @param {string} fieldName The name of the variable field.
 * @param {!Blockly.TypeExpr} typeExpr The type expression of the variable.
 * @param {!string} name The default variable name.
 */
Blockly.BoundVariables.createReference = function(block, fieldName, typeExpr,
    name) {
  return new Blockly.BoundVariableValueReference(block, fieldName, typeExpr,
    name);
};

/**
 * Add the reference to the given workspace.
 * @param {!Blockly.Workspace} workspce The workspace to add the reference to.
 * @param {!Blockly.BoundVariableValueReference} The reference to add.
 */
Blockly.BoundVariables.addReference = function(workspace, reference) {
  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB();

  if (referenceDB[id] || reference.inWorkspaceDB) {
    throw 'The reference ID already exists in the DB.';
  }
  referenceDB[id] = reference;
  reference.inWorkspaceDB = true;
};

/**
 * Remove the reference with the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace to remove the reference
 *     from.
 * @param {!Blockly.BoundVariableValueReference} The reference to remove.
 */
Blockly.BoundVariables.removeReference = function(workspace, reference) {
  var id = reference.getId();
  var referenceDB = workspace.getReferenceDB();

  if (!referenceDB[id] || !reference.inWorkspaceDB) {
    throw 'The reference doesn\'t exist in DB.';
  }
  delete referenceDB[id];
  reference.inWorkspaceDB = false;
};

/**
 * Look up a reference on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     reference.
 * @param {string} id The ID to use to look up the variable, or null.
 * @return {Blockly.BoundVariableValueReference} The sought after reference or
 *     null.
 */
Blockly.BoundVariables.getReferenceById = function(workspace, id) {
  var referenceDB = workspace.getReferenceDB();
  return referenceDB[id] || null;
};

/**
 * Clear the database of variables on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace whose variable database
 *     to be cleared.
 */
Blockly.BoundVariables.clearWorkspaceVariableDB = function(workspace) {
  function clearVariableDB(db) {
    var ids = Object.keys(db);
    for (var i = 0, id; id = ids[i]; i++) {
      var variable = db[id];
      if (!variable.inWorkspaceDB) {
        throw 'Invalid status.';
      }
      variable.inWorkspaceDB = false;
      delete db[id];
    }
  }
  var referenceDB = workspace.getReferenceDB();
  var valueDB = workspace.getValueDB();
  clearVariableDB(referenceDB);
  clearVariableDB(valueDB);
};

/**
 * Clear variable-binding relation of the references which share the same root
 * block with the given block, and refer to the value existing in the block or
 * its nested blocks.
 * @param {!Blockly.Block} block The block whose cyclic references to be
 *     removed.
 */
Blockly.BoundVariables.clearCyclicReferenceOnBlock = function(block) {
  function clearCyclicReferenceImpl(childBlock) {
    var names = Object.keys(childBlock.typedValue);
    for (var i = 0, name; name = names[i]; i++) {
      var value = childBlock.typedValue[name];
      value.clearCyclicReference();
    }
  }
  var descendants = block.getDescendants();
  for (var i = 0, childBlock; childBlock = descendants[i]; i++) {
    clearCyclicReferenceImpl(childBlock);
  }
};

/**
 * Get whether the given variable name is unique on the related workspaces.
 * @param {!string} name The name of variable.
 * @param {!Blockly.Workspace} workspace The workspace to specify a group of
 *     related workspaces. Check if these workspaces don't have a variable of
 *     the given name.
 * @return {boolean} True if the name is unique on the related workspaces.
 */
Blockly.BoundVariables.isUniqueName = function(name, workspace) {
  var workspaceFamily = Blockly.WorkspaceTree.getFamily(workspace);
  for (var i = 0, ws; ws = workspaceFamily[i]; i++) {
    var valueDB = ws.getValueDB();
    var keys = Object.keys(valueDB);
    for (var j = 0, key; key = keys[j]; j++) {
      var value = valueDB[key];
      if (value.getVariableName() === name) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Find all root blocks without duplicates which contain the given variables
 * inside or directly.
 * @param {!Array.<!Blockly.BoundVariableAbstract>} variables The list of
 *     variables.
 * @param {boolean=} opt_bounds If true, also collect root blocks which contain
 *     bound variables of each variable in the list.
 * @return {!Array.<!Blockly.Block>} Root blocks which contain any variable
 *     existing in the give list.
 */
Blockly.BoundVariables.getAllRootBlocks = function(variables, opt_bounds) {
  var targetVariables = [];
  if (opt_bounds === true) {
    for (var i = 0, variable; variable = variables[i]; i++) {
      var bounds = variable.getAllBoundVariables();
      Array.prototype.push.apply(targetVariables, bounds);
    }
  } else {
    targetVariables = variables;
  }
  var rootBlocks = [];
  for (var i = 0, variable; variable = targetVariables[i]; i++) {
    var block = variable.getSourceBlock();
    var root = block.getRootBlock();
    if (rootBlocks.indexOf(root) == -1) {
      rootBlocks.push(root);
    }
  }
  return rootBlocks;
};

/**
 * Returns a list of values without duplicates that the given references refer
 * to.
 * @param {!Array.<!Blockly.BoundVariableValueReference>} references A list of
 *     references whose variables values to get.
 * @return {!Array.<!Blockly.BoundVariableValue>} A list of values.
 */
Blockly.BoundVariables.getValuesFromReferenceList = function(references) {
  var values = [];
  for (var i = 0, reference; reference = references[i]; i++) {
    var value = reference.getBoundValue();
    if (value && values.indexOf(value) == -1) {
      values.push(value);
    }
  }
  return values;
};

/**
 * Collects all of variables which exist in or inside the given block.
 * @param {!Blockly.Block} block The block to search for variables.
 * @param {boolean=} opt_filter If true, collect only variable references. If
 *     false, collect only values. If not provided, include both of them.
 * @return {!Array.<!Blockly.BoundVariableAbstract>} List of variables.
 */
Blockly.BoundVariables.getAllVariablesOnBlocks = function(block, opt_filter) {
  var variables = [];
  var descendants = block.getDescendants();
  for (var i = 0, block; block = descendants[i]; i++) {
    Array.prototype.push.apply(variables, block.getVariables(opt_filter));
  }
  return variables;
};

/**
 * Returns if any variable references will never be changed when the variable
 * is renamed to the given name.
 * @param {!Blockly.BoundVariableAbstract} variable The variable to be renamed.
 * @param {!string} The variable's new name.
 * @return {boolean} True if the renaming is valid.
 */
Blockly.BoundVariables.canRenameTo = function(variable, newName) {
  if (!Blockly.BoundVariables.isLegalName(variable, newName)) {
    return false;
  }
  var oldName = variable.getVariableName();
  if (oldName === newName) {
    return true;
  }
  if (Blockly.BoundVariables.isUniqueName(newName, variable.getWorkspace())) {
    return true;
  }

  var renamedVars = variable.getAllBoundVariables();
  var renamedTopBlocks = Blockly.BoundVariables.getAllRootBlocks(renamedVars);

  var failedIndex = 0;
  variable.setVariableName(newName);
  try {
    failedIndex = goog.array.findIndex(renamedTopBlocks, function(block) {
        return !block.isInFlyout && !block.resolveReference(null);
      });
  } finally {
    variable.setVariableName(oldName);
  }
  return failedIndex < 0;
};

/**
 * Return a list of variables visible in the scope of the given field.
 * @param {!Blockly.BoundVariableAbstract} variable
 * @return {!Array.<Blockly.BoundVariableValue>} List of variable values which
 *     is visible.
 */
Blockly.BoundVariables.getVisibleVariableValues = function(variable) {
  var field = variable.getContainerField();
  var block = variable.getSourceBlock();
  var targetBlock = block.outputConnection.targetBlock();
  if (!variable.isReference()) {
    throw 'Not support for a variable value.';
  }
  var values = [];
  if (targetBlock) {
    var targetConnection = block.outputConnection.targetConnection;
    var env = targetBlock.allVisibleVariables(targetConnection);
    var names = Object.keys(env);
    for (var i = 0, name; name = names[i]; i++) {
      var variable = env[name];
      values.push(variable);
    }
  }
  return values;
};

/**
 * Returns whether the given name is legal as a variable name.
 * @param {!Blockly.BoundVariableAbstract} variable The variable to rename.
 * @param {string} newName The new variable name.
 * @return {boolean} True if the name is legal.
 */
Blockly.BoundVariables.isLegalName = function(variable, newName) {
  if (!newName) {
    return false;
  }
  // Remove all whitespace.
  newName = newName.replace(/\s/g, '');
  // Check if a string follows the naming convention.
  if (newName.match(/^[a-z_]\w*$/) == null) {
    return false;
  }
  if (variable.isReference()) {
    if (newName === '_') {
      // Can not refer to wildcard.
      return false;
    }
  } else {
    if (newName === '_') {
      throw 'Not implemented yet.';
    }
  }
  return true;
};

/**
 * Helper function for renaming the variable as the given name.
 * @param {Blockly.BoundVariableAbstract} variable The variable to rename.
 * @param {string} newName The new variable name.
 * @return {boolean} True if variable is renamed. Otherwise, false.
 */
Blockly.BoundVariables.renameVariableImpl_ = function(variable, newName) {
  if (Blockly.BoundVariables.canRenameTo(variable, newName)) {
    variable.setVariableName(newName);
    return true;
  } else {
    return false;
  }
};

/**
 * Rename the given variable. Open a user prompt dialog to get a new variable
 * name.
 * @param {!Blockly.BoundVariableAbstract} variable The variable to rename.
 */
Blockly.BoundVariables.renameVariable = function(variable) {
  var promptAndCheckWithAlert = function(defaultName) {
    var name = variable.getVariableName();
    var promptText =
        Blockly.Msg['RENAME_VARIABLE_TITLE'].replace('%1', name);
    Blockly.prompt(promptText, defaultName,
        function(newName) {
          if (!newName) {
            // NOP. User canceled prompt.
          } else {
            var changed = Blockly.BoundVariables.renameVariableImpl_(variable,
                newName);
            if (!changed) {
              // TODO: Define the message in the Blockly.Msg class.
              var msg = 'Invalid variable name!';
              Blockly.alert(msg, promptAndCheckWithAlert.bind(null, defaultName));
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};
