// =========================== arrays ===========================

function equal_arrays(a, b){
  if (a.length != b.length){
    return false;
  }

  p = a.slice().sort();
  q = b.slice().sort();

  for (var i = 0; i < p.length; i++){
    if (p[i] != q[i]){
      return false;
    }
  }
  return true;
}

function find_duplicates(a){ // only returns first duplicate encountered
  a_ = [];
  for (var i = 0; i < a.length; i++){
    if (a_.includes(a[i])){
      return a[i];
    } else {
      a_.push(a[i]);
    }
  }
  return null;
}

function remove_duplicates(a){
  result = [];
  for (var i = 0; i < a.length; i++){
    if (!result.includes(a[i])){
      result.push(a[i]);
    }
  }
  return result;
}

function a_exclude_b(a,b){ // a is a set, b is an element
  let result = [];

  for (var i = 0; i < a.length; i++){
    if (a[i] != b){
      result.push(a[i]);
    }
  }
  return result;
}

// ====================== arrays of arrays ======================

function flatten(a){  // a is array of arrays
  let flat = [];

  for (var i = 0; i < a.length; i++){
    for (var j = 0; j < a[i].length; j++){
      flat.push(a[i][j])
    }
  }
  return flat;
}

function in_array(a, b){ // bool: a in b
  for(var i = 0; i < b.length; i++){
    if (equal_arrays(a, b[i])){
      return true;
    }
  }
  return false;
}

function remove_duplicate_arrays(arr){
  result = [];
  for (var i = 0; i < arr.length; i++){
    if (!in_array(arr[i], result)){
      result.push(arr[i]);
    }
  }
  return result;
}
