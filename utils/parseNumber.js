module.exports = function parseNum(num = null) {
  let newNum = num;
  if (typeof(num) == 'string') {
    newNum = Number.parseFloat(newNum.replace(/,/, '.'));
  }

  return Math.round(newNum * 100) / 100;
  
  }
  