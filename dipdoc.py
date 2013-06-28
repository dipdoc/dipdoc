# DocDoc - JSDOC + Unit Tests
# Author: Nikola Stamatovic Stamat

#TODO: MODULARIZE(multy language support) AND COMMENT! :P

# $prepare var m1 = ivar.data.Map({something: lol})

# assert can be equal stricEqual deepEqual
# $assert equal this(m1) params('hello', 1) result(true) Some message for information
import re
import json
import os
from os.path import join
import markdown



tags = [{'pref':'@','name':'doc'},
  	{'pref':'\$','name':'unit'}]
data = {}

decl = {}
for tag in tags:
	decl[tag['name']] = {}


def asIs(s):
	return s
	
def stripCurlyBrackets(s):
	return s.strip('{}')
	
def parseParam(s):
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<name>(\[(\s|\t)*[a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?(\s|\t)*\])|([a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?))(\s|\t)*(?P<description>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['name'] = prop.group('name').strip()
		res['mandatory'] = False
		mand = re.match(r'^\[(.*)\]$', res['name'])
		if mand is not None:
			res['mandatory'] = True
			res['name'] = mand.group(1)
		res['description'] = prop.group('description')
		return res
	
decl['doc']['param'] = parseParam

def parseReturn(s):
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<description>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['description'] = prop.group('description')
		return res
		
decl['doc']['return'] = parseReturn
	
decl['doc']['property'] = parseParam
	
decl['doc']['this'] = stripCurlyBrackets

decl['doc']['example'] = asIs
decl['doc']['exampledesc'] = asIs

decl['doc']['description'] = asIs
decl['doc']['classdesc'] = asIs

decl['doc']['author'] = asIs
decl['doc']['copyright'] = asIs
decl['doc']['licence'] = asIs
decl['doc']['file'] = asIs
decl['doc']['namespace'] = asIs
decl['doc']['version'] = asIs

decl['doc']['link'] = asIs
decl['doc']['see'] = asIs
decl['doc']['depends'] = asIs #should try to get imports/requires by itself
def parseToDo(s):
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
decl['doc']['todo'] = parseToDo

decl['unit']['prepare'] = asIs
decl['unit']['assert'] = asIs #TODO: parse assert

lang = {}
lang['js'] = {}

def jsExtract(s):
	res = {}
	
	if not s:
		return
	
	isComment = re.match(r'^(/\*|//)', s) is not None
	if isComment:
		return
		
	isFn = re.match(r'.*function(\s|\t)*.*(\s|\t)*\(', s)
	isImport = re.match(r'.*(import|include|require)(\s|\t)*\((?P<id>.*)\)', s)
	if isFn is not None:
		res['type'] = 'function'
		#args = re.match(r'.*function(\s|\t)*.*(\s|\t)*\((\s|\t)*(?P<args>([a-zA-Z_$][a-zA-Z0-9_$]*(\s|\t)*,(\s|\t)*)*([a-zA-Z_$][a-zA-Z0-9_$]*)?)(\s|\t)*\)(\s|\t)*\{?', s)
		#if args is not None:
		#	res['args'] = args.group('args').split(',')
		proto = re.match(r'^(?P<parent>..*)\.prototype\.(?P<name>..*)(\s|\t)*=', s)
		if proto is not None:
			res['name'] = proto.group('name')
			res['parent'] = proto.group('parent')
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
		res['type'] = 'data'
		
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

lang['js'] = jsExtract

def buildTagParsingRegexp(l):
	res = []
	for i in l:
		res.append(r'((?P<'+i['name']+'>'+i['pref']+'[\w]+)(\s|\t)*(?P<'+i['name']+'_rest>.*))');
	return r'|'.join(res)

#this function should unite the two above
def getCommentData(uri, tags, decl, extension='js',pref='/*', suf='*/'):
	eset = {'header':{}, 'content':[]}
	reg_str = buildTagParsingRegexp(tags)
	tag_re = re.compile(reg_str)
	strip_re = re.compile(r"^(/\*|\*)?\**(?P<let_me_see_you_stripped>.*)(\s|\t)*\**(\*|\*/)?$")
	
	flag = False
	one_more = False
	first = None
	e = {}
	
	f = open(uri, 'r')
	for line in f:

		line = line.strip()
		stripped = line
		
		if line.startswith(pref):
			flag = True;
			e = {}
			for tag in tags:
				e[tag['name']] = {}
		
			tag_name = None
			tp = None
			
		
		#each comment line
		if flag and not one_more:
		
			st = strip_re.match(line)
			if st is not None:
				stripped = st.group('let_me_see_you_stripped').strip() #rammstein version
			
				
			if tag_name is None:
				tag_name = 'description'
				tp = 'doc'
				
			tag_data = parseCommentLine(stripped, tags, tag_re)
			
			if tag_data is not None:
				tp = tag_data['type']
				tag_name = tag_data['name']	

			if tag_name not in e[tp]:
				e[tp][tag_name] = []
			if tag_data is not None and tag_name in decl[tp]:
				res = decl[tp][tag_name](tag_data['rest'])
				if res is not None:
					e[tp][tag_name].append(res)
		
			if tag_data is None:
				ln = len(e[tp][tag_name])
				if ln > 0:
					dtype = type(e[tp][tag_name][ln-1])
					if dtype is dict and 'description' in e[tp][tag_name][ln-1]:
						e[tp][tag_name][ln-1]['description']+= '\n'+stripped
					elif dtype is str:	
						e[tp][tag_name][ln-1]+= '\n'+stripped
				else:
					e[tp][tag_name].append(stripped)
		
		#On last line, that usualy contains the function, class or data related to the documentation
		if one_more:
			
			if 'doc' in e and 'description' in e['doc']:
				for i, el in enumerate(e['doc']['description']):
					e['doc']['description'][i] = e['doc']['description'][i].strip('\n')
				e['doc']['excerpt'] = e['doc']['description'][0].split('\n')[0]
			
			if first is None and e is not None and e['doc'] is not None:
				first = e['doc']
			if not eset['header']:
				if e is not None:
					for tag in e['doc']:
						if 'file' in tag:
							eset['header'] = e['doc'];
							e = None
							break
			
			fn_info = lang[extension](stripped)
			if fn_info is not None and 'name' in fn_info:
				for f in fn_info:
					e[f] = fn_info[f]
			else:
				e = None
			
			if flag and e is not None:
				eset['content'].append(e)
				
				
			one_more = False
			flag = False
			
		
		if line.endswith(suf):
			one_more = True;
	
	if not eset['header'] and first is not None:
		if 'file' not in first:
			first['file'] = first['description']
		eset['header'] = first
		
	return eset

def parseCommentLine(line, tags, tag_re):
	res = {
		'type': None,
		'name': None,
		'rest': None
	}
	s = tag_re.match(line)
	if s is not None:
		for tag in tags:
			if s.group(tag['name']) is not None:
				res['type'] = tag['name']
				break
		res['name'] = s.group(res['type'])[1:]
		res['rest'] = s.group(res['type']+'_rest')
		
		return res

mdf = open('README.md', 'r')
md = mdf.read()
print markdown.markdown(md)

def doFile(root, uri, collector, extension='js'):
	ext = '.'+extension
	if uri.endswith(ext):
		iden = '.'.join(uri[len(root):-len(ext)].split(os.sep))
		#res = collectComments(uri)
		#result = parseCommentCollection(res[1], tags, decl, extension)
		result = getCommentData(uri, tags, decl, extension)
		if not result['content'] and not result['header']:
			return
		result['header']['uri'] = uri
		result['header']['id'] = iden
		collector[iden] = result

def outputResult(uri, collector):
	f = open(uri, 'w')
	f.write('var dipdoc = '+json.dumps(collector,indent=4))
	f.close()
	
def run(lang, url, skip, exclude_hidden=True):
	data = {}
	modskip = []
	for i in skip:
		modskip.append(os.path.join(url, i))
	skip = modskip
	print skip
	for root, dirs, files in os.walk(url):
		loc = root
		print root
		if exclude_hidden:
			for d in dirs:
				if d.startswith('.'):
					dirs.remove(d)
		
		if loc in skip:
			for d in dirs:
				dirs.remove(d)
			continue
			
		for f in files:
			fpath = os.path.join(root, f)
			locfpath = os.path.join(loc, f)
			if locfpath in skip:
				continue
			doFile(url, fpath, data, lang)
	
	container = {}
	container['data'] = data
	container['details'] = {}
	container['details']['lang'] = lang
	container['details']['root'] = url
	
	#XXX: only temporary
	outputResult('dipdoc.json', container)

run('js','ivartech', ['third-party','plugins'])
