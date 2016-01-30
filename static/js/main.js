

var NA_TYPE = {
  'dsDNA': 0,
  'ssDNA': 1,
  'RNA': 2,
};

var NA_TYPE_LUT = ['dsDNA', 'ssDNA', 'RNA'];

var NA_UNITS = {
  'ng/ul': 0,
  'pM': 1,
  'nM': 2,
  'uM': 3,
  'mM': 4
};

var NA_UNITS_LUT = ['ng/ul', 'pM', 'nM', 'uM', 'mM'];

// 1 pmol / x
NA_MW = {
  'dsDNA': 660,
  'ssDNA': 330,
  'RNA': 340
};

var CONC_TYPE_LUT = ['ng/ul', 'pM', 'nM', 'mM'];

var biocalc = {

  params: {
    'na-input-type': 0,
    'na-input-units': 0,
    'na-input-value': 0,
    'na-input-length': 0,
    'na-final-type': 0,
    'na-final-units': 0,
    'na-final-value': 0,
    'na-final-volume': 0,
  },

  outputs: {
    'output-ng-ul': 0,
    'output-pm': 0,
    'final-vol-na': 0,
  },

};

var registerInputs = function() {

  $("input[type='radio']").change(function(e) {
    var target_el = e.target;
    var group_id = e.target.parentElement.parentElement.id;
    biocalc.params[group_id] = $(target_el).data('na-val');
    convertInputs();
    decorateOutputs();
  });

  $("input[type='number']:enabled").on('keyup', function(e) {
    var target_el = e.target;
    biocalc.params[target_el.id] = parseInt(target_el.value, 10) || 0;
    convertInputs();
    decorateOutputs();
  });

};


var ngToPmol = function(na_ng, na_len, na_type) {
  return na_ng * (1/NA_MW[NA_TYPE_LUT[na_type]]) * 1000.0 * (1/na_len);
};

var pmolToNg = function(na_pmol, na_len, na_type) {
  return na_pmol * NA_MW[NA_TYPE_LUT[na_type]] * 0.001 * na_len;
};

var convertInputs = function() {
  // ng/ul amd pM
  var na_ng, na_pmol, na_pm;
  var na_len = biocalc.params["na-input-length"];
  var na_type = biocalc.params["na-input-type"];
  var na_units = biocalc.params["na-input-units"];
  if (na_units === NA_UNITS["ng/ul"]) {
    na_ng = biocalc.params["na-input-value"];
    na_pmol = ngToPmol(na_ng, na_len, na_type);
  } else {
    na_pmol = biocalc.params["na-input-value"] / Math.pow(1000, na_units - 1);
    na_ng = pmolToNg(na_pmol, na_len, na_type);
  }
  na_pm = na_pmol * 1000000.0;
  biocalc.outputs["output-ng-ul"] = na_ng;
  biocalc.outputs["output-pm"] = na_pm;
  // dilutions
  var final_units = biocalc.params["na-final-units"];
  var final_value = biocalc.params["na-final-value"];
  var final_volume = biocalc.params["na-final-volume"];
  // 1) coerce input type to output type
  var final_equiv;
  if (final_units == NA_UNITS["ng/ul"]) {
    final_equiv = na_ng;
  } else {
    final_equiv = na_pm / Math.pow(1000, final_units - 1);
  }
  biocalc.outputs["final-vol-na"] = final_value * final_volume / final_equiv;
};

var decorateOutputs = function() {
  var na_ng_ul = biocalc.outputs['output-ng-ul'];
  var na_pm = biocalc.outputs['output-pm'];
  var final_volume = biocalc.params["na-final-volume"];
  var final_vol_na = biocalc.outputs["final-vol-na"];
  $("#output-ng-ul").val(na_ng_ul.toFixed(3));
  $("#output-pm").val(na_pm.toFixed(3));
  $("#output-nm").val((na_pm / 1000.0).toFixed(3));
  $("#output-um").val((na_pm / 1000000.0).toFixed(3));
  $("#output-mm").val((na_pm / 1000000000.0).toFixed(3));
  $("#final-vol-input").val((final_vol_na).toFixed(3));
  $("#final-vol-diluent").val((final_volume - final_vol_na).toFixed(3));
};

registerInputs();

