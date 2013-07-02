import re

tags = [{'pref':'@','name':'doc'},
  	{'pref':'\$','name':'unit'}]

decl = {}
for tag in tags:
	decl[tag['name']] = {}
	

def asIs(s):
	return s
	
def stripNewline(s):
	return s.strip('\n\r')
	
def stripWhitespace(s):
	return s.strip()

def strip(s):
	return s.strip(' \t\n\r')

def stripCurlyBrackets(s):
	return s.strip('{}')
	
def parseParam(s):
	s = s.strip()
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<name>(\[(\s|\t)*[a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?(\s|\t)*\])|([a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?))(\s|\t)*(?P<description>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['name'] = prop.group('name').strip()
		res['mandatory'] = True
		mand = re.match(r'^\[(.*)\]$', res['name'])
		if mand is not None:
			res['mandatory'] = False
			res['name'] = mand.group(1)
		res['description'] = prop.group('description')
		return res
	return s
	
decl['doc']['param'] = parseParam

def parseReturn(s):
	s = s.strip()
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<description>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['description'] = prop.group('description')
		return res
	return s
		
decl['doc']['return'] = parseReturn
	
decl['doc']['property'] = parseParam
	
def parseThis(s):
	return stripCurlyBrackets(s.strip())
decl['doc']['this'] = parseThis

decl['doc']['example'] = asIs
decl['doc']['exampledesc'] = stripWhitespace

decl['doc']['description'] = stripWhitespace
decl['doc']['group'] = stripWhitespace
decl['doc']['constructor'] = stripWhitespace

decl['doc']['author'] = stripWhitespace
decl['doc']['copyright'] = stripWhitespace
decl['doc']['licence'] = stripWhitespace
decl['doc']['file'] = stripWhitespace
decl['doc']['namespace'] = stripWhitespace
decl['doc']['version'] = stripWhitespace

decl['doc']['link'] = stripWhitespace
decl['doc']['see'] = stripWhitespace
decl['doc']['depends'] = stripWhitespace #should try to get imports/requires by itself
def parseToDo(s):
	s = s.strip()
	res = {}
	res['complete'] = False
	res['urgent'] = False
	todo = re.match(r'(\[(?P<complete>.*)\])?(\s|\t)*(?P<task>.*)',s)
	if todo is not None:
		res['task'] = todo.group('task')
		if todo.group('complete') is not None:
			c = todo.group('complete').strip()
			if c == 'x' or c == '+' or c == '*':
				res['complete'] = True
			elif c == '!':
				res['urgent'] = True
		return res
	return s
	
decl['doc']['todo'] = parseToDo

decl['unit']['prepare'] = asIs
decl['unit']['assert'] = asIs #TODO: parse assert

#Access modifiers
decl['doc']['private'] = asIs
decl['doc']['public'] = asIs
decl['doc']['static'] = asIs
decl['doc']['protected'] = asIs
decl['doc']['class'] = stripWhitespace
decl['doc']['excerpt'] = stripWhitespace

