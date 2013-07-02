import re

def jsExtract(s):
	s = s.strip()
	res = {}
	res['doc'] = {}
	#TODO: dont frgt class for other languages 
	if not s:
		return
	
	isComment = re.match(r'^(/\*|//)', s) is not None
	if isComment:
		return
		
	isFn = re.match(r'.*function(\s|\t)*.*(\s|\t)*\(', s)
	isImport = re.match(r'^(import|include|require)(\s|\t)*\((?P<id>.*)\)', s)
	if isFn is not None:
		res['type'] = 'function'
		#args = re.match(r'.*function(\s|\t)*.*(\s|\t)*\((\s|\t)*(?P<args>([a-zA-Z_$][a-zA-Z0-9_$]*(\s|\t)*,(\s|\t)*)*([a-zA-Z_$][a-zA-Z0-9_$]*)?)(\s|\t)*\)(\s|\t)*\{?', s)
		#if args is not None:
		#	res['args'] = args.group('args').split(',')
		proto = re.match(r'^(?P<parent>..*)\.prototype\.(?P<name>..*)(\s|\t)*=', s)
		if proto is not None:
			res['name'] = proto.group('name')
			res['parent'] = proto.group('parent')
			res['namespace'] = '.'.join(proto.group('parent').split('.')[:-1])
			res['doc']['this'] = proto.group('parent')
			return res
			
		fn = re.match(r'^function(\s|\t)*(?P<name>..*)(\s|\t)*\(', s)
		if fn is not None:
			res['name'] = fn.group('name')
			return res
	
	elif isImport is not None:
		res['type'] = 'dependency'
		res['name'] = isImport.group('id')
		return res
	else:
		res['type'] = 'field'
		
	this = re.match(r'^this\.(?P<name>..*)(\s|\t)*=', s)
	if this is not None:
		res['name'] = this.group('name')
		res['parent'] = 'this'
		return res
		
	var = re.match(r'^var(\s|\t)*(?P<name>..*)(\s|\t)*=', s)
	if var is not None:
		res['name'] = var.group('name')
		return res
		
	other = re.match(r'^(?P<parent>(..*\.)*)(?P<name>..*)(\s|\t)*=', s)
	if other is not None:
		res['name'] = other.group('name')
		if other.group('parent') is not None:
			res['parent'] = other.group('parent')
		return res

fn = jsExtract

comments = {}
comments['pref'] = '/\*'
comments['suf'] = '\*/'
comments['decor'] = '\*'
comments['single'] = '//'
