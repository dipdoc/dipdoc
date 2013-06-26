/*
 * jules.js
 * JULES - (another) JavaScript Schema Validator
 * Ezekiel 25:17
 *
 * @author Nikola Stamatovic Stamat < stamat@ivartech.com >
 * @copyright IVARTECH < http://ivartech.com >
 * @licence MIT
 * @since May 2013
 */
 
 
//TODO: hyper schema
//TODO: extends

var jules = {};
jules.aggregate_errors = false;
jules.dont_label = true;
jules.errors = [];
jules.error_messages = {};
//jules.error_messages['type'] = '{{schema_id}} Invalid type. Type of data should be {{key_val}}';
jules.refs = {};
jules.current_scope = null;

jules.onEachField = undefined;
jules.onEachFieldResult = undefined;
jules.onEachSchema = undefined;
jules.onEachSchemaResult = undefined;
jules.onStart = undefined;
jules.onFinish = undefined;

jules.validate = function(value, schema, nickcallback) {
	if(jules.onStart) jules.onStart(value, schema);
	jules.errors = [];
	if(ivar.isString(schema))
		schema = jules.getSchemaByReference(schema);
	jules.initScope(schema);
	var res = jules._validate(value, schema);
	if(nickcallback) nickcallback(value, schema, res); //This is how you remind me... Or is it Someday? Go suck somewhere else...
	if(jules.onFinish) jules.onFinish(value, schema, res);
	return res;
};

jules.initScope = function(schema) {
	//ivar.echo('=================');
	if(!schema.id && !jules.dont_label)
		schema.id = 'schema:'+ivar.crc32(JSON.stringify(schema));
	
	if(schema.id && !ivar.isSet(jules.refs[schema.id]))
		jules.refs[schema.id] = schema;
	
	jules.current_scope = schema;
		
	return schema;
};

jules._validate = function(value, schema, aggregate_errors) {
	if(jules.onEachSchema) jules.onEachSchema(value, schema);
	aggregate_errors = ivar.isSet(aggregate_errors)?aggregate_errors:jules.aggregate_errors;
	
	var result = true;
	
	var errors = [];
	
	for(var i in schema) {
		if(jules.current_scope.id !== schema.id && jules.refs.hasOwnProperty(schema.id)) {
			jules.current_scope = jules.refs[schema.id];
		}
		if(jules.onEachField) jules.onEachField(value, i, schema, valid);
		
		var type = ivar.whatis(value);
		if(type === 'integer' || type === 'float')
			type = 'number';
		var valid = true;
		if(jules.validator[i]) {
			valid = jules.validator[i](value, i, schema);
		} else if (jules.validator[type] && jules.validator[type][i]) {
			valid = jules.validator[type][i](value, i, schema);
		} else {
			if(jules.onEachFieldResult) jules.onEachFieldResult(value, i, schema, valid);
			continue;
		}
		//ivar.echo(schema.id+' - '+i+': '+valid);
		if(jules.onEachFieldResult) jules.onEachFieldResult(value, i, schema, valid);
		if(!valid) {
			errors.push(jules.generateErrorMessage(value, i, schema));
			if(!aggregate_errors) {
				result = false;
				break;
			}
		}
	}
	
	if(aggregate_errors && errors.length > 0) {
		jules.errors = jules.errors.concat(errors);
		result = false;
	}
	if(jules.onEachSchemaResult) jules.onEachSchemaResult(value, schema, result, errors);
	return result;
};

jules.generateErrorMessage = function(value, i, schema) {
	var key_val = schema[i];
	var val = value;
	if(ivar.isObject(value))
		value = JSON.stringify(value);
	var sch = key_val.toString();
	if(ivar.isObject(key_val))
		sch = JSON.stringify(key_val);
	var message = jules.error_messages[i]?jules.error_messages[i].template({keyword: i, value: val, schema_id: schema.id, key_val: sch}):'['+schema.id+ ']: Invalid '+i;
	return message;
}

ivar.namespace('jules.validator');

// ====== [Validators]: Any Type ====== //

jules.validator._min = function(value, min) {
	if(!min.exclusive)
		min.exclusive = false;
	return min.exclusive?min.value<value:min.value<=value;
};

jules.validator._max = function(value, max) {
	if(!max.exclusive)
		max.exclusive = false;
	return max.exclusive?max.value>value:max.value>=value;
};

jules.validator._range = function(value, i, schema, exclusive) {
	if(!ivar.isSet(value) || ivar.isBool(value)) return true;
	
	var mm = schema[i];
	var fn = '_'+i.substring(0, 3);
	var type = ivar.whatis(value);
	if(type === 'float')
		type = 'number';
	
	if(type === 'object') {
		value = ivar.countProperties(value); 
	} else if (value.hasOwnProperty('length')) {
		value = value.length;
	}
	
	if(ivar.isNumber(mm))
		mm = jules.buildRangeObj(mm, exclusive);
		
	if (ivar.isObject(mm)) {
		if(mm.hasOwnProperty('type') && type !== mm.type)
			return true;
		mm = [mm];
	}
	
	var other_types = null;
	
	if (ivar.isArray(mm)) {
		for(var i = 0; i < mm.length; i++) {
			if(mm[i].hasOwnProperty('type')) {
				if(type === mm[i].type)
					return jules.validator[fn](value, mm[i]);
			} else {
				if(!other_types) other_types = mm[i];
			}
		}
	}
	
	if(other_types)
		return jules.validator[fn](value, other_types);
		
	return true;
};

jules.validator.min = jules.validator._range;
jules.validator.max = jules.validator._range;

//+contition
jules.validator._if = function(value, if_obj) {
	var not = ivar.isSet(if_obj['not'])? if_obj['not']: false;
	var cond_res = jules._validate(value, if_obj['condition']);
	var bool = not? !cond_res: cond_res;
	if(bool) {
		return jules._validate(value, if_obj['then']);
	} else {
		if(ivar.isSet(if_obj['else']))
			return jules._validate(value, if_obj['else']);
	}
	return true;
};

jules.validator['if'] = function(value, i, schema) {
	var if_obj = schema[i];
	if (ivar.isArray(if_obj)) {
		for (var i = 0; i < if_obj.length; i++) {
			if(!jules.validator._if(value, if_obj[i]))
				return false;
		}
	} else {
		return jules.validator._if(value, if_obj);
	}
	return true;
};

//@see jules.validator.requiredProperties
jules.validator.required = function(value, i, schema) {
	var bool = schema[i];
	if(ivar.isArray(bool))
		return jules.validator.object.requiredProperties(value, i, schema);
	return bool ? value !== undefined : true;
};

jules.validator._enum = function(value, i, schema, not) {
	if(ivar.isArray(schema[i]))
		schema[i] = schema[i].map();
		
	value = ivar.toMapKey(value);
	var res = schema[i].hasOwnProperty(value);
	return not? !res: res;
}; 

jules.validator.only = jules.validator._enum;

jules.validator.enum = jules.validator._enum;
 
jules.validator.forbidden = function(value, i, schema) {
	return jules.validator._enum(value, i, schema, true);
};

jules.validator.type = function(value, i, schema) {
	var type = schema[i];
	
	if(/^\s*(any|\*|\s|^$)\s*$/i.test(type))
		return true;
		
	if(ivar.isArray(type)) {
		for(var i = 0; i < type.length; i++) {
			if(ivar.is(value, type[i]))
				return true;
		}
		return false;
	} else {
		return ivar.is(value, type);
	}
};

jules.validator.allow = jules.validator.type;

jules.validator.disallow = function(value, i, schema) {
	var type = schema[i];
	if(ivar.isArray(type)) {
		for(var i = 0; i < type.length; i++) {
			if(ivar.is(value, type[i]))
				return false;
		}
		return true;
	} else {
		return !ivar.is(value, type);
	}
};

jules.validator._allOf = function(value, schema_arr) {
	for(var i = 0; i < schema_arr.length; i++) {
		if(!jules._validate(value, schema_arr[i]))
			return false;
	}
	return true;
};

jules.validator.allOf = function(value, i, schema) {
	var key_val = schema[i];
	if(!ivar.isArray(value)) {
		return jules.validator._allOf(value, key_val);
	} else {
		for(var i = 0; i < value.length; i++) {
			if(!jules.validator._allOf(value[i], key_val))
				return false;
		}
		return true;
	}
};

jules.validator._anyOf = function(value, schema_arr) {
	for(var i = 0; i < schema_arr.length; i++) {
		if(jules._validate(value, schema_arr[i]))
			return true;
	}
	return false;
};

jules.validator.anyOf = function(value, i, schema) {
	var key_val = schema[i];
	if(!ivar.isArray(value)) {
		return jules.validator._anyOf(value, key_val);
	} else {
		for(var i = 0; i < value.length; i++) {
			if(!jules.validator._anyOf(value[i], key_val))
				return false;
		}
		return true;
	}
};

jules.validator._oneOf = function(value, schema_arr) {
	var passed = 0;
	for(var i = 0; i < schema_arr.length; i++) {
		if(jules._validate(value, schema_arr[i], false))
			passed += 1;
	}
	return passed === 1;
}

jules.validator.oneOf = function(value, i, schema) {
	var key_val = schema[i];
	if(!ivar.isArray(value)) {
		return jules.validator._oneOf(value, key_val);
	} else {
		for(var i = 0; i < value.length; i++) {
			if(!jules.validator._oneOf(value[i], key_val))
				return false;
		}
		return true;
	}
};

jules.validator._not = function(value, schema_arr) {
	for(var i = 0; i < schema_arr.length; i++) {
		if(jules._validate(value, schema_arr[i], false))
			return false;
	}
	return true;
}

jules.validator.not = function(value, i, schema) {
	var key_val = schema[i];
	if(ivar.isObject(key_val))
		key_val = [key_val];
	if(!ivar.isArray(value)) {
		return jules.validator._not(value, key_val);
	} else {
		for(var i = 0; i < value.length; i++) {
			if(!jules.validator._not(value[i], key_val))
				return false;
		}
		return true;
	}
};

//TODO: REFERENCE RESOLVE!!! Needs refactoring in order to work
//XXX: has _validate, current, refs, getSchema
jules.getScope = function(ref, stack) {
	if(!stack.hasOwnProperty(ref)) {
		jules.getSchema(ref, function(ref_schema) {
			if(!ivar.isSet(ref_schema.id))
				ref_schema.id = ref;  //TODO: check why I wrote these lines
			else
				ref = ref_schema.id;
			jules.initScope(ref_schema);
		});
	}
	return stack[ref];
};

jules.getFragment = function(ref, scope) {
	if(ref.startsWith('/')) ref = ref.removeFirst();
	var props = ref.split('/');
	var schema = scope;
	for(var i = 0; i < props.length; i++) {
		props[i] = decodeURIComponent(props[i]);
		if(schema.hasOwnProperty(props[i])) {
			schema = schema[props[i]];
		} else {
			return undefined;
		}
	}
	
	if(!schema.id)
		schema.id = ref;
		
	return schema;
};

jules.getSchemaByReference = function(ref) {
	//TODO: $ref: '#', referencing itself
	var schema = null;
	var parts = ref.split('#');
	if(ivar.isSet(parts[0]) && parts[0].length > 0) {
		schema = jules.getScope(parts[0], jules.refs);
	}
	
	if(ivar.isSet(parts[1]) && parts[1].length > 0) {
		schema = jules.getFragment(parts[1], jules.current_scope);
	}
	
	//TODO:
	if(parts[0].length === 0 && parts[1].length === 0)
		schema = jules.current_scope;
		
	return schema;
};

jules.validator.$ref = function(value, i, schema) {
	return jules._validate(value, jules.getSchemaByReference(schema[i]));
};

jules.validator['extends'] = function (value, i, schema) {
	//TODO: jules.validator.extended
	return true;
};

jules.validateSchema = function(schema, metaschema) {
	if(!metaschema && schema.hasOwnProperty('$schema'))
		metaschema = jules.getSchemaByReference(schema.$schema);
	if(metaschema && ivar.isString(metaschema))
		metaschema = jules.getSchemaByReference(metaschema);
		
	return jules._validate(schema, metaschema);
};

ivar.namespace('jules.validator.object');

// ====== [Validators]: Object ====== //

//XXX: has _validate
jules.validator.object.dependencies = function(value, i, schema) {
	var dep = schema[i];
	for(var i in dep) {
		//TODO: if (ivar.regex.regex.test(i)) {
		if(ivar.isArray(dep[i])) {
			if(value.hasOwnProperty(i))
				for(var j = 0; j < dep[i].length; j++) {
					if(!value.hasOwnProperty(dep[i][j]))
						return false;
				}
		} else {
			if(value.hasOwnProperty(i))
				if(!jules._validate(value, dep[i]))
						return false;
		}
	}
	return true;
};

jules.validator.object.requiredProperties = function(value, i, schema) {
	var arr = schema[i];
	for(var i = 0; i < arr.length; i++) {
		if(!value.hasOwnProperty(arr[i]))
			return false;
	}
	return true;
};

//XXX: has _validate
jules._property = function(value, prop, schema, bool) {
	if(value.hasOwnProperty(prop)) {
		if(!jules._validate(value[prop], schema[prop]))
			return false;
	} else {
		if(!bool)
			return false;
	}
	
	return true;
};

//XXX: has _validate
jules._patternProperty = function(value, prop, schema, bool) {
	var found = ivar.getProperties(value, prop);
	for(var j = 0; j < found.length; j++) {
		if (!jules._validate(value[found[j]], schema[prop]))
			return false;
	}
	if (!bool && found.length === 0) return false;
		
	return true;
};

jules.validator.object.patternProperties = function(value, i, schema) {
	var prop = schema[i];
	for(var i in prop) {
		if (!jules._patternProperty(value, i, prop))
			return false;
	}
	return true;
};

jules.validator.object.properties = function(value, i, schema, bool) {
	var prop = schema[i];
	if(!ivar.isSet(bool))
		bool = true;
	for(var i in prop) {
		if (ivar.regex.regex.test(i)) {
			if (!jules._patternProperty(value, i, prop, bool))
				return false;
		} else {
			if (!jules._property(value, i, prop, bool))
				return false;
		}
	}
	return true;
};

jules.validator.object.additionalProperties = function(value, i, schema) {
	var prop = schema[i];
	if (ivar.isObject(prop)) {
		return jules._validateAdditionalProperties(value, i, schema);
	} else {
		if (prop === false) {
			return !jules._getAdditionalProperties(value, i, schema).length > 0;
		}
	}
	return true;
};

jules._validateAdditionalProperties = function(value, i, schema) {
	var arr = jules._getAdditionalProperties(value, i, schema);
	var additional_schema = schema[i];
	for(var i = 0; i < arr.length; i++) {
		if(value.hasOwnProperty(arr[i]) && !jules._validate(value[arr[i]], additional_schema))
			return false;
	}
	return true;
};

jules._getAdditionalProperties = function(value, i, schema) {
	var arr = ivar.getProperties(value);
	
	if(schema.hasOwnProperty('properties')) {
		for(var i in schema.properties) {
			arr.remove(i);
		}
	}
	
	if(schema.hasOwnProperty('patternProperties')) {
		for(var i in schema.patternProperties) {
			i = i.toRegExp();
			arr.remove(i);
		}
	}
	return arr;
};

jules.validator._propertyRange = function(obj, del) {
	var count = 0;
	for(var i in obj) {
		count++;
		if(count > del)
			break;
	}
	return count;
};

jules.validator.object.minProperties = function(value, i, schema) {
	var count = jules.validator._propertyRange(value, schema[i]);
	return count >= schema[i];
};

jules.validator.object.maxProperties = function(value, i, schema) {
	var count = jules.validator._propertyRange(value, schema[i]);
	return count <= schema[i];
};

// ====== [Validators]: Array ====== //
ivar.namespace('jules.validator.array');

jules.validator.array.unique = function(value) {
	var aggr = {};
	for(var i = 0; i < value.length; i++) {
		var val = ivar.toMapKey(value[i]);
		if(!aggr.hasOwnProperty(val)) {
			aggr[''+val] = 1;
		} else {
			return false;
		}
	}
	return true;
};

jules.validator.array.uniqueItems = jules.validator.array.unique;

//XXX: this one has _validate
jules.validator.array.items = function(value, i, schema) {
	schema = schema[i];
	if(ivar.isObject(schema)) {
		for(var i = 0; i < value.length; i++) {
			var valid = jules._validate(value[i], schema);
			if(!valid) return false;
		}
		return true;
	} else {
		for(var i = 0; i < schema.length; i++) {
			var valid = jules._validate(value[i], schema[i]);
			if(!valid) return false;
		}
		return true;
	}
};

jules.validator.array.additionalItems = function(value, i, schema) {
	if(schema[i]) return true;
	return value.length <= schema.items.length;
};

jules.validator.array.minItems = jules.validator.min;
jules.validator.array.maxItems = jules.validator.max;

// ====== [Validators]: String ====== //
ivar.namespace('jules.validator.string');
jules.validator.string.regex = function(value, i, schema) {
	var regex = schema[i];
	if(!ivar.isString(value))
		value = value.toString();
	if(!(regex instanceof RegExp))
		regex = jules.buildRegExp(schema[i]);	
	return regex.test(value);
};

jules.validator.string.pattern = jules.validator.string.regex;

jules.formats = {}; //date-time YYYY-MM-DDThh:mm:ssZ, date YYYY-MM-DD, time hh:mm:ss, utc-milisec, regex, color, style, phone E.123, uri, url, email, ipv4, ipv6, host-name
jules.formats.email = function(value) {
	return ivar.regex.email.test(value);
};

jules.formats.regex = function(value) {
	return !value.toRegExp() ? false : true;
};

jules.formats.json = function(value) {
	return !value.parseJSON() ? false : true;
};

jules.formats.time = function(value) {
	return ivar.regex.time.test(value);
};

jules.formats.uri = function(value) {
	return ivar.regex.uri.test(value);
};

jules.validator.string.format = function(value, i, schema) {
	return jules.formats[schema[i]](value);
};

jules.validator.string.minLength = jules.validator.min;
jules.validator.string.maxLength = jules.validator.max;

// ====== [Validators]: Number ====== //
ivar.namespace('jules.validator.number');

jules.validator.number.numberRegex = jules.validator.string.regex;
jules.validator.number.numberPattern = jules.validator.string.regex;

jules.validator.number.numberFormat = jules.validator.string.format;

jules.validator.number.minimum = jules.validator.min;
jules.validator.number.maximum = jules.validator.max;

jules.validator.number.exclusiveMinimum = function(value, i, schema) {
	return jules.validator.min(value, 'minimum', schema, schema[i]);
};

jules.validator.number.exclusiveMaximum = function(value, i, schema) {
	return jules.validator.max(value, 'maximum', schema, schema[i]);
};

jules.validator.number.dividableBy = function(value, i, schema) {
	if(schema[i] === 0)
		return false;
	return value%schema[i] === 0;
};
jules.validator.number.multipleOf = jules.validator.number.dividableBy;

// ====== Some utils... ====== //

jules.buildRangeObj = function(val, exclusive) {
	if(ivar.isString(val))
		val = parseFloat(val);
	if(!ivar.isSet(exclusive))
		exclusive = false;
	return ivar.isNumber(val)?{value:val, exclusive: exclusive}:val;
};

jules.buildRegExp = function(val) {
	if(!ivar.isString(val))
		val = val.toString();
	var re = val.toRegExp();
	if(re)
		return re;
	else
		jules.error('Malformed regexp!');
};

jules.error = function(msg) {
	var heading = 'jules [error]: ';
	ivar.error(heading + msg);
};

jules.getSchema = function(uri, callback) {
	var resp = undefined;
	ivar.request({uri: uri, async:false}, function(response) {
		if(ivar.isSet(response)) {
			try {
				resp = JSON.parse(response);
			} catch(e) {
				jules.error('Invalid Schema JSON syntax - ' + e);
			}
		} else {
			jules.error('Reference not accessible');
		}
	});
	callback(resp);
};
