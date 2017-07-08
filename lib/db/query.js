var _ = require('lodash');

function buildQuery(query, fields, expression) {
  var field;
  if (null !== fields) {
    for (field in  fields) {
      if (fields.hasOwnProperty(field)) {
        var queryField = {};
        if ('undefined' !== typeof query[field]) {
          queryField = query[field];
        }
        queryField[expression] = fields[field];
        query[field] = queryField;
      }
    }
  }
}


var crit_ops = {
  eq: function(query, fields) {
    var field;
    if (null !== fields) {
      for (field in  fields) {
        if (fields.hasOwnProperty(field)) {
          query[field] = fields[field];
        }
      }
    }
  },
  ne: function(query, fields) {
    buildQuery(query, fields, "$ne");
  },
  lt: function(query, fields) {
    buildQuery(query, fields, "$lt");
  },
  le: function(query, fields) {
    buildQuery(query, fields, "$lte");
  },
  gt: function(query, fields) {
    buildQuery(query, fields, "$gt");
  },
  ge: function(query, fields) {
    buildQuery(query, fields, "$gte");
  },
  like: function(query, fields) {
    buildQuery(query, fields, "$regex");
  },
  "in": function(query, fields) {
    buildQuery(query, fields, "$in");
  },
  geo: function(query, fields) {
    if (null !== fields) {
      var field;
      var earthRadius = 6378; //km
      for (field in  fields) {
        if (fields.hasOwnProperty(field)) {
          var queryField = {};
          if ('undefined' !== typeof query[field]) {
            queryField = query[field];
          }
          queryField["$within"] = {
            "$centerSphere": [  // supported by mongodb V1.8 & above
              fields[field].center,
              fields[field].radius / earthRadius
            ]
          };
          query[field] = queryField;
        }
      }
    }
  }
};

/**
 *
 * Creating a mongo query from $fh.db query params
 *
 * See https://access.redhat.com/documentation/en-us/red_hat_mobile_application_platform_hosted/3/html/cloud_api/fh-db for more details
 *
 * @param filterParams
 * @returns {{}}
 */
module.exports = function createQuery(filterParams) {
  var query = {};

  if (filterParams && filterParams.key && filterParams.value) {
    filterParams.eq = {};
    filterParams.eq[String(filterParams.key)] = String(filterParams.value);
  }

  _.each(crit_ops, function(critOpFunction, op) {
    var fields_values = filterParams[op];
    if (fields_values) {
      crit_ops[op](query, fields_values);
    }
  });

  return query;
};