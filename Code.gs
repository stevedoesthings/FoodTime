var ss = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/18aME08MrF3hXriGBL3gGDtTwnJF9sCL3xmTmd_FbaF8/edit#gid=899331526');

/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

/**
 * Get "home page", or a requested page.
 * Expects a 'page' parameter in querystring.
 *
 * @param {event} e Event passed to doGet, with querystring
 * @returns {String/html} Html to be served
 */

function doGet(e) {

  if (!e.parameter.page) {
    return HtmlService.createTemplateFromFile('index')
    .evaluate();
  }
  return HtmlService.createTemplateFromFile(e.parameter['page'])
  .evaluate();
}

function Inventory(which) {

    var sheet = ss.getSheetByName(which);
    
    var data = sheet.getRange('A1:'+sheet.getLastRow()).getValues();
    var list = [];
    var dataLen = data.length;
  
    if (data !== null) {
		for (var i = 0; i < dataLen; i++) {
		  list.push(data[i][0]);
		}
		
		var adjList = 'blank'
        var len = list.length;
        var i = 0;
		
		for (i; i < len; i++){
		  if (adjList == 'blank'){
			adjList = which + ',' + list[i];
		  } else {
			adjList = adjList + ',' + list[i];
		  }
		}    
    } else {
      return;
    }
    return adjList;
}

function setupInfoWindow(listName, row){
  
  if (listName == 1){
      var sheet = ss.getSheetByName('GroceryList');
  } else {
      var sheet = ss.getSheetByName('Inventory');
  }
  var itemInfo = sheet.getRange(row,1,1,4).getValues().toString().split(",");
  
  var finData = sheet.getSheetName()+ ', ' +row+ ', ' +itemInfo[0]+ ', ' +itemInfo[1]+ ', ' +itemInfo[2]+ ', ' +itemInfo[3];
  
  return finData;
}

function setupMealList(){
  
    var sheet = ss.getSheetByName("MealList");
    
    var data = sheet.getRange('A1:'+sheet.getLastRow()).getValues();
    var list = [];
    var dataLen = data.length;
  
    if (data !== null) {
		for (var i = 0; i < dataLen; i++) {
		  list.push(data[i][0]);
		}   
    } else {
      return;
    }
    return list;
}

function setupMealWindow(row, action){
  
  var list = [];
  var mealList = ss.getSheetByName("MealList");
  var inventory = ss.getSheetByName('Inventory');
  var description, name, currentIngredients = "";
  var availableIngredients = inventory.getRange(1, 1, inventory.getLastRow(), 2).getValues();
  var availableIngredientsLen = availableIngredients.length;
  var i = 0;
  
  if (row != ""){
      name = mealList.getRange(row, 1).getValues();
      description = mealList.getRange(row, 2).getValues();
      currentIngredients = mealList.getRange(row, 3).getValues().toString();
    if (currentIngredients != ""){
      var sheet = ss.getSheetByName('IngredientTemp');
      sheet.getRange('A1').setValue([currentIngredients]);
    }
  }

  list.push(row);
  list.push(action);
  list.push(name);
  
  if(description != ""){
      list.push(description);
  } else {
      list.push("");
  }

  if (currentIngredients != ""){
      list.push(currentIngredients);
      list.push("ingredients stop");
  } else {
      list.push("ingredients stop");
  }
    
  
  if (availableIngredients != "") {
      
    for (i; i < availableIngredientsLen; i++) {
      var ingredient = availableIngredients[i][1];
      if (ingredient.indexOf('Ingredient') > -1 || ingredient.indexOf('Snack') > - 1){
	    list.push(availableIngredients[i][0]);
      }
	}
  }
  return list;
}

function addItem(toAdd){
  var sheet = ss.getSheetByName(toAdd.List);
  if (toAdd.newEntry != ''){
      sheet.appendRow([toAdd.newEntry,'Ingredient']);
      return Inventory(toAdd.List);
  }
}

function deleteItem(listName, row, adjListLen){
  
  if (listName == 1){
      var sheet = ss.getSheetByName('GroceryList');
  } else if (listName == 2){
      var sheet = ss.getSheetByName('Inventory');
  } else {
      var sheet = ss.getSheetByName('MealList');
  }
  
  sheet.deleteRow([row]);
  if(adjListLen < 2){
      return sheet.getSheetName();
  } else {
      return Inventory(sheet.getSheetName());
  }
  return Inventory(sheet.getSheetName());
}

function moveItem(row){
  
  var sheetGrocery = ss.getSheetByName('GroceryList');
  var sheetInventory = ss.getSheetByName('Inventory');
  
  var aValue = sheetGrocery.getRange("A"+row).getValues();
  var bValue = sheetGrocery.getRange("B"+row).getValues();
  var cValue = sheetGrocery.getRange("C"+row).getValues();
  var dValue = sheetGrocery.getRange("D"+row).getValues();
  
  var aValueStr = aValue.toString();
  var bValueStr = bValue.toString();
  var cValueStr = cValue.toString();
  var dValueStr = dValue.toString();
  
  sheetInventory.appendRow([aValueStr, bValueStr, cValueStr, dValueStr]);
}

function updateItemInfo(updating){
  var sheet = ss.getSheetByName(updating.List);
  sheet.getRange('A'+updating.Row).setValue(updating.Item);
  
  if (updating.itemType == "" && updating.setType != ""){
      sheet.getRange('B'+updating.Row).setValue(updating.setType);
  } else {
      sheet.getRange('B'+updating.Row).setValue(updating.itemType);
  }
  
  sheet.getRange('C'+updating.Row).setValue(updating.amt);
  
  if (updating.itemAmtType == "" && updating.setAmtType != ""){
      sheet.getRange('D'+updating.Row).setValue(updating.setAmtType);
  } else {
      sheet.getRange('D'+updating.Row).setValue(updating.itemAmtType);
  }
  return Inventory(updating.List);
}

function addIngredient(ingredient){
  
  var list = [];
  
  var sheet = ss.getSheetByName('IngredientTemp');
  var currentTemp = sheet.getRange('A1').getValue();
  
  if(currentTemp != ""){
    list.push(currentTemp);
  }
  
  if (list == ""){
  currentTemp = ingredient.ingredientInput + " derp " + ingredient.qtInput + " derp " + ingredient.qtInputSelector;
  } else {
  currentTemp = list +", "+ ingredient.ingredientInput + " derp " + ingredient.qtInput + " derp " + ingredient.qtInputSelector; 
  } 
  
  sheet.getRange("A1").setValue(currentTemp);
  return currentTemp;
}

function retreiveIngredients(row){
  var sheet = ss.getSheetByName('IngredientTemp');
  var currentTemp = sheet.getRange('A1').getValues().toString().split(",");
  currentTemp.splice(row, 1);
  sheet.getRange('A1').setValue(currentTemp);
  return currentTemp;
}

function tempMealIngredients(ingredientsList){
  var sheet = ss.getSheetByName('IngredientTemp');
  sheet.getRange('A1').setValue(ingredientsList);
  return;
}

function clearIngredientsTempList(){
  var sheet = ss.getSheetByName('IngredientTemp');
  sheet.getRange("A1").setValue("");
}

function addRecipe(recipe){
  if (recipe.ingredientInput != ""){
      addIngredient(recipe);
  }
  var row = recipe.Row;
  var sheetIngredientTemp = ss.getSheetByName('IngredientTemp');
  var ingredients = sheetIngredientTemp.getRange("A1").getValue();
  var sheetMealList = ss.getSheetByName('MealList');
  var sheetRecipeList = ss.getSheetByName('RecipeList');
  if (row != ""){
      sheetMealList.getRange('A'+row).setValue(recipe.newRecipe);
      sheetMealList.getRange('B'+row).setValue(recipe.description);
      sheetMealList.getRange('C'+row).setValue(ingredients);
      return;
  }
  sheetMealList.appendRow([recipe.newRecipe, recipe.description, ingredients]);
  
  if (recipe.saveRecipe != ""){
      sheetRecipeList.appendRow([recipe.newRecipe, recipe.description, ingredients]);
  }
  return;
}

function diarrheaStatus() {
  var sheet = ss.getSheetByName('SteveOutput');
  var aValues = sheet.getRange('A2:'+sheet.getLastRow()).getValues();
  var bValues = sheet.getRange('B2:'+sheet.getLastRow()).getValues();
  var day = 24*3600*1000
  var today = parseInt((new Date().setHours(0,0,0,0))/day);
  var count = 0;
  var type = '', display = '';
  
  for (var i = 0; i < aValues.length; i++) {
    var dataday = parseInt(aValues[i][0].getTime()/day)
    if (dataday == today){
      count++;

      type = bValues[i][0]
      
      if (type.indexOf('rr') > -1){
        display = 'Diarrhea ...';
      }    
    }
  }
  
  if (display == ''){
    if (count >= 3){
      display = 'Diarrhea ...';
    } else {
        display = 'No Diarrhea!';
    }
  }
  return display;
}