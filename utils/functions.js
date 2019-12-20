function getPercentage(arr, type, range) {
  let percentageList = [];
  if (arr && type != "name") {
    let labels = [];
    arr.forEach(item => {
      let is_found = false;
      labels.forEach(label => {
        if (label.label == eval("item" + "." + type)) {
          label.count += 1;
          is_found = true;
        }
      });
      if (!is_found) {
        labels.push({
          label: eval("item" + "." + type),
          count: 1
        });
      }
    });
    let total = arr.length;

    if (range) {
      for (let i = 0; i < range.length - 1; i++) {
        let count = 0;
        labels.forEach(label => {
          if (label.label > range[i] && label.label <= range[i + 1]) {
            count++;
          }
        });
        percentageList.push({
          label: range[i] + " - " + range[i + 1],
          value: (count / total) * 100
        });
      }
      return percentageList;
    }

    labels.forEach(label => {
      percentage = (label.count / total) * 100;
      percentageList.push({
        label: label.label,
        value: percentage
      });
    });
  }
  return percentageList;
}

module.exports = {
  getPercentage
};
