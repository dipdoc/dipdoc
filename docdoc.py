# DocDoc - JSDOC + Unit Tests
# Author: Nikola Stamatovic Stamat

#TODO: MODULARIZE(multy language support) AND COMMENT! :P

# $prepare var m1 = ivar.data.Map({something: lol})

# assert can be equal stricEqual deepEqual
# $assert equal this(m1) params('hello', 1) result(true) Some message for information
import re
import markdown
import pprint

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
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<name>(\[(\s|\t)*[a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?(\s|\t)*\])|([a-zA-Z_$][a-zA-Z0-9_$.]*(\s|\t)*(=([0-9.]*|(true|false|undefined|null)|(\{.*\})|(\[.*\])|(".*")|(\'.*\')))?))(\s|\t)*(?P<text>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['name'] = prop.group('name').strip()
		res['mandatory'] = False
		mand = re.match(r'^\[(.*)\]$', res['name'])
		if mand is not None:
			res['mandatory'] = True
			res['name'] = mand.group(1)
		res['text'] = prop.group('text')
		return res
	
decl['doc']['param'] = parseParam

def parseReturn(s):
	res = {}
	prop = re.match('^(\{(?P<type>.*)\})(\s|\t)*(?P<text>.*)$', s)
	if prop is not None:
		res['type'] = prop.group('type').split('|')
		res['text'] = prop.group('text')
		return res
		
decl['doc']['return'] = parseReturn
	
decl['doc']['property'] = parseParam
	
decl['doc']['this'] = stripCurlyBrackets

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
	return
decl['doc']['todo'] = parseToDo

decl['unit']['prepare'] = asIs
decl['unit']['assert'] = asIs

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
		args = re.match(r'.*function(\s|\t)*.*(\s|\t)*\((\s|\t)*(?P<args>([a-zA-Z_$][a-zA-Z0-9_$]*(\s|\t)*,(\s|\t)*)*([a-zA-Z_$][a-zA-Z0-9_$]*)?)(\s|\t)*\)(\s|\t)*\{?', s)
		if args is not None:
			res['args'] = args.group('args').split(',')
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

def collectComments(uri, pref='/*', suf='*/'):
	a = []
	temp = []
	flag = False
	one_more = False
	
	f = open(uri, 'r')
	for line in f:

		line = line.strip()
	
		if line.startswith(pref):
			flag = True;
		
		if flag:
			temp.append(line)
		
		if one_more:
			one_more = False
			flag = False
			a.append(temp)
			temp = []
	
		if line.startswith(suf):
			one_more = True;
	return uri,a

def buildTagParsingRegexp(l):
	res = []
	for i in l:
		res.append(r'(^(?P<'+i['name']+'>'+i['pref']+'[\w]+)(\s|\t)*(?P<'+i['name']+'_rest>.*))');
	return r'|'.join(res)

def parseCommentCollection(col, tags, decl):
	eset = {'header':{}, 'content':[]}
	reg_str = buildTagParsingRegexp(tags)
	tag_re = re.compile(reg_str)
	strip_re = re.compile(r"^(/\*|\*)?\**(?P<let_me_see_you_stripped>.*)(\s|\t)*\**(\*|\*/)?$")
	
	for i in col:
		e = {}
		for tag in tags:
			e[tag['name']] = {}
		
		tag_name = None
		end = False
		tp = None
		
		for j in i:
			j = j.strip()
			if not end:
				end = re.match(r'\*/$', j) is not None
				
			st = strip_re.match(j)
			if st is not None:
				j = st.group('let_me_see_you_stripped').strip()
			
			s = tag_re.match(j)
			if s is not None:
				for tag in tags:
					if s.group(tag['name']) is not None:
						tp = tag['name']
						break

				tag_name = s.group(tp)[1:]
			
			if not end:
				if tag_name is None:
					tag_name = 'description'
					tp = 'doc'
				if j is not '':
					if tag_name not in e[tp]:
						e[tp][tag_name] = []
					if tag_name in decl[tp] and s is not None:
						e[tp][tag_name].append(decl[tp][tag_name](s.group(tp+'_rest')))
					
					ln = len(e[tp][tag_name])
					if s is None: 
						if ln > 0:
							e[tp][tag_name][ln-1] += '\n'+j 
						else:
							e[tp][tag_name].append(j)
							
			
			else:
				j = i[len(i)-1].strip()
				
				if 'header' not in e:
					for tag in e['doc']:
						if 'file' in tag:
							eset['header'] = e['doc'];
							e = None
				
				
				fn_info = lang['js'](j)
				if fn_info is not None and 'name' in fn_info:
					for f in fn_info:
						e[f] = fn_info[f]
				else:
					e = None
				#test here if the last line is valid for extraction or is it a file header comment, flag it
				tag_name = None
				end = False
				break
		#add it if the last line is valid
		if e is not None:
			eset['content'].append(e)
	return eset

mdf = open('README.md', 'r')
md = mdf.read()
print markdown.markdown(md)

uri = 'Communication.js'
res = collectComments(uri)
result = parseCommentCollection(res[1], tags, decl)
result['header']['uri'] = uri 
pp = pprint.PrettyPrinter(indent=4)
print pp.pprint(result)
