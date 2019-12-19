function getPercentage(arr, type) {
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

let arr = [
  {
    gender: "m"
  },
  {
    gender: "f"
  },
  {
    gender: "m"
  },
  {
    gender: "m"
  }
];

console.log(getPercentage(arr, "gender"));
