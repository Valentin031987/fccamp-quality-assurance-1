const MSJ = require('../controllers/messages.js');
const { listeners } = require("../server");
const evaluate = require('mathjs').evaluate;

function ConvertHandler() {
  this.units = ['gal', 'lbs', 'kg', 'mi', 'km', 'l'];
  this.stringUnits = {
    gal: 'gallons',
    l: 'liters',
    L: 'liters',
    lbs: 'pounds',
    kg: 'kilograms',
    km: 'kilometers',
    mi: 'miles'
  };
  this.returnUnit = { gal: 'l', l: 'gal', lbs: 'kg', kg: 'lbs', mi: 'km', km: 'mi', L: 'gal' };

  this.findUnit = function (input) {
    return [...this.units].find((i) => input.match(new RegExp(i + '$', 'gi')))
  }

  this.isValidUnit = function (unit) {
    return this.units.indexOf(unit) > -1;
  }

  this.isValidNumber = function (initNumber) {
    return isNaN(Number.parseFloat(initNumber));
  }

  this.getNum = function (input) {

    let unit = this.getUnit(input.toLowerCase());
    try {
      let anyNumber = input.match(/[\d]/g);
      let numberPart = input.match(/[\d|\.|\/]/g);
      
      if(!numberPart && this.isValidUnit(unit) && input.length == unit.length) {
        return 1
      }

      numberPart = numberPart.join('').trim();

      let slashes = numberPart.match(/\//g);
      if (slashes && slashes.length >= 2) {
        return MSJ.INVALID_NUMBER;
      }

      return evaluate(numberPart);
    } catch (error) {
      if (error) {
        return MSJ.INVALID_NUMBER;
      }
    }
  };

  this.getUnit = function (input) {
    let unit = this.findUnit(input.toLowerCase());
    if (!unit) {
      return MSJ.INVALID_UNIT;
    }
    return unit;
  };

  this.getReturnUnit = function (initUnit) {
    if (!this.isValidUnit(initUnit)) {
      return MSJ.INVALID_UNIT;
    }

    return this.returnUnit[initUnit] == 'l' ? 'L' : this.returnUnit[initUnit];
  };

  this.spellOutUnit = function (unit) {
    return this.stringUnits[unit];
  };

  this.convert = function (initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    let result = 0;

    switch (initUnit) {
      case 'gal':
        result = initNum * galToL;
        break;
      case 'l':
      case 'L':
        result = initNum / galToL;
        break;
      case 'lbs':
        result = initNum * lbsToKg;
        break;
      case 'kg':
        result = initNum / lbsToKg;
        break;
      case 'mi':
        result = initNum * miToKm;
        break;
      case 'km':
        result = initNum / miToKm;
        break;
    }

    return Number.parseFloat(result.toFixed(5));
  };

  this.getLiteral = function (initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  }

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    if (!this.isValidUnit(initUnit) && initNum == MSJ.INVALID_NUMBER) {
      return MSJ.INVALID_NUMBER_UNIT
    }
    if (initNum == MSJ.INVALID_NUMBER) {
      return MSJ.INVALID_NUMBER;
    }    
    if (!this.isValidUnit(initUnit)) {
      return MSJ.INVALID_UNIT;
    }
    let string = this.getLiteral(initNum, initUnit, returnNum, returnUnit)
    initUnit = initUnit == 'l' ? 'L' : initUnit;
    return { initNum, initUnit, returnNum, returnUnit, string };
  };

}

module.exports = ConvertHandler;